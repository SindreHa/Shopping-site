import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import {
    form,
    FormField,
    max,
    maxLength,
    min,
    required,
    submit,
    validate,
} from '@angular/forms/signals';
import { Product, ProductInput } from '../../../../core/models/product.model';
import { CommonButtonDirective } from '../../../../core/directives/button/button.directive';

const EMPTY_PRODUCT: ProductInput = { name: '', description: '', price: 0, stock: 0 };

@Component({
    selector: 'app-product-form',
    templateUrl: './product-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormField, CommonButtonDirective],
})
export class ProductFormComponent {
    public product = input<Product | null>(null);
    public saving = input<boolean>(false);

    public save = output<ProductInput>();
    public cancelEdit = output<void>();

    // Resets the form whenever a different product is selected
    private model$ = linkedSignal<ProductInput>(() => {
        const product = this.product();
        return product
            ? {
                  name: product.name,
                  description: product.description,
                  price: product.price,
                  stock: product.stock,
              }
            : { ...EMPTY_PRODUCT };
    });

    public productForm = form(this.model$, schemaPath => {
        required(schemaPath.name, { message: 'Name is required' });
        maxLength(schemaPath.name, 100, { message: 'Max 100 characters' });
        maxLength(schemaPath.description, 1000, { message: 'Max 1000 characters' });
        min(schemaPath.price, 0, { message: 'Price cannot be negative' });
        max(schemaPath.price, 1_000_000, { message: 'Price is too high' });
        min(schemaPath.stock, 0, { message: 'Stock cannot be negative' });
        validate(schemaPath.price, ({ value }) =>
            Number.isFinite(value()) ? undefined : { kind: 'number', message: 'Enter a price' }
        );
        validate(schemaPath.stock, ({ value }) =>
            Number.isInteger(value())
                ? undefined
                : { kind: 'integer', message: 'Stock must be a whole number' }
        );
    });

    public onSubmit(event: Event): void {
        event.preventDefault();
        void submit(this.productForm, async () => {
            this.save.emit(this.productForm().value());
        });
    }
}
