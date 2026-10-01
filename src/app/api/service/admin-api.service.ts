import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, ProductInput } from '../../core/models/product.model';
import { API_URL } from '../api.config';
import { Order } from '../model/order.model';

@Injectable({ providedIn: 'root' })
export class AdminProductsApiService {
    private httpClient = inject(HttpClient);

    public create(input: ProductInput): Observable<Product> {
        return this.httpClient.post<Product>(`${API_URL}/products`, input);
    }

    public update(id: string, input: ProductInput): Observable<Product> {
        return this.httpClient.put<Product>(`${API_URL}/products/${encodeURIComponent(id)}`, input);
    }

    public delete(id: string): Observable<void> {
        return this.httpClient.delete<void>(`${API_URL}/products/${encodeURIComponent(id)}`);
    }
}

@Injectable()
export class AdminOrdersApiService {
    private _ordersResource = httpResource<Order[]>(() => `${API_URL}/orders`, {
        defaultValue: [],
    });

    public ordersResource$ = this._ordersResource.asReadonly();

    public reload(): void {
        this._ordersResource.reload();
    }
}
