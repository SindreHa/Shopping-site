import { Component, inject } from '@angular/core';
import { NgFor, CurrencyPipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe],
  templateUrl: './cart.html',
})
export class CartComponent {
    private cartService = inject(CartService);
    
    public items$ = this.cartService.items$;
    public total$ = this.cartService.total$;

    public remove(id: number): void {
        this.cartService.remove(id);
    }

    public clear(): void {
        this.cartService.clear();
    }
}
