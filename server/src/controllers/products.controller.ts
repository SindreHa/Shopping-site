import { Product } from '../models/product.model';
import * as fs from 'fs';
import * as path from 'path';

export class ProductsController {
    private products: Product[] = [];

    constructor() {
        this.loadProducts();
    }

    private loadProducts(): void {
        try {
            const productsPath = path.join(__dirname, '../data/products.json');
            const productsData = fs.readFileSync(productsPath, 'utf8');
            this.products = JSON.parse(productsData);
            console.log(`Loaded ${this.products.length} products into memory`);
        } catch (error) {
            console.error('Error loading products:', error);
            this.products = [];
        }
    }

    public getAllProducts(req: any, res: any): void {
        console.log('Fetching all products');
        res.json(this.products);
    }

    public updateProductStock(productId: string, quantity: number): boolean {
        const product = this.products.find(p => p.id === productId);

        if (!product) {
            return false;
        }

        if (product.stock < quantity) {
            return false; // Insufficient stock
        }

        product.stock -= quantity;
        console.log(`Updated stock for product ${productId}: ${product.stock} remaining`);
        return true;
    }

    public getProductStock(productId: string): number | null {
        const product = this.products.find(p => p.id === productId);
        return product ? product.stock : null;
    }

    public checkAvailability(productId: string, quantity: number): boolean {
        const product = this.products.find(p => p.id === productId);
        return product ? product.stock >= quantity : false;
    }

    public getProducts(): Product[] {
        return this.products;
    }
}
