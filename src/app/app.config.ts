import {
    ApplicationConfig,
    inject,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { authInterceptor } from './core/auth/auth.interceptor';
import { LiveSyncService } from './core/realtime/live-sync.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideHttpClient(withXhr(), withInterceptors([authInterceptor])),
        provideAppInitializer(() => inject(LiveSyncService).start()),
    ],
};
