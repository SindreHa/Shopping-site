import { Injectable, Signal, computed, inject } from '@angular/core';
import { CartRepository } from '../repositories/cart.repository';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';
import { PersistentCartService } from './persistent-cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class CartService {
    // Injected so the cart is restored from and saved to localStorage
    private persistentCartService = inject(PersistentCartService);
    private cartRepository = inject(CartRepository);
    private snackbar = inject(MatSnackBar);

    public numberOfItemsInCart$ = computed<number>(() => {
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
            if (existing.quantity >= product.stock) {
                this.snackbar.open('No more of this product in stock', 'Close', { duration: 2000 });
                return;
            }
            this.cartRepository.updateItemQuantity(existing.id, existing.quantity + 1);
        } else {
            this.cartRepository.addNewItem(product);
            this.snackbar.open('Product added to cart', 'Close', { duration: 2000 });
        }
    }

    public getItems$(): Signal<CartItem[]> {
        return this.cartRepository.items$();
    }

    public updateProductQuantity(productId: string, delta: 1 | -1): void {
        const existing = this.cartRepository
            .items()
            .find(cartItem => cartItem.product.id === productId);

        if (!existing) {
            return;
        }

        const newQuantity = existing.quantity + delta;
        if (newQuantity >= 1 && newQuantity <= existing.product.stock) {
            this.cartRepository.updateItemQuantity(existing.id, newQuantity);
        }
    }

    public removeItem(id: string): void {
        this.cartRepository.removeItem(id);
    }

    public clearCart(): void {
        this.cartRepository.clearCart();
    }
}
