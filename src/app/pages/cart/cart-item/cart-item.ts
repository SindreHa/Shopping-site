import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CartItem } from '../../../core/models/cart-item.model';
import { CurrencyPipe } from '@angular/common';

@Component({
    selector: 'app-cart-item',
    templateUrl: './cart-item.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CurrencyPipe],
})
export class CartItemComponent {
    public item = input.required<CartItem>();
    public componentClasses = input<string>();

    public adjustQuantity = output<1 | -1>();
    public remove = output<void>();

    public itemTotal$ = computed<number>(() => this.item().product.price * this.item().quantity);
}
