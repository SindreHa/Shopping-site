import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { AdminSession } from '../../api/model/auth.model';
import { AuthApiService } from '../../api/service/auth-api.service';

const STORAGE_KEY = 'admin-session';

const isValidSession = (value: unknown): value is AdminSession => {
    const session = value as Partial<AdminSession> | null;
    return (
        typeof session?.token === 'string' &&
        typeof session.username === 'string' &&
        typeof session.expiresAt === 'string' &&
        Date.parse(session.expiresAt) > Date.now()
    );
};

@Injectable({ providedIn: 'root' })
export class AuthService {
    private authApiService = inject(AuthApiService);
    private router = inject(Router);

    // sessionStorage so the admin session ends when the tab is closed
    private _session$ = signal<AdminSession | null>(this.restoreSession());

    public session$ = this._session$.asReadonly();
    public isAdmin$ = computed<boolean>(() => this._session$() !== null);
    public token$ = computed<string | null>(() => this._session$()?.token ?? null);
    public username$ = computed<string | null>(() => this._session$()?.username ?? null);

    constructor() {
        effect(onCleanup => {
            const session = this._session$();
            if (!session) {
                return;
            }
            const timeout = setTimeout(
                () => this.logout(),
                Math.max(Date.parse(session.expiresAt) - Date.now(), 0)
            );
            onCleanup(() => clearTimeout(timeout));
        });
    }

    public login(username: string, password: string): Observable<void> {
        return this.authApiService.login({ username, password }).pipe(
            tap(session => this.setSession(session)),
            map(() => undefined)
        );
    }

    public logout(): void {
        this.setSession(null);

        const currentUrl = this.router.url;
        if (currentUrl.startsWith('/admin') && !currentUrl.startsWith('/admin/login')) {
            void this.router.navigate(['/admin/login'], { queryParams: { returnUrl: currentUrl } });
        }
    }

    private setSession(session: AdminSession | null): void {
        this._session$.set(session);
        if (session) {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        } else {
            sessionStorage.removeItem(STORAGE_KEY);
        }
    }

    private restoreSession(): AdminSession | null {
        try {
            const session: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null');
            return isValidSession(session) ? session : null;
        } catch {
            return null;
        }
    }
}
