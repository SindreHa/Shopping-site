import { Router } from 'express';
import { OrdersController } from '../controllers/orders.controller';

const router = Router();
const ordersController = new OrdersController();

router.post('/orders', ordersController.placeOrder);

export default router;