import { Injectable, Signal, signal } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({providedIn: 'root'})
export class ProductsRepository {
    private products$ = signal<Product[]>([]);

    public setProducts(products: Product[]): void {
        this.products$.set(products);
    }

    public getProducts(): Signal<Product[]> {
        return this.products$.asReadonly();
    }
}
