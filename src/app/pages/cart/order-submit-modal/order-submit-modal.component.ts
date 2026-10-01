import { CommonButtonDirective } from '../../../core/directives/button/button.directive';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { CustomerDetails } from '../../../api/model/order.model';
import { CdkTrapFocus } from '@angular/cdk/a11y';

@Component({
    selector: 'app-order-submit-modal',
    templateUrl: 'order-submit-modal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonButtonDirective, FormField, CdkTrapFocus],
})
export class OrderSubmitModalComponent {
    private customerDetails$ = signal<CustomerDetails>({
        name: '',
        address: '',
    });

    public customerForm = form(this.customerDetails$, schemaPath => {
        required(schemaPath.name);
        required(schemaPath.address);
    });

    public submitting = input<boolean>(false);
    public submitOrder = output<CustomerDetails>();
    public cancelSubmit = output<void>();

    public onSubmit(event: Event): void {
        event.preventDefault();
        submit(this.customerForm, async () => {
            this.submitOrder.emit(this.customerForm().value());
        });
    }

    public onCancel(): void {
        this.cancelSubmit.emit();
    }
}
