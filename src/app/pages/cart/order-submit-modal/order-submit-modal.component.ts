import { CommonButtonDirective } from '../../../core/directives/button/button.directive';
import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { CustomerDetails } from '../../../api/model/order.model';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-order-submit-modal',
    templateUrl: 'order-submit-modal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, CommonButtonDirective, FormField],
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
