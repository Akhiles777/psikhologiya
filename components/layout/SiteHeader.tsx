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
    <header className="sticky top-0 z-50 border-b border-neutral-light/60 bg-[#F5F5F7]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-xl font-bold text-foreground transition hover:text-[#5858E2]"
        >
          Давай вместе
        </Link>
        <nav className="flex items-center gap-1 sm:gap-4" aria-label="Главное меню">
          {menu.map((item) =>
            "href" in item ? (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition hover:bg-primary/10 hover:text-[#5858E2]"
              >
                {item.label}
              </Link>
            ) : (
              <div key={item.label} className="relative group">
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition hover:bg-primary/10 hover:text-[#5858E2]"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  {item.label}
                </button>
                <div className="invisible absolute left-0 top-full pt-1 group-hover:visible">
                  <div className="rounded-xl border border-neutral-light/80 bg-white py-2 shadow-lg">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-[#5858E2]"
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
      </div>
    </header>
  );
}
