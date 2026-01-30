import Link from "next/link";
import { createPage } from "@/lib/actions/admin-pages";
import { DB_SYNC_MESSAGE } from "@/lib/db-error";

const ERROR_MESSAGES: Record<string, string> = {
  db_unavailable: "База данных недоступна.",
  fill_title_slug: "Укажите название и slug (латиница, цифры, дефис).",
  duplicate_slug: "Страница с таким slug уже есть. Выберите другой адрес.",
  create_failed: "Не удалось создать страницу. Проверьте данные и попробуйте снова.",
  db_sync: DB_SYNC_MESSAGE,
};

/**
 * Форма создания страницы. Ошибки показываются из ?error=...
 */
export default async function NewPageForm({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const errorCode = typeof params.error === "string" ? params.error : "";
  const errorMessage = errorCode ? ERROR_MESSAGES[errorCode] ?? "Произошла ошибка." : null;

  return (
    <div className="rounded-2xl border-2 border-[#5858E2]/20 bg-white p-8 shadow-lg">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Добавить страницу
      </h1>
      <p className="mt-2 text-sm text-neutral-dark">
        Slug — адрес страницы (только латиница, цифры, дефис). Например: about → /s/about. Для разделов «Курсы», «Библиотека» используйте slug: courses, lib, connect, contacts — тогда контент откроется по /courses, /lib и т.д.
      </p>

      {errorMessage && (
        <div className="mt-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-800">
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      <form action={createPage} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground">Название страницы *</label>
          <input
            type="text"
            name="title"
            required
            placeholder="О проекте"
            className="mt-1 w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Slug * (адрес)</label>
          <input
            type="text"
            name="slug"
            required
            placeholder="about"
            pattern="[a-z0-9-_]+"
            title="Только латиница, цифры, дефис"
            className="mt-1 w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
          <p className="mt-1 text-xs text-neutral-dark">courses, lib, connect, contacts — откроются по /courses, /lib, /connect, /contacts</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Шаблон</label>
          <select
            name="template"
            className="mt-1 w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          >
            <option value="text">Текст (заголовок + контент)</option>
            <option value="empty">Пустой (свой HTML)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Контент</label>
          <textarea
            name="content"
            rows={12}
            placeholder="Для «текст» — HTML абзацев. Для «пустой» — полная HTML-страница."
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-mono text-sm text-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          <input type="hidden" name="isPublished" value="off" />
          <input type="checkbox" name="isPublished" id="isPublished" value="on" />
          <label htmlFor="isPublished" className="text-sm font-medium text-foreground">
            Опубликовать (показывать на сайте)
          </label>
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="rounded-xl bg-[#5858E2] px-6 py-2 font-medium text-white hover:bg-[#4848d0]"
          >
            Создать страницу
          </button>
          <Link
            href="/admin/pages"
            className="rounded-xl border border-neutral-300 px-6 py-2 font-medium text-foreground hover:bg-[#F5F5F7]"
          >
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}
