import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    CustomerDetails,
    OrderItem,
    OrderSubmissionDTO,
    PlaceOrderResponse,
} from '../model/order.model';
import { CartItem } from '../../core/models/cart-item.model';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class OrderApiService {
    private httpClient = inject(HttpClient);

    public submitOrderFromCart(
        customerDetails: CustomerDetails,
        cartItems: CartItem[]
    ): Observable<PlaceOrderResponse> {
        const orderSubmission: OrderSubmissionDTO = {
            items: this.mapCartItemsToOrderItems(cartItems),
            customerDetails,
        };

        return this.httpClient.post<PlaceOrderResponse>(`${API_URL}/orders`, orderSubmission);
    }

    private mapCartItemsToOrderItems(cartItems: CartItem[]): OrderItem[] {
        return cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
        }));
    }
}
