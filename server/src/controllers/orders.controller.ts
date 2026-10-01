import { RequestHandler } from 'express';
import { PlaceOrderRequest } from '../models/order.model';
import { OrdersService } from '../services/orders.service';

export class OrdersController {
    constructor(private readonly orders: OrdersService) {}

    public place: RequestHandler = (req, res) => {
        const request = req.body as PlaceOrderRequest;
        const result = this.orders.place(request);

        if (result.ok) {
            res.status(201).json({
                message: 'Order placed successfully for customer ' + request.customerDetails.name,
                order: result.order,
            });
            return;
        }

        if (result.reason === 'not_found') {
            res.status(404).json({ message: 'Product not found', productId: result.productId });
            return;
        }

        res.status(409).json({
            message: 'Insufficient stock',
            productId: result.productId,
            availableStock: result.available,
            requestedQuantity: result.requested,
        });
    };

    public list: RequestHandler = (_req, res) => {
        res.json(this.orders.list());
    };
}
