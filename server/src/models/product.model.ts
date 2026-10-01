export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    stock: number;
}

export type ProductInput = Omit<Product, 'id'>;
