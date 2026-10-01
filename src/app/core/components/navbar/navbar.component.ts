import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CommonButtonDirective } from '../../directives/button/button.directive';
import { AuthService } from '../../auth/auth.service';
import { RealtimeService } from '../../realtime/realtime.service';

interface NavItem {
    id: number;
    title: string;
    url: string;
}

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    imports: [RouterLink, RouterLinkActive, CommonButtonDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
    private cartService = inject(CartService);
    private authService = inject(AuthService);
    private realtimeService = inject(RealtimeService);

    public isAdmin$ = this.authService.isAdmin$;
    public isConnected$ = this.realtimeService.isConnected$;
    public online$ = this.realtimeService.online$;

    public navItems$ = computed<NavItem[]>(() => {
        const numberOfItemsInCart = this.cartService.numberOfItemsInCart$();

        const cartText = numberOfItemsInCart > 0 ? `Cart (${numberOfItemsInCart})` : 'Cart';

        const items = [
            { id: 1, title: 'Shop', url: '/shop' },
            { id: 2, title: cartText, url: '/cart' },
        ];
        return this.isAdmin$() ? [...items, { id: 3, title: 'Admin', url: '/admin' }] : items;
    });

    public signOut(): void {
        this.authService.logout();
    }
}
