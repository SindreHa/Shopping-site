import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { EventBus } from '../infrastructure/event-bus';
import { MemoryStore } from '../infrastructure/json-file-store';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model';
import { DomainEvent } from '../models/realtime.model';
import { OrdersService } from './orders.service';
import { ProductsService } from './products.service';

const seed = (): Product[] => [
    { id: 'tv', name: 'TV', description: '', price: 100.1, stock: 3 },
    { id: 'mug', name: 'Mug', description: '', price: 5, stock: 1 },
];

describe('ProductsService + OrdersService', () => {
    let events: DomainEvent[];
    let productsStore: MemoryStore<Product[]>;
    let products: ProductsService;
    let orders: OrdersService;

    beforeEach(() => {
        const bus = new EventBus();
        events = [];
        bus.subscribe(event => events.push(event));
        productsStore = new MemoryStore<Product[]>();
        products = new ProductsService(productsStore, bus, seed);
        orders = new OrdersService(new MemoryStore<Order[]>(), products, bus);
    });

    it('places an order using server prices and publishes events', () => {
        const result = orders.place({
            items: [
                { productId: 'tv', quantity: 1 },
                { productId: 'tv', quantity: 1 },
                { productId: 'mug', quantity: 1 },
            ],
            customerDetails: { name: 'Ada', address: 'Somewhere 1' },
        });

        assert.ok(result.ok);
        assert.equal(result.order.total, 205.2);
        assert.deepEqual(
            result.order.lines.map(line => [line.productId, line.quantity]),
            [
                ['tv', 2],
                ['mug', 1],
            ]
        );
        assert.equal(products.get('tv')?.stock, 1);
        assert.equal(productsStore.data?.find(p => p.id === 'tv')?.stock, 1);
        assert.deepEqual(
            events.map(event => event.type),
            ['product.upserted', 'product.upserted', 'order.placed']
        );
    });

    it('rejects duplicate lines that together exceed stock, leaving stock untouched', () => {
        const result = orders.place({
            items: [
                { productId: 'tv', quantity: 1 },
                { productId: 'mug', quantity: 1 },
                { productId: 'mug', quantity: 1 },
            ],
            customerDetails: { name: 'Ada', address: 'Somewhere 1' },
        });

        assert.deepEqual(result, {
            ok: false,
            reason: 'insufficient_stock',
            productId: 'mug',
            available: 1,
            requested: 2,
        });
        assert.equal(products.get('tv')?.stock, 3);
        assert.equal(events.length, 0);
    });

    it('reports unknown products', () => {
        const result = orders.place({
            items: [{ productId: 'nope', quantity: 1 }],
            customerDetails: { name: 'Ada', address: 'Somewhere 1' },
        });
        assert.deepEqual(result, { ok: false, reason: 'not_found', productId: 'nope' });
    });

    it('creates, updates and deletes products', () => {
        const created = products.create({ name: 'Lamp', description: '', price: 20, stock: 4 });
        assert.equal(products.update(created.id, { ...created, stock: 9 })?.stock, 9);
        assert.equal(products.update('missing', { ...created }), undefined);
        assert.ok(products.delete(created.id));
        assert.equal(products.delete(created.id), false);
        assert.deepEqual(
            events.map(event => event.type),
            ['product.upserted', 'product.upserted', 'product.deleted']
        );
    });

    it('does not leak internal state through returned objects', () => {
        products.list()[0].stock = 999;
        assert.equal(products.get('tv')?.stock, 3);
    });
});
