import { PlaceOrderRequest } from '../models/order.model';
import { ProductsController } from './products.controller';

export class OrdersController {
    private productsController: ProductsController;

    constructor(productsController: ProductsController) {
        this.productsController = productsController;
    }

    public placeOrder(req: any, res: any): void {
        const orderData: PlaceOrderRequest = req.body;

        if (!orderData.items || !orderData.customerDetails) {
            res.status(400).json({
                message: 'Invalid order data. Missing items or customerDetails.',
            });
            return;
        }

        const { items, customerDetails } = orderData;

        for (const { productId, quantity } of items) {
            if (!this.productsController.checkAvailability(productId, quantity)) {
                const currentStock = this.productsController.getProductStock(productId);
                if (currentStock == null) {
                    res.status(404).json({ message: 'Product not found' });
                    return;
                }
                res.status(400).json({
                    message: 'Insufficient stock',
                    productId,
                    availableStock: currentStock,
                    requestedQuantity: quantity,
                });
                return;
            }

            const stockUpdated = this.productsController.updateProductStock(productId, quantity);
            if (!stockUpdated) {
                res.status(500).json({ message: 'Failed to update product stock' });
                return;
            }
        }

        res.status(201).json({
            message: 'Order placed successfully for customer ' + customerDetails.name,
        });
    }
}
