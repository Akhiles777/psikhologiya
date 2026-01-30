import Link from "next/link";
import { getPagesList } from "@/lib/actions/admin-pages";

/**
 * Список страниц сайта в админке.
 */
export default async function PagesListPage() {
  const list = await getPagesList();

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Страницы сайта
        </h1>
        <Link
          href="/admin/pages/new"
          className="rounded-xl bg-[#5858E2] px-4 py-2 font-medium text-white hover:bg-[#4848d0]"
        >
          Добавить страницу
        </Link>
      </div>
      <p className="mt-2 text-sm text-neutral-dark">
        Страницы отображаются по адресу /s/[slug]. Шаблон «текст» — заголовок и контент. «Пустой» — любой HTML.
      </p>

      {list.length === 0 ? (
        <p className="mt-8 text-neutral-dark">Пока нет ни одной страницы.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {list.map((page) => (
            <li
              key={page.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-[#F5F5F7] p-4"
            >
              <div>
                <span className="font-medium text-foreground">{page.title}</span>
                <span className="ml-2 text-sm text-neutral-dark">
                  /s/{page.slug} · {page.template}
                </span>
                {!page.isPublished && (
                  <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                    Не опубликована
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/pages/${page.id}/edit`}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-white"
                >
                  Редактировать
                </Link>
                <Link
                  href={`/s/${page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-white"
                >
                  Открыть
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
