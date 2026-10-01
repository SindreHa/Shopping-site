import { Request, Response } from 'express';
import { CustomerDetails, OrderItem } from '../models/order.model';
import { ProductsController } from './products.controller';

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.trim().length > 0;

const isValidCustomer = (value: unknown): value is CustomerDetails => {
    const customer = value as Partial<CustomerDetails> | undefined;
    return isNonEmptyString(customer?.name) && isNonEmptyString(customer?.address);
};

const isValidItem = (value: unknown): value is OrderItem => {
    const item = value as Partial<OrderItem> | undefined;
    return (
        isNonEmptyString(item?.productId) &&
        Number.isInteger(item?.quantity) &&
        (item?.quantity ?? 0) > 0
    );
};

export class OrdersController {
    private productsController: ProductsController;

    constructor(productsController: ProductsController) {
        this.productsController = productsController;
    }

    public placeOrder(req: Request, res: Response): void {
        const { items, customerDetails } = req.body ?? {};

        if (!Array.isArray(items) || items.length === 0 || !isValidCustomer(customerDetails)) {
            res.status(400).json({
                message: 'Invalid order data. Missing items or customerDetails.',
            });
            return;
        }

        if (!items.every(isValidItem)) {
            res.status(400).json({ message: 'Each item needs a productId and a positive quantity.' });
            return;
        }

        // Sum per product so duplicate lines can't bypass the stock check
        const quantities = new Map<string, number>();
        for (const { productId, quantity } of items) {
            quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
        }

        // Check all items before touching stock so a failed order changes nothing
        for (const [productId, quantity] of quantities) {
            const currentStock = this.productsController.getProductStock(productId);
            if (currentStock === null) {
                res.status(404).json({ message: 'Product not found', productId });
                return;
            }
            if (currentStock < quantity) {
                res.status(400).json({
                    message: 'Insufficient stock',
                    productId,
                    availableStock: currentStock,
                    requestedQuantity: quantity,
                });
                return;
            }
        }

        for (const [productId, quantity] of quantities) {
            this.productsController.updateProductStock(productId, quantity);
        }

        res.status(201).json({
            message: 'Order placed successfully for customer ' + customerDetails.name,
        });
    }
}
