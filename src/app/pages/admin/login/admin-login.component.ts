import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { CommonButtonDirective } from '../../../core/directives/button/button.directive';
import { describeHttpError } from '../../../core/utils/http-error';

@Component({
    selector: 'app-admin-login',
    templateUrl: './admin-login.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormField, CommonButtonDirective],
})
export class AdminLoginComponent {
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    private credentials$ = signal({ username: '', password: '' });

    public loginForm = form(this.credentials$, schemaPath => {
        required(schemaPath.username, { message: 'Username is required' });
        required(schemaPath.password, { message: 'Password is required' });
    });

    public errorMessage$ = signal<string | null>(null);
    public isSubmitting$ = signal<boolean>(false);

    public onSubmit(event: Event): void {
        event.preventDefault();

        void submit(this.loginForm, async () => {
            this.errorMessage$.set(null);
            this.isSubmitting$.set(true);
            try {
                const { username, password } = this.loginForm().value();
                await firstValueFrom(this.authService.login(username, password));
                await this.router.navigateByUrl(this.returnUrl());
            } catch (error) {
                this.errorMessage$.set(describeHttpError(error));
            } finally {
                this.isSubmitting$.set(false);
            }
        });
    }

    private returnUrl(): string {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        // Only follow in-app admin URLs
        return returnUrl?.startsWith('/admin/') && !returnUrl.startsWith('/admin/login')
            ? returnUrl
            : '/admin';
    }
}
