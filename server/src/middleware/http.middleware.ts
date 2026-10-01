import { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodType } from 'zod';
import { AuthService } from '../services/auth.service';

export const validateBody =
    (schema: ZodType): RequestHandler =>
    (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                message: 'Invalid request body',
                issues: result.error.issues.map(issue => ({
                    path: issue.path.join('.'),
                    message: issue.message,
                })),
            });
            return;
        }
        req.body = result.data;
        next();
    };

export const requireAdmin =
    (auth: AuthService): RequestHandler =>
    (req, res, next) => {
        const header = req.get('authorization');
        const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
        const session = token ? auth.verifyToken(token) : null;

        if (!session) {
            res.status(401)
                .set('WWW-Authenticate', 'Bearer')
                .json({ message: 'Authentication required' });
            return;
        }

        res.locals.admin = session;
        next();
    };

export const securityHeaders: RequestHandler = (_req, res, next) => {
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'no-referrer',
        'Cache-Control': 'no-store',
    });
    next();
};

export const notFound: RequestHandler = (_req, res) => {
    res.status(404).json({ message: 'Not found' });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error?.type === 'entity.parse.failed') {
        res.status(400).json({ message: 'Malformed JSON body' });
        return;
    }
    if (error?.type === 'entity.too.large') {
        res.status(413).json({ message: 'Request body too large' });
        return;
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
};
