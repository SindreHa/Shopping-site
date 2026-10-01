import { ProductsApiService } from '../../api/service/products-api.service';
import { ProductsRepository } from '../repositories/products.repository';
import { computed, effect, inject, Injectable } from '@angular/core';

@Injectable()
export class ProductService {
    private productsRepository = inject(ProductsRepository);
    private productsApiService = inject(ProductsApiService);
    private productsResource = this.productsApiService.productsResource$;

    public isLoading$ = this.productsResource.isLoading;
    public hasError$ = computed<boolean>(() => this.productsResource.status() === 'error');

    constructor() {
        effect(() => {
            // value() throws while the resource is in an error state
            if (this.productsResource.hasValue()) {
                this.productsRepository.setProducts(this.productsResource.value());
            }
        });
    }

    public fetchProducts(): void {
        this.productsApiService.fetchProducts();
    }

    public getProducts$() {
        return this.productsRepository.products$();
    }
}
