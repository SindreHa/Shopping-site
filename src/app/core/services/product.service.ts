import { httpResource } from '@angular/common/http';
import { Product } from '../models/product.model';
import { effect, inject, Injectable } from '@angular/core';
import { ProductsRepository } from '../repositories/products.repository';
import { API_URL } from '../../app.config';

@Injectable()
export class ProductService {
    private productsRepository = inject(ProductsRepository);

    private productsResource = httpResource<Product[]>(() => `${API_URL}/products`, {
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

    public getProducts$() {
        return this.productsRepository.products$();
    }
}
