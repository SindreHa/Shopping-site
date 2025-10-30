import express from 'express';
import bodyParser from 'body-parser';
import productsRoutes from './routes/products.routes';
import ordersRoutes from './routes/orders.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});