import path from 'node:path';

const list = (value: string | undefined, fallback: string[]): string[] =>
    value
        ? value
              .split(',')
              .map(entry => entry.trim())
              .filter(Boolean)
        : fallback;

export interface AppConfig {
    port: number;
    allowedOrigins: string[];
    dataDir: string;
    seedProductsFile: string;
    admin: {
        username: string;
        /** When unset, a password is generated on first start and its hash persisted. */
        password: string | undefined;
        tokenTtlSeconds: number;
    };
    /** When unset, a secret is generated on first start and persisted. */
    jwtSecret: string | undefined;
    login: {
        maxAttempts: number;
        windowMs: number;
    };
    heartbeatIntervalMs: number;
}

export const loadConfig = (env: NodeJS.ProcessEnv = process.env): AppConfig => ({
    port: Number(env.PORT ?? 3000),
    allowedOrigins: list(env.CORS_ORIGINS, ['http://localhost:4200']),
    dataDir: env.DATA_DIR ?? path.join(__dirname, '../data'),
    seedProductsFile: path.join(__dirname, 'data/products.json'),
    admin: {
        username: env.ADMIN_USERNAME ?? 'admin',
        password: env.ADMIN_PASSWORD,
        tokenTtlSeconds: Number(env.ADMIN_TOKEN_TTL_SECONDS ?? 60 * 60 * 8),
    },
    jwtSecret: env.JWT_SECRET,
    login: {
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000,
    },
    heartbeatIntervalMs: 30_000,
});
