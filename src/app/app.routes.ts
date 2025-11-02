import { ProductListComponent } from './pages/product-list/product-list';
import { CartComponent } from './pages/cart/cart';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'shop', component: ProductListComponent },
  { path: 'cart', component: CartComponent },
  { path: '**', redirectTo: 'shop' },
];
