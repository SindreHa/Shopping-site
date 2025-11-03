import { ProductListComponent } from './pages/product-list/product-list.component';
import { CartComponent } from './pages/cart/cart.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'shop', component: ProductListComponent },
    { path: 'cart', component: CartComponent },
    { path: '**', redirectTo: 'shop' },
];
