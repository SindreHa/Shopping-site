export interface PlaceOrderRequest {
    items: OrderItem[];
    customerDetails: CustomerDetails;
}

export interface OrderItem {
    productId: string;
    quantity: number;
    price: number;
}

export interface CustomerDetails {
    name: string;
    address: string;
}
