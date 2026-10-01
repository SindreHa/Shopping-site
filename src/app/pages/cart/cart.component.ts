import { CommonButtonDirective } from '../../core/directives/button/button.directive';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
    Component,
    computed,
    inject,
    OnDestroy,
    Signal,
    signal,
    TemplateRef,
    viewChild,
    ViewContainerRef,
} from '@angular/core';
import { OrderApiService } from '../../api/service/order-api.service';
import { CartItemComponent } from './cart-item/cart-item.component';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models/cart-item.model';
import { CurrencyPipe, NgTemplateOutlet } from '@angular/common';
import { CdkPortal, TemplatePortal } from '@angular/cdk/portal';
import { OrderSubmitModalComponent } from './order-submit-modal/order-submit-modal.component';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { CustomerDetails } from '../../api/model/order.model';
import { HttpErrorResponse } from '@angular/common/http';
import { filter, finalize } from 'rxjs';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    imports: [
        CurrencyPipe,
        CommonButtonDirective,
        CartItemComponent,
        MatSnackBarModule,
        CdkPortal,
        OrderSubmitModalComponent,
    ],
    providers: [OrderApiService],
})
export class CartComponent implements OnDestroy {
    private viewContainerRef = inject(ViewContainerRef);
    private orderApiService = inject(OrderApiService);
    private cartService = inject(CartService);
    private snackBar = inject(MatSnackBar);
    private overlay = inject(Overlay);

    private modalTemplate = viewChild.required<TemplateRef<NgTemplateOutlet>>('orderSubmitModal');
    private overlayRef: OverlayRef | null = null;

    public items$: Signal<CartItem[]> = this.cartService.getItems$();
    public cartTotal$: Signal<number> = this.cartService.cartTotal$;
    public numberOfItemsInCart$: Signal<number> = this.cartService.numberOfItemsInCart$;
    public isSubmitting$ = signal<boolean>(false);

    public ngOnDestroy(): void {
        this.overlayRef?.dispose();
    }

    public emptyCart$ = computed<boolean>(() => this.items$().length === 0);

    public adjustProductQuantity(id: string, delta: 1 | -1): void {
        this.cartService.updateProductQuantity(id, delta);
    }

    public removeItem(id: string): void {
        this.cartService.removeItem(id);
    }

    public openOrderModal(): void {
        this.overlayRef = this.overlay.create({
            hasBackdrop: true,
            positionStrategy: this.overlay
                .position()
                .global()
                .centerHorizontally()
                .centerVertically(),
        });

        const portal = new TemplatePortal(this.modalTemplate(), this.viewContainerRef);

        this.overlayRef.attach(portal);

        this.overlayRef.backdropClick().subscribe(() => this.closeModal());
        this.overlayRef
            .keydownEvents()
            .pipe(filter(event => event.key === 'Escape'))
            .subscribe(() => this.closeModal());
    }

    public closeModal(): void {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    }

    public submitOrder(customerDetails: CustomerDetails): void {
        if (this.isSubmitting$()) {
            return;
        }
        this.isSubmitting$.set(true);

        this.orderApiService
            .submitOrderFromCart(customerDetails, this.items$())
            .pipe(finalize(() => this.isSubmitting$.set(false)))
            .subscribe({
                next: () => {
                    this.cartService.clearCart();
                    this.closeModal();
                    this.snackBar.open(
                        'Order placed successfully for ' + customerDetails.name,
                        'Close',
                        { duration: 5000 }
                    );
                },
                error: (err: HttpErrorResponse) => {
                    const reason = err.error?.message ?? 'Could not reach the server';
                    this.snackBar.open('Order failed: ' + reason, 'Close', { duration: 5000 });
                },
            });
    }

    public clear(): void {
        this.cartService.clearCart();
    }
}
