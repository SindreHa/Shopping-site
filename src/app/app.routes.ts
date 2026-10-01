import { ProductListComponent } from './pages/product-list/product-list.component';
import { CartComponent } from './pages/cart/cart.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'shop', component: ProductListComponent, title: 'Shopping site - Shop' },
    { path: 'cart', component: CartComponent, title: 'Shopping site - Cart' },
    { path: '**', redirectTo: 'shop' },
];
