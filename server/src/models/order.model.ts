export interface Order {
    id: string;
    products: Map<string, number>; // productId -> quantity
    customerDetails: {
        name: string;
        address: string;
    };
}
