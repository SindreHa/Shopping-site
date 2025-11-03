import { CommonButtonDirective } from '../../core/directives/button/button.directive';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Component, computed, inject, OnInit, Signal } from '@angular/core';
import { OrderApiService } from '../../api/service/order-api.service';
import { CartItemComponent } from './cart-item/cart-item.component';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models/cart-item.model';
import { Title } from '@angular/platform-browser';
import { CurrencyPipe } from '@angular/common';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    imports: [CurrencyPipe, CommonButtonDirective, CartItemComponent, MatSnackBarModule],
    providers: [CartService, OrderApiService],
})
export class CartComponent implements OnInit {
    private orderApiService = inject(OrderApiService);
    private cartService = inject(CartService);
    private snackBar = inject(MatSnackBar);
    private title = inject(Title);

    public items$: Signal<CartItem[]> = this.cartService.getItems$();
    public cartTotal$: Signal<number> = this.cartService.cartTotal$;
    public numberOfItemsInCart$: Signal<number> = this.cartService.numberOfItemsInCart$;

    public ngOnInit(): void {
        this.title.setTitle('Shopping site - Cart');
    }

    public emptyCart$ = computed<boolean>(() => this.items$().length === 0);

    public adjustProductQuantity(id: string, delta: 1 | -1): void {
        this.cartService.updateProductQuantity(id, delta);
    }

    public removeItem(id: string): void {
        this.cartService.removeItem(id);
    }

    public placeOrder(): void {
        const customerDetails = {
            name: 'Ola Nordmann',
            address: 'Storgata 1, 0123 Oslo',
        };

        this.orderApiService.submitOrderFromCart(customerDetails, this.items$()).subscribe({
            next: () => {
                this.cartService.clearCart();
                this.snackBar.open('Order placed successfully!', 'Close', { duration: 5000 });
            },
            error: err => {
                this.snackBar.open('Order failed: ' + err.error.message, 'Close', {
                    duration: 5000,
                });
            },
        });
    }

    public clear(): void {
        this.cartService.clearCart();
    }
}
