import { effect, inject, Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item.model';
import { CartRepository } from '../repositories/cart.repository';

@Injectable({ providedIn: 'root' })
export class PersistentCartService {
    private readonly cartRepository = inject(CartRepository);
    private readonly STORAGE_KEY = 'cart';

    constructor() {
        effect(() => {
            const items$ = this.cartRepository.items$();

            if (items$().length === 0) {
                this.loadCartFromStorage();
                return;
            }

            this.saveCartToStorage(items$());
        });
    }

    private loadCartFromStorage(): void {
        const storedItems = this.getCartFromStorage();
        if (storedItems) {
            try {
                const parsedItems: CartItem[] = JSON.parse(storedItems);
                if (Array.isArray(parsedItems) && parsedItems.length > 0) {
                    this.cartRepository.setItems(parsedItems);
                }
            } catch (error) {
                console.error('Failed to parse cart from storage:', error);
                this.clear();
            }
        }
    }

    private saveCartToStorage(items: CartItem[]): void {
        try {
            this.setCartInStorage(JSON.stringify(items));
        } catch (error) {
            console.error('Failed to save cart to storage:', error);
        }
    }

    private setCartInStorage(value: string): void {
        localStorage.setItem(this.STORAGE_KEY, value);
    }

    private getCartFromStorage(): string | null {
        return localStorage.getItem(this.STORAGE_KEY);
    }

    public clear(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}
