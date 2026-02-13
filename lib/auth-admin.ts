/**
 * Простая проверка входа в админку по логину и паролю из .env.
 * Логин и пароль можно поменять в .env; восстановление — поменять переменные и перезапустить.
 */

const COOKIE_NAME = "admin_session";

export const DEFAULT_ADMIN_LOGIN = "Gasan123";
export const DEFAULT_ADMIN_PASSWORD = "1111";

export function getAdminLogin(): string {
  return process.env.ADMIN_LOGIN ?? DEFAULT_ADMIN_LOGIN;
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
}

/** Токен сессии: из .env или дефолт для разработки */
export function getValidSessionToken(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "dev_admin_session_change_me";
}

export function checkAdminCredentials(login: string, password: string): boolean {
  return login === getAdminLogin() && password === getAdminPassword();
}

export function isSessionValid(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  return cookieValue === getValidSessionToken();
}


export { COOKIE_NAME };
