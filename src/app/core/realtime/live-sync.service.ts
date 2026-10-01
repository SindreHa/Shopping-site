import { inject, Injectable } from '@angular/core';
import { ProductsRepository } from '../repositories/products.repository';
import { CartService } from '../services/cart.service';
import { RealtimeService } from './realtime.service';

/** Applies server-pushed catalog changes to the product list and the cart. */
@Injectable({ providedIn: 'root' })
export class LiveSyncService {
    private realtimeService = inject(RealtimeService);
    private productsRepository = inject(ProductsRepository);
    private cartService = inject(CartService);

    public start(): void {
        this.realtimeService.on('product.upserted').subscribe(({ product }) => {
            this.productsRepository.upsertProduct(product);
            this.cartService.applyProductUpdate(product);
        });

        this.realtimeService.on('product.deleted').subscribe(({ productId }) => {
            this.productsRepository.removeProduct(productId);
            this.cartService.applyProductRemoval(productId);
        });

        this.realtimeService.connect();
    }
}
