import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);

  const token = localStorage.getItem('token');

  if (token) {

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

  }

  return next(req).pipe(

    catchError((error) => {

      if (error.status === 401) {
        // Delegamos TODO el logout a AuthService: así se limpia el
        // timer de expiración, se actualiza isAuthenticated$ y por
        // lo tanto se detiene el InactivityService automáticamente.
        authService.logout(true);
      }

      return throwError(() => error);
    })

  );
};