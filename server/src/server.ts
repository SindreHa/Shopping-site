import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { OrdersController } from './controllers/orders.controller';
import { Router } from 'express';
import { ProductsController } from './controllers/products.controller';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Initialize shared controllers
export const productsController = new ProductsController();
export const ordersController = new OrdersController(productsController);

const productsRouter = Router();
productsRouter.get('/', productsController.getAllProducts.bind(productsController));

// Orders routes
const ordersRouter = Router();
ordersRouter.post('/', ordersController.placeOrder.bind(ordersController));

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
