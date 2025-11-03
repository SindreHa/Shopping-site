import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CustomerDetails, OrderItem, PlaceOrderRequest } from '../model/order.model';
import { CartItem } from '../../core/models/cart-item.model';
import { Observable } from 'rxjs';

@Injectable()
export class OrderApiService {
    private httpClient = inject(HttpClient);

    private readonly API_URL = 'http://localhost:3000/api';

    public submitOrderFromCart(
        customerDetails: CustomerDetails,
        cartItems: CartItem[]
    ): Observable<void> {
        const orderRequest: PlaceOrderRequest = {
            items: this.mapCartItemsToOrderItems(cartItems),
            customerDetails,
        };

        return this.httpClient.post<void>(`${this.API_URL}/orders`, orderRequest);
    }

    private mapCartItemsToOrderItems(cartItems: CartItem[]): OrderItem[] {
        return cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
        }));
    }
}
