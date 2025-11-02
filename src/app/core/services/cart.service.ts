import { Injectable, signal, computed, Signal } from '@angular/core';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
    private _items$ = signal<CartItem[]>([]);
    public items$: Signal<CartItem[]> = this._items$.asReadonly();

    public total$ = computed<number>(() =>
        this._items$().reduce((sum, i) => sum + i.product.price * i.quantity, 0)
    );

    public add(product: Product): void {
        const existing = this._items$().find(i => i.product.id === product.id);
        if (existing) {
            existing.quantity++;
            this._items$.set([...this._items$()]);
        } else {
            this._items$.update(items => [...items, { id: product.id, product, quantity: 1 }]);
        }
    }

    public remove(id: number): void {
        this._items$.update(items => items.filter(i => i.id !== id));
    }

    public clear(): void {
        this._items$.set([]);
    }
}
