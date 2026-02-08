/**
 * Signed URL Refresh Manager
 * Handles automatic refresh of expiring video URLs
 */

export interface SignedUrl {
    url: string;
    expiresAt: Date;
    videoId: string;
}

type RefreshCallback = (newUrl: string) => void;

// Buffer time before expiry to refresh (5 minutes)
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

/**
 * URL Refresh Manager
 * Automatically refreshes signed URLs before they expire
 */
export class UrlRefreshManager {
    private currentUrl: SignedUrl | null = null;
    private refreshTimer: NodeJS.Timeout | null = null;
    private onRefresh: RefreshCallback | null = null;
    private refreshEndpoint: string;

    constructor(refreshEndpoint: string = '/api/video/refresh-url') {
        this.refreshEndpoint = refreshEndpoint;
    }

    /**
     * Set the current URL and start monitoring expiry
     */
    setUrl(url: string, expiresAt: Date, videoId: string, onRefresh: RefreshCallback): void {
        this.currentUrl = { url, expiresAt, videoId };
        this.onRefresh = onRefresh;
        this.scheduleRefresh();
    }

    /**
     * Get time until URL expires in milliseconds
     */
    getTimeUntilExpiry(): number {
        if (!this.currentUrl) return 0;
        return this.currentUrl.expiresAt.getTime() - Date.now();
    }

    /**
     * Check if URL is expired or about to expire
     */
    isExpiringSoon(): boolean {
        return this.getTimeUntilExpiry() < REFRESH_BUFFER_MS;
    }

    /**
     * Schedule URL refresh
     */
    private scheduleRefresh(): void {
        this.clearTimer();

        const timeUntilRefresh = this.getTimeUntilExpiry() - REFRESH_BUFFER_MS;

        if (timeUntilRefresh <= 0) {
            // Already needs refresh
            this.refreshNow();
            return;
        }

        this.refreshTimer = setTimeout(() => {
            this.refreshNow();
        }, timeUntilRefresh);
    }

    /**
     * Refresh the URL now
     */
    async refreshNow(): Promise<string | null> {
        if (!this.currentUrl) return null;

        try {
            const response = await fetch(this.refreshEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId: this.currentUrl.videoId }),
            });

            if (!response.ok) {
                throw new Error('Failed to refresh URL');
            }

            const data = await response.json();

            // Update current URL
            this.currentUrl = {
                url: data.url,
                expiresAt: new Date(data.expiresAt),
                videoId: this.currentUrl.videoId,
            };

            // Notify callback
            if (this.onRefresh) {
                this.onRefresh(data.url);
            }

            // Schedule next refresh
            this.scheduleRefresh();

            return data.url;
        } catch (error) {
            console.error('Error refreshing video URL:', error);
            return null;
        }
    }

    /**
     * Clear refresh timer
     */
    private clearTimer(): void {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    /**
     * Cleanup
     */
    destroy(): void {
        this.clearTimer();
        this.currentUrl = null;
        this.onRefresh = null;
    }
}

/**
 * Parse expiry time from a signed URL (for S3-style URLs)
 */
export function parseExpiryFromUrl(url: string): Date | null {
    try {
        const urlObj = new URL(url);

        // Try different parameter names
        const expiresParams = ['Expires', 'X-Amz-Expires', 'expires', 'exp'];

        for (const param of expiresParams) {
            const value = urlObj.searchParams.get(param);
            if (value) {
                // Handle Unix timestamp
                const timestamp = parseInt(value, 10);
                if (!isNaN(timestamp)) {
                    // If very large, it's already in milliseconds
                    return new Date(timestamp > 9999999999 ? timestamp : timestamp * 1000);
                }
            }
        }

        // Default: assume 1 hour expiry
        return new Date(Date.now() + 60 * 60 * 1000);
    } catch {
        return null;
    }
}
