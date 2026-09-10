import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasValidToken()) {
    return true;
  }

  // Si había un token vencido en localStorage, lo limpiamos
  // correctamente en vez de solo bloquear el acceso.
  authService.logout();

  return false;
};