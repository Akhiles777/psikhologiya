import Link from "next/link";

export function SiteFooter() {
  return (
      <footer className="border-t border-neutral-200/50 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Основная навигация */}
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
            {/* Лого */}
            <div className="text-center sm:text-left">
              <div className="text-xl font-bold text-gray-900">
                Давай вместе
              </div>
              <div className="mt-1 text-xs text-lime-600 font-medium">
                реестр психологов
              </div>
            </div>

            {/* Основные ссылки */}
            <nav className="flex flex-wrap justify-center gap-6">
              <Link
                  href="/"
                  className="text-sm text-gray-600 hover:text-gray-900"
              >
                Главная
              </Link>
              <Link
                  href="/psy-list"
                  className="text-sm text-gray-600 hover:text-gray-900"
              >
                Каталог
              </Link>
              <Link
                  href="/library"
                  className="text-sm text-gray-600 hover:text-gray-900"
              >
                Библиотека
              </Link>
              <Link
                  href="/connect"
                  className="text-sm text-gray-600 hover:text-gray-900"
              >
                Для психологов
              </Link>
              <Link
                  href="/contacts"
                  className="text-sm text-gray-600 hover:text-gray-900"
              >
                Контакты
              </Link>
            </nav>
          </div>

          {/* Разделитель */}
          <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          {/* Дополнительные ссылки и копирайт */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            {/* Дополнительные ссылки */}
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              <Link
                  href="/privacy"
                  className="text-gray-500 hover:text-gray-700"
              >
                Конфиденциальность
              </Link>
              <Link
                  href="/complaint"
                  className="text-gray-500 hover:text-gray-700"
              >
                Пожаловаться
              </Link>
              <Link
                  href="/faq"
                  className="text-gray-500 hover:text-gray-700"
              >
                FAQ
              </Link>
            </div>

            {/* Копирайт */}
            <div className="text-center sm:text-right">
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} Давай вместе. Каталог психологов.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Подбор по парадигме, цене и городу.
              </p>
            </div>
          </div>

          {/* Декоративный элемент */}
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="h-px w-4 bg-gray-300" />
              <div className="h-1 w-1 rounded-full bg-lime-500" />
              <div className="h-px w-4 bg-gray-300" />
            </div>
          </div>
        </div>
      </footer>
  );
}