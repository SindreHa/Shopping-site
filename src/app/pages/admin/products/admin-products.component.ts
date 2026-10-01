import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, Observable } from 'rxjs';
import { AdminProductsApiService } from '../../../api/service/admin-api.service';
import { ProductsApiService } from '../../../api/service/products-api.service';
import { CommonButtonDirective } from '../../../core/directives/button/button.directive';
import { Product, ProductInput } from '../../../core/models/product.model';
import { ProductsRepository } from '../../../core/repositories/products.repository';
import { ProductService } from '../../../core/services/product.service';
import { describeHttpError } from '../../../core/utils/http-error';
import { ProductFormComponent } from './product-form/product-form.component';

const LOW_STOCK_THRESHOLD = 3;

@Component({
    selector: 'app-admin-products',
    templateUrl: './admin-products.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CurrencyPipe, CommonButtonDirective, ProductFormComponent],
    providers: [ProductService, ProductsApiService],
})
export class AdminProductsComponent {
    private productService = inject(ProductService);
    private productsRepository = inject(ProductsRepository);
    private adminProductsApiService = inject(AdminProductsApiService);
    private snackBar = inject(MatSnackBar);

    public products$ = this.productService.getProducts$();
    public isLoading$ = this.productService.isLoading$;
    public hasError$ = this.productService.hasError$;

    public isFormOpen$ = signal<boolean>(false);
    // Snapshot taken when editing starts, so live updates don't wipe in-progress edits
    public editing$ = signal<Product | null>(null);
    public isSaving$ = signal<boolean>(false);
    public deletingId$ = signal<string | null>(null);

    public liveStockOfEdited$ = computed<number | null>(() => {
        const editing = this.editing$();
        const live = editing && this.products$().find(p => p.id === editing.id);
        return live && live.stock !== editing.stock ? live.stock : null;
    });

    public inventoryValue$ = computed<number>(() =>
        this.products$().reduce((sum, p) => sum + p.price * p.stock, 0)
    );
    public unitsInStock$ = computed<number>(() =>
        this.products$().reduce((sum, p) => sum + p.stock, 0)
    );
    public lowStockCount$ = computed<number>(
        () => this.products$().filter(p => p.stock <= LOW_STOCK_THRESHOLD).length
    );

    public isLowStock(product: Product): boolean {
        return product.stock <= LOW_STOCK_THRESHOLD;
    }

    public startCreate(): void {
        this.editing$.set(null);
        this.isFormOpen$.set(true);
    }

    public startEdit(product: Product): void {
        this.editing$.set({ ...product });
        this.isFormOpen$.set(true);
    }

    public closeForm(): void {
        this.isFormOpen$.set(false);
        this.editing$.set(null);
    }

    public save(input: ProductInput): void {
        const editing = this.editing$();
        const request$: Observable<Product> = editing
            ? this.adminProductsApiService.update(editing.id, input)
            : this.adminProductsApiService.create(input);

        this.isSaving$.set(true);
        request$.pipe(finalize(() => this.isSaving$.set(false))).subscribe({
            next: product => {
                this.productsRepository.upsertProduct(product);
                this.closeForm();
                this.notify(`${editing ? 'Updated' : 'Created'} ${product.name}`);
            },
            error: error => this.notify(describeHttpError(error)),
        });
    }

    public remove(product: Product): void {
        if (!confirm(`Delete "${product.name}"? Shoppers will see it disappear immediately.`)) {
            return;
        }

        this.deletingId$.set(product.id);
        this.adminProductsApiService
            .delete(product.id)
            .pipe(finalize(() => this.deletingId$.set(null)))
            .subscribe({
                next: () => {
                    this.productsRepository.removeProduct(product.id);
                    if (this.editing$()?.id === product.id) {
                        this.closeForm();
                    }
                    this.notify(`Deleted ${product.name}`);
                },
                error: error => this.notify(describeHttpError(error)),
            });
    }

    private notify(message: string): void {
        this.snackBar.open(message, 'Close', { duration: 4000 });
    }
}
