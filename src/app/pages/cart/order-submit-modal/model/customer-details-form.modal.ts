import { CustomerDetails } from '../../../../api/model/order.model';
import { FormControl } from '@angular/forms';

export type CustomerDetailsForm = {
    [K in keyof CustomerDetails]: FormControl<CustomerDetails[K]>;
};
