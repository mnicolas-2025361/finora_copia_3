export interface JwtPayload {
  userId?: number;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * Decodifica el payload de un JWT SIN verificar su firma.
 * Solo sirve para leer datos como 'exp' en el frontend.
 * La validación criptográfica real siempre la hace el backend.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return null;
    }

    const decoded = atob(
      payload.replace(/-/g, '+').replace(/_/g, '/')
    );

    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/** true si el token ya expiró, o si no se pudo leer su 'exp' */
export function isJwtExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);

  if (!payload || !payload.exp) {
    return true;
  }

  return Date.now() >= payload.exp * 1000;
}