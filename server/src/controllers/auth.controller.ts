import { RequestHandler } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginRateLimiter } from '../services/login-rate-limiter';

export class AuthController {
    constructor(
        private readonly auth: AuthService,
        private readonly limiter: LoginRateLimiter
    ) {}

    public login: RequestHandler = async (req, res) => {
        const clientKey = req.ip ?? 'unknown';
        const retryAfter = this.limiter.retryAfterSeconds(clientKey);

        if (retryAfter > 0) {
            res.status(429)
                .set('Retry-After', String(retryAfter))
                .json({ message: 'Too many login attempts. Try again later.' });
            return;
        }

        const { username, password } = req.body as { username: string; password: string };

        if (!(await this.auth.verifyCredentials(username, password))) {
            this.limiter.recordFailure(clientKey);
            res.status(401).json({ message: 'Invalid username or password' });
            return;
        }

        this.limiter.reset(clientKey);
        res.json(this.auth.issueToken(username));
    };

    public me: RequestHandler = (_req, res) => {
        res.json(res.locals.admin);
    };
}
