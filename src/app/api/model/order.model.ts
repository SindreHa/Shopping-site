export interface OrderSubmissionDTO {
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

export interface OrderLine {
    productId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
}

export interface Order {
    id: string;
    createdAt: string;
    customer: CustomerDetails;
    lines: OrderLine[];
    total: number;
}

export interface PlaceOrderResponse {
    message: string;
    order: Order;
}
