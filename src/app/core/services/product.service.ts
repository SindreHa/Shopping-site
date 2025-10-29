import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private _products$ = signal<Product[]>([
    { id: 1, name: 'Coffee Mug', description: 'Ceramic mug', price: 99, imageUrl: 'assets/mug.jpg' },
    { id: 2, name: 'Notebook', description: 'Hardcover A5', price: 129, imageUrl: 'assets/notebook.jpg' },
    { id: 3, name: 'T-Shirt', description: '100% cotton', price: 199, imageUrl: 'assets/tshirt.jpg' },
  ]);

  public products$ = this._products$.asReadonly();
}
