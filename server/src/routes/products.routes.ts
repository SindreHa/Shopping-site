import { RequestHandler, Router } from 'express';
import { ProductsController } from '../controllers/products.controller';
import { validateBody } from '../middleware/http.middleware';
import { productInputSchema } from '../validation/schemas';

export const productsRoutes = (
    controller: ProductsController,
    requireAdmin: RequestHandler
): Router => {
    const router = Router();
    router.get('/', controller.list);
    router.post('/', requireAdmin, validateBody(productInputSchema), controller.create);
    router.put('/:id', requireAdmin, validateBody(productInputSchema), controller.update);
    router.delete('/:id', requireAdmin, controller.remove);
    return router;
};
