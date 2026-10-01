import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = (_route, state) =>
    inject(AuthService).isAdmin$() ||
    inject(Router).createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });

export const guestGuard: CanActivateFn = () =>
    !inject(AuthService).isAdmin$() || inject(Router).createUrlTree(['/admin']);
