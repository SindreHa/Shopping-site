import { Router } from 'express';
import { ordersController } from '../server';

const router = Router();

router.post('/orders', ordersController.placeOrder.bind(ordersController));

export default router;
