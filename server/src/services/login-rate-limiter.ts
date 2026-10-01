interface Window {
    failures: number;
    resetAt: number;
}

/** Fixed-window limiter for failed logins, keyed by client IP. */
export class LoginRateLimiter {
    private readonly windows = new Map<string, Window>();

    constructor(
        private readonly maxFailures: number,
        private readonly windowMs: number,
        private readonly now: () => number = Date.now
    ) {}

    public retryAfterSeconds(key: string): number {
        const window = this.current(key);
        if (!window || window.failures < this.maxFailures) {
            return 0;
        }
        return Math.ceil((window.resetAt - this.now()) / 1000);
    }

    public recordFailure(key: string): void {
        this.prune();
        const window = this.current(key) ?? { failures: 0, resetAt: this.now() + this.windowMs };
        window.failures++;
        this.windows.set(key, window);
    }

    public reset(key: string): void {
        this.windows.delete(key);
    }

    private current(key: string): Window | undefined {
        const window = this.windows.get(key);
        return window && window.resetAt > this.now() ? window : undefined;
    }

    private prune(): void {
        const now = this.now();
        for (const [key, window] of this.windows) {
            if (window.resetAt <= now) {
                this.windows.delete(key);
            }
        }
    }
}
