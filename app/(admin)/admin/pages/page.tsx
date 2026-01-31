import Link from "next/link";
import { getPagesList } from "@/lib/actions/admin-pages";
import { DB_SYNC_MESSAGE } from "@/lib/db-error";

/**
 * Список страниц сайта в админке.
 */
export default async function PagesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const errorCode = typeof params.error === "string" ? params.error : "";
  const errorMessages: Record<string, string> = {
    db_sync: DB_SYNC_MESSAGE,
    db_unavailable: "База данных недоступна.",
    delete_failed: "Не удалось удалить страницу.",
  };
  const errorBanner = errorCode ? errorMessages[errorCode] ?? "Произошла ошибка." : null;

  const list = await getPagesList();

  return (
    <div className="rounded-2xl border-2 border-[#5858E2]/20 bg-white p-8 shadow-lg">
      {errorBanner && (
        <div className="mb-6 rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-800">
          <p className="font-medium">{errorBanner}</p>
        </div>
      )}
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
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/pages/${page.id}/edit`}
                  className="rounded-lg bg-[#5858E2] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#4848d0]"
                >
                  Редактировать
                </Link>
                <Link
                  href={["courses", "lib", "connect", "contacts"].includes(page.slug) ? `/${page.slug}` : `/s/${page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border-2 border-[#A7FF5A] px-3 py-1.5 text-sm font-medium text-foreground hover:bg-[#A7FF5A]/20"
                >
                  Открыть на сайте
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
