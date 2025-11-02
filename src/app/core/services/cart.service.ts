import { Injectable, Signal, inject } from '@angular/core';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';
import { CartRepository } from '../repositories/cart.repository';

@Injectable()
export class CartService {
    private cartRepository = inject(CartRepository);

    public addItem(product: Product): void {
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

    public removeItem(id: string): void {
        const existing = this.cartRepository.items().find(cartItem => cartItem.product.id === id);

        if (existing && existing.quantity > 1) {
            this.cartRepository.updateItemQuantity(existing.id, existing.quantity - 1);
        } else {
            this.cartRepository.removeItem(id);
        }
    }

    public clearCart(): void {
        this.cartRepository.clearCart();
    }
}
