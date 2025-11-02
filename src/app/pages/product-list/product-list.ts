import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ProductsRepository } from '../../core/repositories/products.repository';
import { ProductService } from '../../core/services/product.service';
import { ProductComponent } from './product/product';

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.html',
    changeDetection:ChangeDetectionStrategy.OnPush,
    imports: [ProductComponent],
    providers: [ProductService],
})
export class ProductListComponent implements OnInit {
    private productsService = inject(ProductService);
    private productsRepository = inject(ProductsRepository);

    public products$ = this.productsRepository.getProducts();
    
    public ngOnInit(): void {
        this.productsService.fetchProducts();
    }
}
