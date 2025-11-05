import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerDetailsForm } from './model/customer-details-form.modal';
import { CustomerDetails } from '../../../api/model/order.model';
import { CommonButtonDirective } from '../../../core/directives/button/button.directive';

@Component({
    selector: 'app-order-submit-modal',
    templateUrl: 'order-submit-modal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, CommonButtonDirective],
})
export class OrderSubmitModalComponent {
    private formBuilder = inject(NonNullableFormBuilder);

    public formGroup: FormGroup<CustomerDetailsForm> = this.buildForm();

    public submitOrder = output<CustomerDetails>();
    public cancelSubmit = output<void>();

    public buildForm(): FormGroup<CustomerDetailsForm> {
        return this.formBuilder.group<CustomerDetailsForm>({
            name: this.formBuilder.control('', [Validators.required]),
            address: this.formBuilder.control('', [Validators.required]),
        });
    }

    public onSubmit(): void {
        if (this.formGroup.valid) {
            this.submitOrder.emit(this.formGroup.getRawValue());
        }
    }

    public onCancel(): void {
        this.cancelSubmit.emit();
    }
}