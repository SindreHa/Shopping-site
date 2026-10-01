import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { CartRepository } from '../repositories/cart.repository';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';
import { PersistentCartService } from './persistent-cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderApiService } from '../../api/service/order-api.service';
import { ProductsRepository } from '../repositories/products.repository';
import { CustomerDetails, Order } from '../../api/model/order.model';
import { finalize, map, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {
    // Injected so the cart is restored from and saved to localStorage
    private persistentCartService = inject(PersistentCartService);
    private cartRepository = inject(CartRepository);
    private productsRepository = inject(ProductsRepository);
    private orderApiService = inject(OrderApiService);
    private snackbar = inject(MatSnackBar);

    private _isCheckingOut$ = signal<boolean>(false);
    public isCheckingOut$ = this._isCheckingOut$.asReadonly();

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

    public checkout(customerDetails: CustomerDetails): Observable<Order> {
        this._isCheckingOut$.set(true);

        return this.orderApiService
            .submitOrderFromCart(customerDetails, this.cartRepository.items())
            .pipe(
                map(response => response.order),
                tap(() => this.clearCart()),
                finalize(() => {
                    this._isCheckingOut$.set(false);
                    this.reconcileWithCatalog();
                })
            );
    }

    /** Keeps the cart consistent when stock changes elsewhere (other shoppers, admins). */
    public applyProductUpdate(product: Product): void {
        // Our own order's stock updates can arrive before its HTTP response
        if (this._isCheckingOut$()) {
            return;
        }

        const item = this.cartRepository.items().find(i => i.product.id === product.id);
        if (!item) {
            return;
        }

        if (product.stock === 0) {
            this.cartRepository.removeItem(item.id);
            this.notify(`${product.name} sold out and was removed from your cart`);
            return;
        }

        const quantity = Math.min(item.quantity, product.stock);
        this.cartRepository.updateItem(item.id, { product, quantity });
        if (quantity < item.quantity) {
            this.notify(`Only ${product.stock} of ${product.name} left, your cart was updated`);
        }
    }

    public applyProductRemoval(productId: string): void {
        const item = this.cartRepository.items().find(i => i.product.id === productId);
        if (item) {
            this.cartRepository.removeItem(item.id);
            this.notify(`${item.product.name} is no longer available`);
        }
    }

    private reconcileWithCatalog(): void {
        for (const product of this.productsRepository.products()) {
            this.applyProductUpdate(product);
        }
    }

    private notify(message: string): void {
        this.snackbar.open(message, 'Close', { duration: 4000 });
    }
}
