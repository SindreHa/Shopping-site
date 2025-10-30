export interface Order {
    id: string;
    productId: string;
    quantity: number;
    customerDetails: {
        name: string;
        email: string;
        address: string;
    };
}