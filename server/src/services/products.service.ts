import { randomUUID } from 'node:crypto';
import { EventBus } from '../infrastructure/event-bus';
import { Store } from '../infrastructure/json-file-store';
import { Product, ProductInput } from '../models/product.model';

export type StockReservation =
    | { ok: true }
    | { ok: false; reason: 'not_found'; productId: string }
    | {
          ok: false;
          reason: 'insufficient_stock';
          productId: string;
          available: number;
          requested: number;
      };

export class ProductsService {
    private readonly products = new Map<string, Product>();

    constructor(
        private readonly store: Store<Product[]>,
        private readonly events: EventBus,
        seed: () => Product[]
    ) {
        for (const product of store.read(seed)) {
            this.products.set(product.id, product);
        }
    }

    public list(): Product[] {
        return [...this.products.values()].map(product => ({ ...product }));
    }

    public get(id: string): Product | undefined {
        const product = this.products.get(id);
        return product && { ...product };
    }

    public create(input: ProductInput): Product {
        const product: Product = { id: randomUUID(), ...input };
        this.products.set(product.id, product);
        this.commit([product]);
        return { ...product };
    }

    public update(id: string, input: ProductInput): Product | undefined {
        if (!this.products.has(id)) {
            return undefined;
        }
        const product: Product = { ...input, id };
        this.products.set(id, product);
        this.commit([product]);
        return { ...product };
    }

    public delete(id: string): boolean {
        if (!this.products.delete(id)) {
            return false;
        }
        void this.store.write(this.list());
        this.events.publish({ type: 'product.deleted', productId: id });
        return true;
    }

    /** All-or-nothing: either every quantity is reserved or stock is left untouched. */
    public reserveStock(quantities: ReadonlyMap<string, number>): StockReservation {
        for (const [productId, requested] of quantities) {
            const product = this.products.get(productId);
            if (!product) {
                return { ok: false, reason: 'not_found', productId };
            }
            if (product.stock < requested) {
                return {
                    ok: false,
                    reason: 'insufficient_stock',
                    productId,
                    available: product.stock,
                    requested,
                };
            }
        }

        const changed: Product[] = [];
        for (const [productId, requested] of quantities) {
            const product = this.products.get(productId)!;
            product.stock -= requested;
            changed.push(product);
        }
        this.commit(changed);
        return { ok: true };
    }

    private commit(changed: Product[]): void {
        void this.store.write(this.list());
        for (const product of changed) {
            this.events.publish({ type: 'product.upserted', product: { ...product } });
        }
    }
}
