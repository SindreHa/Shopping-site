import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    input,
    output,
    signal,
} from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { CurrencyPipe } from '@angular/common';
import { CommonButtonDirective } from '../../../core/directives/button/button.directive';

const LOW_STOCK_THRESHOLD = 3;
const FLASH_DURATION_MS = 2500;

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
    public lowStock$ = computed<boolean>(
        () => !this.outOfStock$() && this.product().stock <= LOW_STOCK_THRESHOLD
    );
    public stockJustChanged$ = signal<boolean>(false);

    public buttonText$ = computed<string>(() =>
        this.outOfStock$() ? 'Out of stock' : 'Add to cart'
    );

    private previousStock: number | null = null;

    constructor() {
        effect(onCleanup => {
            const stock = this.product().stock;
            const changed = this.previousStock !== null && this.previousStock !== stock;
            this.previousStock = stock;
            if (!changed) {
                return;
            }

            this.stockJustChanged$.set(true);
            const timeout = setTimeout(() => this.stockJustChanged$.set(false), FLASH_DURATION_MS);
            onCleanup(() => {
                clearTimeout(timeout);
                this.stockJustChanged$.set(false);
            });
        });
    }
}
