import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private base = environment.apiBase;

    constructor(private http: HttpClient) { }

    register(payload: any): Observable<any> {
        return this.http.post(`${this.base}/register/`, payload);
    }

    login(credentials: { login: string; password: string; }) {
        return this.http.post<{ access: string; refresh: string }>(`${this.base}/token/`, credentials)
            .pipe(tap(tokens => {
                localStorage.setItem('access_token', tokens.access);
                localStorage.setItem('refresh_token', tokens.refresh);
            }));
    }

    refreshToken() {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) return null;
        return this.http.post<{ access: string }>(`${this.base}/token/refresh/`, { refresh })
            .pipe(tap(res => localStorage.setItem('access_token', res.access)));
    }

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    getAccessToken(): string | null {
        return localStorage.getItem('access_token');
    }

    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    }
}
