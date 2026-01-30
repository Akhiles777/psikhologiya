import Link from "next/link";
import { createPage } from "@/lib/actions/admin-pages";

/**
 * Форма создания страницы (конструктор страниц).
 */
export default function NewPageForm() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Добавить страницу
      </h1>
      <p className="mt-2 text-sm text-neutral-dark">
        Slug — адрес страницы (например, «about» → /s/about). Текст — обычная страница с заголовком. Пустой — вставьте свой HTML.
      </p>

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
          <label className="block text-sm font-medium text-foreground">Slug * (адрес: /s/...)</label>
          <input
            type="text"
            name="slug"
            required
            placeholder="about"
            className="mt-1 w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
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
          <input type="checkbox" name="isPublished" id="isPublished" />
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
