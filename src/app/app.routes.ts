import { ProductListComponent } from './pages/product-list/product-list.component';
import { CartComponent } from './pages/cart/cart.component';
import { Routes } from '@angular/router';
import { AdminLoginComponent } from './pages/admin/login/admin-login.component';
import { AdminShellComponent } from './pages/admin/admin-shell.component';
import { AdminProductsComponent } from './pages/admin/products/admin-products.component';
import { AdminOrdersComponent } from './pages/admin/orders/admin-orders.component';
import { adminGuard, guestGuard } from './core/auth/auth.guards';

export const routes: Routes = [
    { path: 'shop', component: ProductListComponent, title: 'Shopping site - Shop' },
    { path: 'cart', component: CartComponent, title: 'Shopping site - Cart' },
    {
        path: 'admin/login',
        component: AdminLoginComponent,
        canActivate: [guestGuard],
        title: 'Shopping site - Admin sign in',
    },
    {
        path: 'admin',
        component: AdminShellComponent,
        canActivate: [adminGuard],
        children: [
            {
                path: 'products',
                component: AdminProductsComponent,
                title: 'Shopping site - Products',
            },
            { path: 'orders', component: AdminOrdersComponent, title: 'Shopping site - Orders' },
            { path: '', pathMatch: 'full', redirectTo: 'products' },
        ],
    },
    { path: '**', redirectTo: 'shop' },
];
