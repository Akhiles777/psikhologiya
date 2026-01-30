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
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      {showDbSyncBanner && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-800">
          <p className="font-medium">Ошибка базы данных</p>
          <p className="mt-1 text-sm">{DB_SYNC_MESSAGE}</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Психологи
        </h1>
        <Link
          href="/admin/psychologists/new"
          className="rounded-xl bg-[#5858E2] px-4 py-2 font-medium text-white hover:bg-[#4848d0]"
        >
          Добавить психолога
        </Link>
      </div>

      {list.length === 0 ? (
        <p className="mt-8 text-neutral-dark">Пока нет ни одной анкеты.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {list.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-[#F5F5F7] p-4"
            >
              <div>
                <span className="font-medium text-foreground">{p.fullName}</span>
                <span className="ml-2 text-sm text-neutral-dark">
                  {p.city} · {p.price} ₽
                </span>
                {!p.isPublished && (
                  <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                    Не опубликован
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/psychologists/${p.id}/edit`}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-white"
                >
                  Редактировать
                </Link>
                <Link
                  href={`/psy-list/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-white"
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
