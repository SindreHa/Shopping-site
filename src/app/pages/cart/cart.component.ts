import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { CommonButtonDirective } from '../../core/directives/button/button.directive';
import { CartItemComponent } from './cart-item/cart-item.component';
import { OrderApiService } from '../../api/service/order-api.service';
import { take } from 'rxjs';

@Component({
    selector: 'app-cart',
    imports: [CurrencyPipe, CommonButtonDirective, CartItemComponent],
    providers: [CartService, OrderApiService],
    templateUrl: './cart.component.html',
})
export class CartComponent {
    private orderApiService = inject(OrderApiService);
    private cartService = inject(CartService);

    public items$ = this.cartService.getItems$();
    public cartTotal$ = this.cartService.cartTotal$;
    public numberOfItemsInCart$ = this.cartService.numberOfItemsInCart$;

    public emptyCart$ = computed(() => this.items$().length === 0);

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

        this.orderApiService
            .submitOrderFromCart(customerDetails, this.items$())
            .pipe(take(1))
            .subscribe({
                next: () => {
                    this.cartService.clearCart();
                    console.log('Order placed successfully!');
                },
                error: err => {
                    console.error('Order failed:', err);
                },
            });
    }

    public clear(): void {
        this.cartService.clearCart();
    }
}
