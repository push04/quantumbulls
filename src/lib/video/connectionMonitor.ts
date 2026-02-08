/**
 * Connection Monitor
 * Tracks network connectivity and handles retries
 */

export type ConnectionStatus = 'online' | 'offline' | 'slow' | 'reconnecting';

export interface ConnectionState {
    status: ConnectionStatus;
    retryCount: number;
    retryIn: number; // seconds until next retry
}

type ConnectionCallback = (state: ConnectionState) => void;

/**
 * Connection Monitor Class
 * Detects connection drops and manages retry logic
 */
export class ConnectionMonitor {
    private status: ConnectionStatus = 'online';
    private retryCount = 0;
    private retryTimer: NodeJS.Timeout | null = null;
    private callbacks: Set<ConnectionCallback> = new Set();
    private maxRetries = 5;
    private baseRetryDelay = 2000; // 2 seconds

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', this.handleOnline);
            window.addEventListener('offline', this.handleOffline);
        }
    }

    /**
     * Subscribe to connection state changes
     */
    subscribe(callback: ConnectionCallback): () => void {
        this.callbacks.add(callback);
        callback(this.getState());

        return () => {
            this.callbacks.delete(callback);
        };
    }

    /**
     * Get current connection state
     */
    getState(): ConnectionState {
        return {
            status: this.status,
            retryCount: this.retryCount,
            retryIn: this.getRetryDelay() / 1000,
        };
    }

    /**
     * Handle coming back online
     */
    private handleOnline = (): void => {
        this.status = 'online';
        this.retryCount = 0;
        this.clearRetryTimer();
        this.notifySubscribers();
    };

    /**
     * Handle going offline
     */
    private handleOffline = (): void => {
        this.status = 'offline';
        this.notifySubscribers();
        this.scheduleRetry();
    };

    /**
     * Manually trigger a connection issue (e.g., video loading failed)
     */
    reportConnectionIssue(): void {
        if (this.status !== 'reconnecting') {
            this.status = 'reconnecting';
            this.retryCount++;
            this.notifySubscribers();
            this.scheduleRetry();
        }
    }

    /**
     * Report successful connection
     */
    reportConnectionSuccess(): void {
        if (this.status !== 'online') {
            this.status = 'online';
            this.retryCount = 0;
            this.clearRetryTimer();
            this.notifySubscribers();
        }
    }

    /**
     * Get delay before next retry (exponential backoff)
     */
    private getRetryDelay(): number {
        // Exponential backoff: 2s, 4s, 8s, 16s, 30s max
        const delay = Math.min(
            this.baseRetryDelay * Math.pow(2, this.retryCount - 1),
            30000
        );
        return delay;
    }

    /**
     * Schedule a retry attempt
     */
    private scheduleRetry(): void {
        if (this.retryCount > this.maxRetries) {
            this.status = 'offline';
            this.notifySubscribers();
            return;
        }

        const delay = this.getRetryDelay();

        // Update countdown every second
        let remaining = delay;
        const countdownInterval = setInterval(() => {
            remaining -= 1000;
            if (remaining >= 0) {
                this.notifySubscribers();
            }
        }, 1000);

        this.retryTimer = setTimeout(() => {
            clearInterval(countdownInterval);

            // Check if we're back online
            if (navigator.onLine) {
                this.handleOnline();
            } else {
                this.retryCount++;
                this.scheduleRetry();
            }
        }, delay);
    }

    /**
     * Clear retry timer
     */
    private clearRetryTimer(): void {
        if (this.retryTimer) {
            clearTimeout(this.retryTimer);
            this.retryTimer = null;
        }
    }

    /**
     * Notify all subscribers of state change
     */
    private notifySubscribers(): void {
        const state = this.getState();
        this.callbacks.forEach(callback => callback(state));
    }

    /**
     * Cleanup
     */
    destroy(): void {
        this.clearRetryTimer();
        this.callbacks.clear();

        if (typeof window !== 'undefined') {
            window.removeEventListener('online', this.handleOnline);
            window.removeEventListener('offline', this.handleOffline);
        }
    }
}

// Singleton instance
let connectionMonitor: ConnectionMonitor | null = null;

export function getConnectionMonitor(): ConnectionMonitor {
    if (!connectionMonitor) {
        connectionMonitor = new ConnectionMonitor();
    }
    return connectionMonitor;
}
