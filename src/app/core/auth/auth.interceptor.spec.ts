import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_URL } from '../../api/api.config';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
    let http: HttpClient;
    let httpTesting: HttpTestingController;
    let authService: AuthService;

    const signIn = (): void => {
        authService.login('admin', 'pw').subscribe();
        httpTesting.expectOne(`${API_URL}/auth/login`).flush({
            token: 'secret-token',
            username: 'admin',
            expiresAt: new Date(Date.now() + 60_000).toISOString(),
        });
    };

    beforeEach(() => {
        sessionStorage.clear();
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                provideHttpClient(withInterceptors([authInterceptor])),
                provideHttpClientTesting(),
            ],
        });
        http = TestBed.inject(HttpClient);
        httpTesting = TestBed.inject(HttpTestingController);
        authService = TestBed.inject(AuthService);
    });

    afterEach(() => httpTesting.verify());

    it('adds the bearer token to API requests only', () => {
        signIn();

        http.get(`${API_URL}/orders`).subscribe();
        http.get('https://example.com/data').subscribe();

        expect(
            httpTesting.expectOne(`${API_URL}/orders`).request.headers.get('Authorization')
        ).toBe('Bearer secret-token');
        expect(
            httpTesting.expectOne('https://example.com/data').request.headers.has('Authorization')
        ).toBe(false);
    });

    it('signs out when the API rejects the token', () => {
        signIn();
        expect(authService.isAdmin$()).toBe(true);

        http.get(`${API_URL}/orders`).subscribe({ error: () => undefined });
        httpTesting
            .expectOne(`${API_URL}/orders`)
            .flush({ message: 'Authentication required' }, { status: 401, statusText: '' });

        expect(authService.isAdmin$()).toBe(false);
        expect(sessionStorage.getItem('admin-session')).toBeNull();
    });
});
