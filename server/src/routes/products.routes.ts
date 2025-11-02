import { Router } from 'express';
import { productsController } from '../server';

const router = Router();

router.get('/', productsController.getAllProducts.bind(productsController));

export default router;
