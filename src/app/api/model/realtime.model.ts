import { Product } from '../../core/models/product.model';
import { Order } from './order.model';

/** Mirrors server/src/models/realtime.model.ts */
export type ServerMessage =
    | { type: 'product.upserted'; product: Product }
    | { type: 'product.deleted'; productId: string }
    | { type: 'order.placed'; order: Order }
    | { type: 'presence'; online: number }
    | { type: 'auth.ok'; username: string }
    | { type: 'auth.failed' };

export type ServerMessageType = ServerMessage['type'];

export type ServerMessageOf<T extends ServerMessageType> = Extract<ServerMessage, { type: T }>;

export type ClientMessage = { type: 'auth'; token: string } | { type: 'deauth' };
