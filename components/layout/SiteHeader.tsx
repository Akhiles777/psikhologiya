import Link from "next/link";

const nav = [
  { href: "/", label: "Главная" },
  { href: "/catalog", label: "Каталог" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-light/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-xl font-bold text-foreground transition hover:text-primary"
        >
          Давай вместе
        </Link>
        <nav className="flex gap-6" aria-label="Главное меню">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-foreground transition hover:text-primary"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
