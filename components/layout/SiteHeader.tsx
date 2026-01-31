import Link from "next/link";

const menu = [
  { href: "/", label: "Главная" },
  { href: "/psy-list", label: "Подобрать психолога" },
  { href: "/courses", label: "Курсы" },
  {
    label: "Библиотека",
    children: [
      { href: "/lib", label: "Библиотека" },
      { href: "/lib/articles", label: "Статьи" },
    ],
  },
  { href: "/connect", label: "Для психологов" },
  { href: "/contacts", label: "Контакты" },
];

export function SiteHeader() {
  return (
      <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Логотип */}
            <Link
                href="/"
                className="text-lg font-bold text-gray-900 hover:text-[#5858E2] transition-colors sm:text-xl"
            >
              Давай вместе
            </Link>

            {/* Десктопное меню */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Главное меню">
              {menu.map((item) =>
                  "href" in item ? (
                      <Link
                          key={item.href}
                          href={item.href}
                          className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#5858E2]/10 hover:text-[#5858E2] transition-all duration-200"
                      >
                        {item.label}
                      </Link>
                  ) : (
                      <div key={item.label} className="relative group">
                        <button
                            type="button"
                            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#5858E2]/10 hover:text-[#5858E2] transition-all duration-200"
                            aria-expanded="false"
                            aria-haspopup="true"
                        >
                          {item.label}
                          <span className="ml-1 opacity-60">▾</span>
                        </button>
                        <div className="invisible opacity-0 translate-y-2 absolute left-1/2 top-full pt-2 -translate-x-1/2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                          <div className="rounded-xl border border-gray-200/50 bg-white/95 backdrop-blur-md py-2 shadow-lg min-w-[160px] ring-1 ring-black/5">
                            {item.children.map((child) => (
                                <Link
                                    key={child.href}
                                    href={child.href}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#5858E2]/10 hover:text-[#5858E2] whitespace-nowrap transition-colors"
                                >
                                  {child.label}
                                </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                  )
              )}
            </nav>

            {/* Мобильное меню */}
            <details className="group md:hidden">
              <summary className="flex cursor-pointer items-center gap-1 rounded-lg p-2 text-gray-700 hover:bg-[#5858E2]/10 hover:text-[#5858E2] transition-all duration-200 list-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="sr-only">Меню</span>
              </summary>

              {/* Оверлей */}
              <div className="fixed inset-0 z-40 mt-14 bg-black/20 backdrop-blur-sm" aria-hidden="true"></div>

              {/* Меню - центрированное и компактное */}
              <div className="fixed left-1/2 top-14 z-50 w-[90vw] max-w-sm -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="relative">
                  {/* Эффект стекла Lucid Glas */}
                  <div className="rounded-2xl border border-white/20 bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/10 ring-1 ring-white/50">

                    {/* Декоративный верхний градиент */}
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#5858E2] to-lime-400"></div>

                    {/* Контент меню */}
                    <div className="p-4">
                      <div className="space-y-1">
                        {menu.map((item) =>
                            "href" in item ? (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 hover:bg-[#5858E2]/10 hover:text-[#5858E2] transition-all duration-200"
                                >
                                  <div className="h-6 w-6 rounded-lg bg-[#5858E2]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <span className="text-[#5858E2] text-xs">
                                {item.label === "Главная" ? "🏠" :
                                    item.label === "Подобрать психолога" ? "👤" :
                                        item.label === "Курсы" ? "📚" :
                                            item.label === "Для психологов" ? "💼" :
                                                item.label === "Контакты" ? "📞" : "🔍"}
                              </span>
                                  </div>
                                  <span>{item.label}</span>
                                  <span className="ml-auto opacity-40 text-xs">→</span>
                                </Link>
                            ) : (
                                <div key={item.label} className="space-y-1">
                                  <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#5858E2]/80">
                                    {item.label}
                                  </div>
                                  {item.children.map((child) => (
                                      <Link
                                          key={child.href}
                                          href={child.href}
                                          className="block rounded-xl px-6 py-2 text-sm text-gray-600 hover:bg-[#5858E2]/10 hover:text-[#5858E2] transition-colors"
                                      >
                                        • {child.label}
                                      </Link>
                                  ))}
                                </div>
                            )
                        )}
                      </div>

                      {/* Декоративный элемент */}
                      <div className="mt-4 pt-4 border-t border-gray-200/30">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300"></div>
                          <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-[#5858E2] to-lime-400"></div>
                          <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300"></div>
                        </div>
                        <div className="mt-2 text-center">
                          <span className="text-xs text-gray-500">Давай вместе • Психологи</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Стрелочка вверх */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <div className="h-4 w-4 rotate-45 border-t border-l border-white/20 bg-white/95 backdrop-blur-xl"></div>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>
  );
}