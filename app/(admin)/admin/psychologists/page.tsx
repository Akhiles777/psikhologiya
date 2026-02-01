import Link from "next/link";
import { getPsychologistsList } from "@/lib/actions/admin-psychologists";
import { DB_SYNC_MESSAGE } from "@/lib/db-error";

/**
 * Список психологов в админке.
 */
export default async function PsychologistsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const showDbSyncBanner = params.error === "db_sync";
  const list = await getPsychologistsList();

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-8">
      {showDbSyncBanner && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800 sm:mb-6 sm:rounded-xl sm:p-4">
          <p className="font-medium text-sm sm:text-base">Ошибка базы данных</p>
          <p className="mt-1 text-xs sm:text-sm">{DB_SYNC_MESSAGE}</p>
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">
          Психологи
        </h1>
        <Link
          href="/admin/psychologists/new"
          className="rounded-lg bg-[#5858E2] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#4848d0] text-center sm:rounded-xl sm:px-4 sm:py-2 sm:text-base"
        >
          Добавить психолога
        </Link>
      </div>

      {list.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-dark sm:mt-8 sm:text-base">
          Пока нет ни одной анкеты.
        </p>
      ) : (
        <ul className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
          {list.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-[#F5F5F7] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:rounded-xl"
            >
              <div className="space-y-1 sm:space-y-0">
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  <span className="font-medium text-foreground text-sm sm:text-base">
                    {p.fullName}
                  </span>
                  {!p.isPublished && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800 sm:px-2">
                      Не опубликован
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-dark sm:text-sm">
                  {p.city && <span>{p.city}</span>}
                  {p.price && p.city && <span className="mx-1">·</span>}
                  {p.price && <span>{p.price} ₽</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/psychologists/${p.id}/edit`}
                  className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-xs font-medium text-foreground hover:bg-white text-center sm:flex-none sm:px-3 sm:py-1.5 sm:text-sm"
                >
                  Редактировать
                </Link>
                <Link
                  href={`/psy-list/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-xs font-medium text-foreground hover:bg-white text-center sm:flex-none sm:px-3 sm:py-1.5 sm:text-sm"
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