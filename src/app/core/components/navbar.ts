import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../services/cart.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.html',
    imports: [RouterLink, RouterLinkActive],
    providers: [CartService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
    public cartService = inject(CartService);

    public cartText$ = computed<string>(() => {
        const numberOfItems = this.cartService.numberOfItemsInCart$();
        return numberOfItems > 0 ? `Cart (${numberOfItems})` : 'Cart';
    });
}
