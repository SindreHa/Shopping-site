import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../services/cart.service';

interface NavItem {
    id: number;
    title: string;
    url: string;
}

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.html',
    imports: [RouterLink, RouterLinkActive],
    providers: [CartService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
    private cartService = inject(CartService);

    public navItems$ = computed<NavItem[]>(() => {
        const numberOfItemsInCart = this.cartService.numberOfItemsInCart$();

        const cartText = numberOfItemsInCart > 0 ? `Cart (${numberOfItemsInCart})` : 'Cart';

        return [
            { id: 1, title: 'Shop', url: '/shop' },
            { id: 2, title: cartText, url: '/cart' },
        ];
    });
}
