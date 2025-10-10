import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    const authService = inject(AuthService);
    const token = authService.getAccessToken();

    // Adiciona token se existir
    const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

    return next(authReq).pipe(
        catchError((err: HttpErrorResponse) => {
            // Se 401, tenta refresh token
            if (err.status === 401) {
                const refresh$ = authService.refreshToken();
                if (refresh$) {
                    return refresh$.pipe(
                        switchMap(() => {
                            const newToken = authService.getAccessToken();
                            const retryReq = newToken
                                ? req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
                                : req;
                            return next(retryReq);
                        }),
                        catchError(() => {
                            authService.logout();
                            return throwError(() => err);
                        })
                    );
                } else {
                    authService.logout();
                }
            }
            return throwError(() => err);
        })
    );
};
