import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { CommonButtonDirective } from '../../core/directives/button/button.directive';

@Component({
    selector: 'app-cart',
    imports: [CurrencyPipe, CommonButtonDirective],
    providers: [CartService],
    templateUrl: './cart.html',
})
export class CartComponent {
    private cartService = inject(CartService);

    public items$ = this.cartService.getItems$();
    public cartTotal$ = this.cartService.cartTotal$;
    public numberOfItemsInCart$ = this.cartService.numberOfItemsInCart$;

    public emptyCart$ = computed(() => this.items$().length === 0);

    public remove(id: string): void {
        this.cartService.removeItem(id);
    }

    public updateQuantity(id: string, delta: 1 | -1): void {
        this.cartService.updateQuantity(id, delta);
    }

    public removeItem(id: string): void {
        this.cartService.removeItem(id);
    }

    public clear(): void {
        this.cartService.clearCart();
    }
}
