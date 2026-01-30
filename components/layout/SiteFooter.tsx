import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-light/60 bg-background-subtle">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-sm font-semibold text-foreground">
            Давай вместе
          </p>
          <nav className="flex gap-6" aria-label="Подвал">
            <Link
              href="/"
              className="text-sm text-neutral-dark transition hover:text-primary"
            >
              Главная
            </Link>
            <Link
              href="/psy-list"
              className="text-sm text-neutral-dark transition hover:text-primary"
            >
              Каталог
            </Link>
          </nav>
        </div>
        <p className="mt-6 text-sm text-neutral-dark">
          Каталог психологов. Подбор по парадигме, цене и городу.
        </p>
      </div>
    </footer>
  );
}
