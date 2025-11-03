import { Injectable, Signal, computed, inject } from '@angular/core';
import { CartRepository } from '../repositories/cart.repository';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';
import { PersistentCartService } from './persistent-cart.service';

@Injectable()
export class CartService {
    private persistentCartService = inject(PersistentCartService);
    private cartRepository = inject(CartRepository);

    public numberOfItemsInCart$ = computed(() => {
        const items = this.getItems$();
        const totalNumberOfItems = items().reduce((sum, item) => sum + item.quantity, 0);
        return totalNumberOfItems;
    });

    public cartTotal$ = computed<number>(() => {
        const items = this.getItems$();
        return items().reduce((total, item) => total + item.product.price * item.quantity, 0);
    });

    public addProductToCart(product: Product): void {
        const existing = this.cartRepository.items().find(p => p.product.id === product.id);

        if (existing) {
            this.cartRepository.updateItemQuantity(existing.id, existing.quantity + 1);
        } else {
            this.cartRepository.addNewItem(product);
        }
    }

    public getItems$(): Signal<CartItem[]> {
        return this.cartRepository.items$();
    }

    public updateProductQuantity(productId: string, delta: 1 | -1): void {
        const existing = this.cartRepository
            .items()
            .find(cartItem => cartItem.product.id === productId);

        if (existing) {
            const newQuantity = existing.quantity + delta;
            this.cartRepository.updateItemQuantity(existing.id, newQuantity);
        }
    }

    public removeItem(id: string): void {
        const existing = this.cartRepository.items().find(cartItem => cartItem.id === id);

        if (existing) {
            this.persistentCartService.clear();
            this.cartRepository.removeItem(id);
        }
    }

    public clearCart(): void {
        this.persistentCartService.clear();
        this.cartRepository.clearCart();
    }
}
