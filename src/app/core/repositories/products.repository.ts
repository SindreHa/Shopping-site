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
}
