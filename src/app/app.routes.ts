import { Routes } from '@angular/router';
import { ProductListComponent } from './features/product-list/product-list';
import { CartComponent } from './features/cart/cart';

export const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'cart', component: CartComponent },
  { path: '**', redirectTo: '' },
];
