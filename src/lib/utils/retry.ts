/**
 * Retry Utility
 * Implements retry logic with exponential backoff
 */

interface RetryOptions {
    maxAttempts?: number;
    baseDelay?: number; // ms
    maxDelay?: number; // ms
    shouldRetry?: (error: unknown, attempt: number) => boolean;
    onRetry?: (error: unknown, attempt: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    shouldRetry: () => true,
    onRetry: () => { },
};

/**
 * Execute function with retry logic
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const config = { ...DEFAULT_OPTIONS, ...options };
    let lastError: unknown;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt === config.maxAttempts || !config.shouldRetry(error, attempt)) {
                throw error;
            }

            config.onRetry(error, attempt);

            // Calculate delay with exponential backoff + jitter
            const delay = Math.min(
                config.baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000,
                config.maxDelay
            );

            await sleep(delay);
        }
    }

    throw lastError;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry fetch with automatic retry on network errors
 */
export async function fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retryOptions: RetryOptions = {}
): Promise<Response> {
    return withRetry(
        async () => {
            const response = await fetch(url, options);

            // Retry on 5xx errors
            if (response.status >= 500) {
                throw new Error(`Server error: ${response.status}`);
            }

            return response;
        },
        {
            maxAttempts: 3,
            shouldRetry: (error, attempt) => {
                // Don't retry client errors
                if (error instanceof Response && error.status >= 400 && error.status < 500) {
                    return false;
                }
                return attempt < 3;
            },
            ...retryOptions,
        }
    );
}

/**
 * Create a retryable promise queue
 */
export class RetryQueue {
    private queue: Array<{
        fn: () => Promise<unknown>;
        resolve: (value: unknown) => void;
        reject: (error: unknown) => void;
        attempts: number;
    }> = [];
    private processing = false;
    private options: Required<RetryOptions>;

    constructor(options: RetryOptions = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
    }

    async add<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push({
                fn,
                resolve: resolve as (value: unknown) => void,
                reject,
                attempts: 0,
            });
            this.process();
        });
    }

    private async process() {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;

        while (this.queue.length > 0) {
            const item = this.queue.shift()!;
            item.attempts++;

            try {
                const result = await item.fn();
                item.resolve(result);
            } catch (error) {
                if (
                    item.attempts < this.options.maxAttempts &&
                    this.options.shouldRetry(error, item.attempts)
                ) {
                    // Requeue for retry
                    this.queue.unshift(item);
                    const delay = Math.min(
                        this.options.baseDelay * Math.pow(2, item.attempts - 1),
                        this.options.maxDelay
                    );
                    await sleep(delay);
                } else {
                    item.reject(error);
                }
            }
        }

        this.processing = false;
    }

    get pending(): number {
        return this.queue.length;
    }

    clear() {
        this.queue.forEach(item =>
            item.reject(new Error("Queue cleared"))
        );
        this.queue = [];
    }
}

/**
 * Webhook retry with increasing delays
 */
export async function retryWebhook(
    url: string,
    payload: unknown,
    options: {
        maxAttempts?: number;
        delays?: number[]; // Custom delay sequence in ms
    } = {}
): Promise<boolean> {
    const delays = options.delays || [0, 60000, 300000, 600000]; // 0, 1min, 5min, 10min
    const maxAttempts = options.maxAttempts || delays.length;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (attempt > 0 && delays[attempt]) {
            await sleep(delays[attempt]);
        }

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                return true;
            }

            // Don't retry 4xx errors
            if (response.status >= 400 && response.status < 500) {
                return false;
            }
        } catch {
            // Network error, will retry
        }
    }

    return false;
}
