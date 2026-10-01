import { Injectable, Signal, signal } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsRepository {
    private _products$ = signal<Product[]>([]);

    public setProducts(products: Product[]): void {
        this._products$.set(products);
    }

    public products$(): Signal<Product[]> {
        return this._products$.asReadonly();
    }

    public products(): Product[] {
        return this._products$();
    }

    public upsertProduct(product: Product): void {
        this._products$.update(products =>
            products.some(p => p.id === product.id)
                ? products.map(p => (p.id === product.id ? product : p))
                : [...products, product]
        );
    }

    public removeProduct(id: string): void {
        this._products$.update(products => products.filter(p => p.id !== id));
    }
}
