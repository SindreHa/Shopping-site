import cors from 'cors';
import express, { Express } from 'express';
import { AppConfig } from './config';
import { AuthController } from './controllers/auth.controller';
import { OrdersController } from './controllers/orders.controller';
import { ProductsController } from './controllers/products.controller';
import {
    errorHandler,
    notFound,
    requireAdmin,
    securityHeaders,
} from './middleware/http.middleware';
import { authRoutes } from './routes/auth.routes';
import { ordersRoutes } from './routes/orders.routes';
import { productsRoutes } from './routes/products.routes';
import { AuthService } from './services/auth.service';
import { LoginRateLimiter } from './services/login-rate-limiter';
import { OrdersService } from './services/orders.service';
import { ProductsService } from './services/products.service';

export interface AppDependencies {
    config: AppConfig;
    products: ProductsService;
    orders: OrdersService;
    auth: AuthService;
    onlineCount: () => number;
}

export const createApp = ({
    config,
    products,
    orders,
    auth,
    onlineCount,
}: AppDependencies): Express => {
    const app = express();
    const adminOnly = requireAdmin(auth);
    const limiter = new LoginRateLimiter(config.login.maxAttempts, config.login.windowMs);

    app.disable('x-powered-by');
    app.use(securityHeaders);
    app.use(cors({ origin: config.allowedOrigins }));
    app.use(express.json({ limit: '100kb' }));

    app.get('/api/health', (_req, res) => {
        res.json({
            status: 'ok',
            uptimeSeconds: Math.round(process.uptime()),
            online: onlineCount(),
        });
    });
    app.use('/api/auth', authRoutes(new AuthController(auth, limiter), adminOnly));
    app.use('/api/products', productsRoutes(new ProductsController(products), adminOnly));
    app.use('/api/orders', ordersRoutes(new OrdersController(orders), adminOnly));

    app.use(notFound);
    app.use(errorHandler);

    return app;
};
