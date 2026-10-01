import { RequestHandler, Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/http.middleware';
import { loginSchema } from '../validation/schemas';

export const authRoutes = (controller: AuthController, requireAdmin: RequestHandler): Router => {
    const router = Router();
    router.post('/login', validateBody(loginSchema), controller.login);
    router.get('/me', requireAdmin, controller.me);
    return router;
};
