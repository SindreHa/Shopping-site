import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { AppConfig } from '../config';
import { Store } from '../infrastructure/json-file-store';

interface Credentials {
    username: string;
    salt: string;
    hash: string;
}

export interface AuthSecrets {
    jwtSecret?: string;
    admin?: Credentials;
}

export interface AdminSession {
    username: string;
    /** Unix seconds. */
    expiresAt: number;
}

export interface IssuedToken {
    token: string;
    username: string;
    expiresAt: string;
}

const KEY_LENGTH = 64;
const ISSUER = 'shopping-site';

const deriveKey = (password: string, salt: Buffer): Promise<Buffer> =>
    new Promise((resolve, reject) =>
        scrypt(password, salt, KEY_LENGTH, (error, key) => (error ? reject(error) : resolve(key)))
    );

const sha256 = (value: string): Buffer => createHash('sha256').update(value).digest();

const hashCredentials = async (username: string, password: string): Promise<Credentials> => {
    const salt = randomBytes(16);
    const hash = await deriveKey(password, salt);
    return { username, salt: salt.toString('base64'), hash: hash.toString('base64') };
};

const matches = async (credentials: Credentials, password: string): Promise<boolean> => {
    const candidate = await deriveKey(password, Buffer.from(credentials.salt, 'base64'));
    return timingSafeEqual(candidate, Buffer.from(credentials.hash, 'base64'));
};

export class AuthService {
    /** Changes whenever the password changes, so old tokens stop working. */
    private readonly credentialsVersion: string;

    private constructor(
        private readonly jwtSecret: string,
        private readonly credentials: Credentials,
        private readonly tokenTtlSeconds: number
    ) {
        this.credentialsVersion = sha256(credentials.hash).toString('base64url').slice(0, 12);
    }

    /**
     * Uses ADMIN_PASSWORD / JWT_SECRET when set. Otherwise generates them on first start
     * and persists only the password hash and secret, so restarts keep sessions valid.
     */
    public static async create(
        config: AppConfig,
        store: Store<AuthSecrets>
    ): Promise<{ auth: AuthService; generatedPassword?: string }> {
        const stored = store.read(() => ({}));
        const jwtSecret =
            config.jwtSecret ?? stored.jwtSecret ?? randomBytes(48).toString('base64url');

        let generatedPassword: string | undefined;
        let credentials: Credentials;
        const storedAdmin =
            stored.admin?.username === config.admin.username ? stored.admin : undefined;

        if (config.admin.password) {
            credentials =
                storedAdmin && (await matches(storedAdmin, config.admin.password))
                    ? storedAdmin
                    : await hashCredentials(config.admin.username, config.admin.password);
        } else if (storedAdmin) {
            credentials = storedAdmin;
        } else {
            generatedPassword = randomBytes(12).toString('base64url');
            credentials = await hashCredentials(config.admin.username, generatedPassword);
        }

        await store.write({
            jwtSecret: config.jwtSecret ? stored.jwtSecret : jwtSecret,
            admin: credentials,
        });

        return {
            auth: new AuthService(jwtSecret, credentials, config.admin.tokenTtlSeconds),
            generatedPassword,
        };
    }

    public async verifyCredentials(username: string, password: string): Promise<boolean> {
        const passwordMatches = await matches(this.credentials, password);
        const usernameMatches = timingSafeEqual(
            sha256(username),
            sha256(this.credentials.username)
        );
        return passwordMatches && usernameMatches;
    }

    public issueToken(username: string): IssuedToken {
        const token = jwt.sign({ role: 'admin', cv: this.credentialsVersion }, this.jwtSecret, {
            subject: username,
            issuer: ISSUER,
            algorithm: 'HS256',
            expiresIn: this.tokenTtlSeconds,
        });
        const { exp } = jwt.decode(token) as jwt.JwtPayload;
        return { token, username, expiresAt: new Date(exp! * 1000).toISOString() };
    }

    public verifyToken(token: string): AdminSession | null {
        try {
            const payload = jwt.verify(token, this.jwtSecret, {
                algorithms: ['HS256'],
                issuer: ISSUER,
            });
            if (
                typeof payload === 'string' ||
                payload.role !== 'admin' ||
                payload.cv !== this.credentialsVersion ||
                !payload.sub ||
                !payload.exp
            ) {
                return null;
            }
            return { username: payload.sub, expiresAt: payload.exp };
        } catch {
            return null;
        }
    }
}
