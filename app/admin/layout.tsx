import Link from "next/link";

/**
 * Общий layout админки: боковое меню и контент.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <header className="border-b border-neutral-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-display text-lg font-semibold text-foreground">
            Админ-панель
          </span>
          <Link
            href="/"
            className="text-sm text-[#5858E2] hover:underline"
          >
            На сайт
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
        <aside className="w-52 shrink-0">
          <nav className="rounded-xl border border-neutral-200 bg-white p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/admin"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#F5F5F7]"
                >
                  Главная
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/psychologists"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#F5F5F7]"
                >
                  Психологи
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/pages"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#F5F5F7]"
                >
                  Страницы сайта
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
