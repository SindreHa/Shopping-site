import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Order } from '../../../api/model/order.model';
import { AdminOrdersApiService } from '../../../api/service/admin-api.service';
import { CommonButtonDirective } from '../../../core/directives/button/button.directive';
import { RealtimeService } from '../../../core/realtime/realtime.service';

@Component({
    selector: 'app-admin-orders',
    templateUrl: './admin-orders.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CurrencyPipe, DatePipe, CommonButtonDirective],
    providers: [AdminOrdersApiService],
})
export class AdminOrdersComponent {
    private adminOrdersApiService = inject(AdminOrdersApiService);
    private realtimeService = inject(RealtimeService);
    private snackBar = inject(MatSnackBar);

    private ordersResource = this.adminOrdersApiService.ordersResource$;
    private liveOrders$ = signal<Order[]>([]);

    public isLoading$ = this.ordersResource.isLoading;
    public hasError$ = computed<boolean>(() => this.ordersResource.status() === 'error');
    public isLive$ = this.realtimeService.isAdminChannel$;
    public liveOrderIds$ = computed<ReadonlySet<string>>(
        () => new Set(this.liveOrders$().map(order => order.id))
    );

    public orders$ = computed<Order[]>(() => {
        const loaded = this.ordersResource.hasValue() ? this.ordersResource.value() : [];
        const loadedIds = new Set(loaded.map(order => order.id));
        return [...this.liveOrders$().filter(order => !loadedIds.has(order.id)), ...loaded];
    });

    public revenue$ = computed<number>(() =>
        this.orders$().reduce((sum, order) => sum + order.total, 0)
    );
    public itemsSold$ = computed<number>(() =>
        this.orders$().reduce(
            (sum, order) => sum + order.lines.reduce((lines, line) => lines + line.quantity, 0),
            0
        )
    );

    constructor() {
        this.realtimeService
            .on('order.placed')
            .pipe(takeUntilDestroyed())
            .subscribe(({ order }) => {
                this.liveOrders$.update(orders => [order, ...orders]);
                this.snackBar.open(
                    `New order from ${order.customer.name}: ${order.lines.length} line(s)`,
                    'Close',
                    { duration: 4000 }
                );
            });
    }

    public reload(): void {
        this.liveOrders$.set([]);
        this.adminOrdersApiService.reload();
    }
}
