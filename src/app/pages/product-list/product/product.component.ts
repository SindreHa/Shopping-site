import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { CurrencyPipe } from '@angular/common';
import { CommonButtonDirective } from '../../../core/directives/button/button.directive';

@Component({
    selector: 'app-product',
    templateUrl: 'product.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CurrencyPipe, CommonButtonDirective],
})
export class ProductComponent {
    public product = input.required<Product>();
    public addToCart = output<void>();

    public outOfStock$ = computed<boolean>(() => this.product().stock === 0);

    public buttonText$ = computed<string>(() =>
        this.outOfStock$() ? 'Out of stock' : 'Add to cart'
    );
}
