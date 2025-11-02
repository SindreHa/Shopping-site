import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { CurrencyPipe } from '@angular/common';

@Component({
    selector: 'app-product',
    templateUrl: 'product.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CurrencyPipe],
})
export class ProductComponent {
    public product = input.required<Product>();

    public outOfStock$ = computed<boolean>(() => this.product().stock === 0);
}
