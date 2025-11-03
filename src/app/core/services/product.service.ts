import { ProductsApiService } from '../../api/service/products-api.service';
import { ProductsRepository } from '../repositories/products.repository';
import { effect, inject, Injectable } from '@angular/core';

@Injectable()
export class ProductService {
    private productsRepository = inject(ProductsRepository);
    private productsApiService = inject(ProductsApiService);

    constructor() {
        effect(() => {
            const products = this.productsApiService.productsResource$.value();
            this.productsRepository.setProducts(products);
        });
    }

    public fetchProducts(): void {
        this.productsApiService.fetchProducts();
    }

    public getProducts$() {
        return this.productsRepository.products$();
    }
}
