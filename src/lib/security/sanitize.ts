/**
 * Input Sanitization Utility
 * Prevents XSS, SQL injection, and other attacks
 */

/**
 * Escape HTML special characters
 */
export function escapeHtml(str: string): string {
    const htmlEscapes: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;",
    };

    return str.replace(/[&<>"'/]/g, (char) => htmlEscapes[char]);
}

/**
 * Strip HTML tags
 */
export function stripHtml(str: string): string {
    return str.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize user input for general text
 */
export function sanitizeText(input: string | undefined | null): string {
    if (!input) return "";

    return input
        .trim()
        .replace(/\0/g, "") // Remove null bytes
        .slice(0, 10000); // Limit length
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(input: string | undefined | null): string {
    if (!input) return "";

    return input
        .toLowerCase()
        .trim()
        .replace(/[<>'"]/g, "") // Remove dangerous chars
        .slice(0, 254); // Max email length
}

/**
 * Sanitize username
 */
export function sanitizeUsername(input: string | undefined | null): string {
    if (!input) return "";

    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_-]/g, "") // Only alphanumeric, underscore, hyphen
        .slice(0, 50);
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(input: string | undefined | null): string {
    if (!input) return "";

    const url = input.trim();

    // Block javascript: and data: URIs
    if (/^(javascript|data|vbscript):/i.test(url)) {
        return "";
    }

    // Ensure starts with http:// or https:// or /
    if (!/^(https?:\/\/|\/)/i.test(url)) {
        return "";
    }

    return url;
}

/**
 * Sanitize file path
 */
export function sanitizePath(input: string | undefined | null): string {
    if (!input) return "";

    return input
        .replace(/\.\./g, "") // Prevent directory traversal
        .replace(/[<>:"|?*]/g, "") // Remove invalid path chars
        .trim();
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(input: string | undefined | null): string {
    if (!input) return "";

    return input
        .trim()
        .replace(/[<>"'`;]/g, "") // Remove dangerous chars
        .slice(0, 200);
}

/**
 * Sanitize for SQL LIKE queries (escape wildcards)
 */
export function sanitizeForLike(input: string): string {
    return input
        .replace(/\\/g, "\\\\")
        .replace(/%/g, "\\%")
        .replace(/_/g, "\\_");
}

/**
 * Validate and sanitize UUID
 */
export function sanitizeUuid(input: string | undefined | null): string | null {
    if (!input) return null;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const cleaned = input.trim().toLowerCase();

    if (uuidRegex.test(cleaned)) {
        return cleaned;
    }

    return null;
}

/**
 * Sanitize integer input
 */
export function sanitizeInt(
    input: string | number | undefined | null,
    min: number = Number.MIN_SAFE_INTEGER,
    max: number = Number.MAX_SAFE_INTEGER
): number | null {
    if (input === undefined || input === null) return null;

    const num = typeof input === "string" ? parseInt(input, 10) : input;

    if (isNaN(num) || !isFinite(num)) return null;

    return Math.min(Math.max(Math.floor(num), min), max);
}

/**
 * Sanitize object keys (prevent prototype pollution)
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const dangerous = ["__proto__", "constructor", "prototype"];

    const sanitized = { ...obj };

    for (const key of dangerous) {
        delete (sanitized as Record<string, unknown>)[key];
    }

    return sanitized;
}

/**
 * Rate limit key generator
 */
export function generateRateLimitKey(
    identifier: string,
    action: string
): string {
    const sanitized = identifier.replace(/[^a-zA-Z0-9_-]/g, "");
    return `rate:${action}:${sanitized}`;
}

/**
 * Check if input contains suspicious patterns
 */
export function containsSuspiciousPatterns(input: string): boolean {
    const patterns = [
        /<script/i,
        /javascript:/i,
        /on\w+=/i, // onclick, onerror, etc
        /\beval\(/i,
        /document\./i,
        /window\./i,
        /\balert\(/i,
        /\bprompt\(/i,
        /\bconfirm\(/i,
        /data:text\/html/i,
    ];

    return patterns.some(pattern => pattern.test(input));
}
