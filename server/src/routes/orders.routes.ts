import { RequestHandler, Router } from 'express';
import { OrdersController } from '../controllers/orders.controller';
import { validateBody } from '../middleware/http.middleware';
import { placeOrderSchema } from '../validation/schemas';

export const ordersRoutes = (
    controller: OrdersController,
    requireAdmin: RequestHandler
): Router => {
    const router = Router();
    router.post('/', validateBody(placeOrderSchema), controller.place);
    router.get('/', requireAdmin, controller.list);
    return router;
};
