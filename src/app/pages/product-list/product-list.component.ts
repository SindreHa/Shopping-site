import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { ProductComponent } from './product/product.component';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { ProductsApiService } from '../../api/service/products-api.service';

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ProductComponent],
    providers: [ProductService, ProductsApiService],
})
export class ProductListComponent implements OnInit {
    private productsService = inject(ProductService);
    private cartService = inject(CartService);

    public products$ = this.productsService.getProducts$();
    public isLoading$ = this.productsService.isLoading$;
    public hasError$ = this.productsService.hasError$;

    public ngOnInit(): void {
        this.productsService.fetchProducts();
    }

    public addProductToCart(product: Product): void {
        this.cartService.addProductToCart(product);
    }
}
