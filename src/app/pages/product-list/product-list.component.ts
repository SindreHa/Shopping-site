import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { ProductComponent } from './product/product.component';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ProductComponent],
    providers: [ProductService, CartService],
})
export class ProductListComponent implements OnInit {
    private productsService = inject(ProductService);
    private cartService = inject(CartService);
    private title = inject(Title);

    public products$ = this.productsService.getProducts$();

    public ngOnInit(): void {
        this.title.setTitle('Shopping site - Shop');
        this.productsService.fetchProducts();
    }

    public addProductToCart(product: Product): void {
        this.cartService.addProductToCart(product);
    }
}
