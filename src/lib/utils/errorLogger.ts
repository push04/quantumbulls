/**
 * Error Logging Utility
 * Captures and logs errors with context for debugging
 */

import { createClient } from "@/lib/supabase/client";

interface ErrorContext {
    userId?: string;
    pageUrl: string;
    userAgent: string;
    timestamp: string;
    errorMessage: string;
    errorStack?: string;
    componentStack?: string;
    tags?: Record<string, string>;
}

/**
 * Log error to database
 */
export async function logError(
    error: Error,
    context: Partial<ErrorContext> = {}
): Promise<void> {
    const supabase = createClient();

    const errorData: ErrorContext = {
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        timestamp: new Date().toISOString(),
        errorMessage: error.message,
        errorStack: error.stack,
        ...context,
    };

    try {
        await supabase.from("error_logs").insert({
            user_id: errorData.userId,
            page_url: errorData.pageUrl,
            user_agent: errorData.userAgent,
            error_message: errorData.errorMessage,
            error_stack: errorData.errorStack,
            component_stack: errorData.componentStack,
            tags: errorData.tags,
            created_at: errorData.timestamp,
        });
    } catch (logError) {
        // Fallback to console if logging fails
        console.error("Failed to log error:", logError);
        console.error("Original error:", error);
    }
}

/**
 * Log API error
 */
export function logApiError(
    endpoint: string,
    method: string,
    status: number,
    response: unknown,
    userId?: string
): void {
    logError(new Error(`API Error: ${method} ${endpoint} - ${status}`), {
        userId,
        tags: {
            type: "api_error",
            endpoint,
            method,
            status: String(status),
        },
    });
}

/**
 * Log video playback error
 */
export function logVideoError(
    videoId: string,
    errorType: string,
    userId?: string
): void {
    logError(new Error(`Video Error: ${errorType}`), {
        userId,
        tags: {
            type: "video_error",
            videoId,
            errorType,
        },
    });
}

/**
 * Log payment error
 */
export function logPaymentError(
    errorCode: string,
    userId?: string
): void {
    logError(new Error(`Payment Error: ${errorCode}`), {
        userId,
        tags: {
            type: "payment_error",
            errorCode,
        },
    });
}

/**
 * Get error digest for displaying to users
 */
export function getErrorDigest(error: Error): string {
    const hash = error.message.split("").reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    return `ERR-${Math.abs(hash).toString(16).toUpperCase().slice(0, 8)}`;
}

/**
 * Format error for display
 */
export function formatErrorMessage(error: Error): string {
    const message = error.message || "An unexpected error occurred";

    // Clean up common error messages
    if (message.includes("fetch")) {
        return "Network error. Please check your connection.";
    }
    if (message.includes("timeout")) {
        return "Request timed out. Please try again.";
    }
    if (message.includes("401") || message.includes("unauthorized")) {
        return "Please log in to continue.";
    }
    if (message.includes("403") || message.includes("forbidden")) {
        return "You don't have permission to access this.";
    }
    if (message.includes("404") || message.includes("not found")) {
        return "The requested resource was not found.";
    }
    if (message.includes("500") || message.includes("server")) {
        return "Server error. We've been notified and are working on it.";
    }

    return message;
}

/**
 * Track error occurrence for rate limiting
 */
const errorCounts = new Map<string, { count: number; firstSeen: number }>();

export function shouldLogError(errorKey: string, maxPerHour: number = 10): boolean {
    const now = Date.now();
    const entry = errorCounts.get(errorKey);

    if (!entry) {
        errorCounts.set(errorKey, { count: 1, firstSeen: now });
        return true;
    }

    // Reset if more than an hour has passed
    if (now - entry.firstSeen > 3600000) {
        errorCounts.set(errorKey, { count: 1, firstSeen: now });
        return true;
    }

    // Check rate limit
    if (entry.count >= maxPerHour) {
        return false;
    }

    entry.count++;
    return true;
}
