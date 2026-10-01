import { randomUUID } from 'node:crypto';
import { EventBus } from '../infrastructure/event-bus';
import { Store } from '../infrastructure/json-file-store';
import { Order, PlaceOrderRequest } from '../models/order.model';
import { ProductsService, StockReservation } from './products.service';

export type PlaceOrderResult = { ok: true; order: Order } | Exclude<StockReservation, { ok: true }>;

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

export class OrdersService {
    private readonly orders: Order[];

    constructor(
        private readonly store: Store<Order[]>,
        private readonly products: ProductsService,
        private readonly events: EventBus
    ) {
        this.orders = store.read(() => []);
    }

    /** Newest first. */
    public list(): Order[] {
        return [...this.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    public place({ items, customerDetails }: PlaceOrderRequest): PlaceOrderResult {
        // Sum per product so duplicate lines can't bypass the stock check
        const quantities = new Map<string, number>();
        for (const { productId, quantity } of items) {
            quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
        }

        const reservation = this.products.reserveStock(quantities);
        if (!reservation.ok) {
            return reservation;
        }

        // Prices come from the server's catalog, never from the client
        const lines = [...quantities].map(([productId, quantity]) => {
            const product = this.products.get(productId)!;
            return {
                productId,
                name: product.name,
                unitPrice: product.price,
                quantity,
                lineTotal: roundMoney(product.price * quantity),
            };
        });

        const order: Order = {
            id: randomUUID(),
            createdAt: new Date().toISOString(),
            customer: customerDetails,
            lines,
            total: roundMoney(lines.reduce((sum, line) => sum + line.lineTotal, 0)),
        };

        this.orders.push(order);
        void this.store.write(this.orders);
        this.events.publish({ type: 'order.placed', order });

        return { ok: true, order };
    }
}
