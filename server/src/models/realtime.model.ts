import { Order } from './order.model';
import { Product } from './product.model';

/** Events raised by the domain services. */
export type DomainEvent =
    | { type: 'product.upserted'; product: Product }
    | { type: 'product.deleted'; productId: string }
    | { type: 'order.placed'; order: Order };

/** Messages the server pushes over the WebSocket. */
export type ServerMessage =
    | DomainEvent
    | { type: 'presence'; online: number }
    | { type: 'auth.ok'; username: string }
    | { type: 'auth.failed' };

/** Messages clients may send over the WebSocket. */
export type ClientMessage = { type: 'auth'; token: string } | { type: 'deauth' };
