import { httpResource } from '@angular/common/http';
import { Product } from '../models/product.model';
import { effect, inject, Injectable } from '@angular/core';
import { ProductsRepository } from '../repositories/products.repository';

@Injectable()
export class ProductService {
    private productsRepository = inject(ProductsRepository);

    private readonly API_URL = 'http://localhost:3000/api';

    private productsResource = httpResource<Product[]>(() => `${this.API_URL}/products`, {
        defaultValue: [],
    });

    constructor() {
        effect(() => {
            const products = this.productsResource.value();
            this.productsRepository.setProducts(products);
        });
    }

    public fetchProducts(): void {
        this.productsResource.reload();
    }
}
