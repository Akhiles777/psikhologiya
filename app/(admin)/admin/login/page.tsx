import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  checkAdminCredentials,
  getValidSessionToken,
  COOKIE_NAME,
} from "@/lib/auth-admin";

/**
 * Страница входа в админку.
 * Логин и пароль задаются в .env: ADMIN_LOGIN, ADMIN_PASSWORD.
 * По умолчанию: Gasan123 / 1111
 */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const error = params.error === "1";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7] px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-lg">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Вход в админ-панель
        </h1>
        <p className="mt-2 text-sm text-neutral-dark">
          Логин и пароль задаются в .env (ADMIN_LOGIN, ADMIN_PASSWORD).
        </p>
        <form action={loginAction} className="mt-8 space-y-6">
          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              Неверный логин или пароль
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground">Логин</label>
            <input
              type="text"
              name="login"
              required
             
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Пароль</label>
            <input
              type="password"
              name="password"
              required
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-[#5858E2] py-3 font-medium text-white hover:bg-[#4848d0]"
          >
            Войти
          </button>
        </form>
        <p className="mt-6 text-xs text-neutral-dark">
          Чтобы сменить логин или пароль — отредактируйте .env и перезапустите сервер. Восстановление доступа — только через изменение .env.
        </p>
      </div>
    </div>
  );
}

async function loginAction(formData: FormData) {
  "use server";
  const login = (formData.get("login") as string)?.trim() ?? "";
  const password = (formData.get("password") as string)?.trim() ?? "";

  if (!checkAdminCredentials(login, password)) {
    redirect("/admin/login?error=1");
  }

  const token = getValidSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/admin");
}
