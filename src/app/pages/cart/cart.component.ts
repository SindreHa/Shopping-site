import { CommonButtonDirective } from '../../core/directives/button/button.directive';
import { OrderApiService } from '../../api/service/order-api.service';
import { Component, computed, inject, OnInit, Signal } from '@angular/core';
import { CartItemComponent } from './cart-item/cart-item.component';
import { CartService } from '../../core/services/cart.service';
import { Title } from '@angular/platform-browser';
import { CurrencyPipe } from '@angular/common';
import { CartItem } from '../../core/models/cart-item.model';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    imports: [CurrencyPipe, CommonButtonDirective, CartItemComponent],
    providers: [CartService, OrderApiService],
})
export class CartComponent implements OnInit {
    private orderApiService = inject(OrderApiService);
    private cartService = inject(CartService);
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
