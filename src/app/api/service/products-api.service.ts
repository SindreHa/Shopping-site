import { Product } from '../../core/models/product.model';
import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../../app.config';

@Injectable()
export class ProductsApiService {
    private _productsResource = httpResource<Product[]>(() => `${API_URL}/products`, {
        defaultValue: [],
    });

    public productsResource$ = this._productsResource.asReadonly();

    public fetchProducts(): void {
        this._productsResource.reload();
    }
}
