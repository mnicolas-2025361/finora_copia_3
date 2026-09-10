import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

import { decodeJwtPayload, isJwtExpired } from '../shared/jwt-helper';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api/auth';

  private expirationTimer: ReturnType<typeof setTimeout> | null = null;

  // Estado observable de la sesión. app.ts se suscribe a esto para
  // arrancar/detener el InactivityService automáticamente.
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasValidToken()
  );

  readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkStoredToken();
  }

  login(
    email: string,
    password: string
  ): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      {
        email,
        password
      }
    ).pipe(

      tap((response) => {

        localStorage.setItem(
          'token',
          response.token
        );

        localStorage.setItem(
          'user',
          JSON.stringify(response.user)
        );

        this.startExpirationTimer(response.token);

        // Notifica a toda la app que ahora hay sesión activa
        this.isAuthenticatedSubject.next(true);
      })

    );
  }

  /** true si hay un token guardado y todavía no expiró */
  hasValidToken(): boolean {
    const token = localStorage.getItem('token');

    if (!token) {
      return false;
    }

    return !isJwtExpired(token);
  }

  private startExpirationTimer(token: string): void {

    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }

    const payload = decodeJwtPayload(token);

    if (!payload || !payload.exp) {
      return;
    }

    const expirationTime = payload.exp * 1000;

    const timeUntilExpiration =
      expirationTime - Date.now();

    if (timeUntilExpiration <= 0) {
      this.logout(true);
      return;
    }

    this.expirationTimer = setTimeout(() => {
      this.logout(true);
    }, timeUntilExpiration);
  }

  private checkStoredToken(): void {

    const token = localStorage.getItem('token');

    if (token) {
      this.startExpirationTimer(token);
    }
  }

  logout(expired: boolean = false): void {

    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    if (expired) {
      localStorage.setItem(
        'sessionExpired',
        'true'
      );
    }

    // Notifica a toda la app que la sesión terminó
    // (esto es lo que hace que InactivityService se detenga)
    this.isAuthenticatedSubject.next(false);

    this.router.navigate(['/login']);
  }
}