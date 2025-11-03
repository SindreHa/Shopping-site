import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CommonButtonDirective } from '../../directives/button/button.directive';

interface NavItem {
    id: number;
    title: string;
    url: string;
}

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    imports: [RouterLink, RouterLinkActive, CommonButtonDirective],
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
