"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Для /admin/login — только children. Для остальных /admin/* — шапка, сайдбар и children.
 */
export function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <header className="border-b-2 border-[#5858E2]/30 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-display text-lg font-bold text-[#5858E2]">
            Админ-панель
          </span>
          <div className="flex items-center gap-4">
            <Link href="/" className="rounded-lg bg-[#A7FF5A] px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-[#8ee64a]">
              На сайт
            </Link>
            <form action="/admin/logout" method="POST">
              <button type="submit" className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-dark hover:bg-neutral-100">
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
        <aside className="w-52 shrink-0">
          <nav className="rounded-xl border-2 border-[#5858E2]/20 bg-white p-4 shadow-md">
            <ul className="space-y-1">
              <li>
                <Link href="/admin" className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#5858E2]/10 hover:text-[#5858E2]">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/admin/psychologists" className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#5858E2]/10 hover:text-[#5858E2]">
                  Психологи
                </Link>
              </li>
              <li>
                <Link href="/admin/pages" className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#5858E2]/10 hover:text-[#5858E2]">
                  Страницы сайта
                </Link>
              </li>
            </ul>
            <p className="mt-4 border-t border-neutral-200 pt-3 text-xs text-neutral-dark">
              Курсы, Библиотека, Для психологов, Контакты — создайте страницу со slug: courses, lib, connect, contacts и включите «Опубликовать».
            </p>
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
