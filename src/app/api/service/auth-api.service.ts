import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { AdminSession, LoginRequest } from '../model/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
    private httpClient = inject(HttpClient);

    public login(request: LoginRequest): Observable<AdminSession> {
        return this.httpClient.post<AdminSession>(`${API_URL}/auth/login`, request);
    }
}
