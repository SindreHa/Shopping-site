import express from 'express';
import bodyParser from 'body-parser';
import productsRoutes from './routes/products.routes';
import ordersRoutes from './routes/orders.routes';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.json());

app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
