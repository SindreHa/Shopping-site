import { Injectable, Signal, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart-item.model';

@Injectable({ providedIn: 'root' })
export class CartRepository {
    private _items$ = signal<CartItem[]>([]);

    public addNewItem(product: Product): void {
        this._items$.update(items => [
            ...items,
            {
                id: crypto.randomUUID(),
                product,
                quantity: 1,
            },
        ]);
    }

    public updateItemQuantity(id: string, quantity: number): void {
        this._items$.update(items =>
            items.map(item => (item.id === id ? { ...item, quantity } : item))
        );
    }

    public items$(): Signal<CartItem[]> {
        return this._items$.asReadonly();
    }

    public items(): CartItem[] {
        return this._items$();
    }

    public removeItem(id: string): void {
        this._items$.update(items => items.filter(item => item.id !== id));
    }

    public setItems(items: CartItem[]): void {
        this._items$.set(items);
    }

    public clearCart(): void {
        this._items$.set([]);
    }
}
