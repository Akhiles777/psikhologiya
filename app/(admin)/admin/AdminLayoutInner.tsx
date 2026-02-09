"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

/**
 * Для /admin/login — только children. Для остальных /admin/* — шапка, сайдбар (на мобиле — выдвижной) и children.
 */
export function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLogin) {
    return <>{children}</>;
  }

  const nav = (
    <nav className="rounded-xl border-2 border-[#5858E2]/20 bg-white p-4 shadow-md lg:border lg:p-4">
      <ul className="space-y-1">
        <li>
          <Link href="/admin" onClick={() => setSidebarOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#5858E2]/10 hover:text-[#5858E2]">
            Главная
          </Link>
        </li>
        <li>
          <Link href="/admin/psychologists" onClick={() => setSidebarOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#5858E2]/10 hover:text-[#5858E2]">
            Психологи
          </Link>
        </li>
        <li>
          <Link href="/admin/pages" onClick={() => setSidebarOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#5858E2]/10 hover:text-[#5858E2]">
            Страницы сайта
          </Link>
        </li>

         <li>
          <Link href="/admin/managers" onClick={() => setSidebarOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#5858E2]/10 hover:text-[#5858E2]">
            Менеджеры
          </Link>
        </li>


         <li>
          <Link href="/admin/ListDate" onClick={() => setSidebarOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#5858E2]/10 hover:text-[#5858E2]">
            Списки данных
          </Link>
        </li>

      </ul>
      <p className="mt-4 border-t border-neutral-200 pt-3 text-xs text-neutral-dark">
        Курсы, Библиотека, Для психологов, Контакты — создайте страницу со slug: courses, lib, connect, contacts и включите «Опубликовать».
      </p>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <header className="sticky top-0 z-30 border-b-2 border-[#5858E2]/30 bg-white px-3 py-3 shadow-sm sm:px-4 sm:py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-[#F5F5F7] text-foreground hover:bg-[#5858E2]/10 lg:hidden"
              aria-label="Меню"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-display text-base font-bold text-[#5858E2] sm:text-lg">
              Админ-панель
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" className="rounded-lg bg-[#A7FF5A] px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-[#8ee64a] sm:px-3 sm:text-sm">
              На сайт
            </Link>
            <form action="/admin/logout" method="POST">
              <button type="submit" className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs text-neutral-dark hover:bg-neutral-100 sm:px-3 sm:text-sm">
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Мобильный оверлей при открытом сайдбаре */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <div className="mx-auto flex max-w-6xl gap-0 px-3 py-4 sm:px-4 sm:py-8 lg:gap-8">
        {/* Сайдбар: на мобиле — выдвижной, на lg — слева */}
        <aside
          className={`fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-72 max-w-[85vw] transform border-r border-neutral-200 bg-white p-4 shadow-xl transition-transform duration-200 lg:static lg:top-0 lg:z-auto lg:block lg:h-auto lg:w-52 lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          {nav}
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
