import { Component, inject } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.html',
  imports: [CurrencyPipe],
})
export class ProductListComponent {
    private productsService = inject(ProductService);
    private cartService = inject(CartService);

    public products$ = this.productsService.products$;

    public add(product: any): void {
        this.cartService.add(product);
    }
}
