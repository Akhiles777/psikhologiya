import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageById, updatePage } from "@/lib/actions/admin-pages";
import { DeletePageButton } from "@/components/admin/DeletePageButton";

const EDIT_ERRORS: Record<string, string> = {
  fill_title_slug: "Укажите название и slug (латиница, цифры, дефис).",
  duplicate_slug: "Страница с таким slug уже есть.",
  update_failed: "Не удалось сохранить. Проверьте данные.",
  db_sync: "Ошибка базы данных. Выполните: npx prisma db push",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Форма редактирования страницы.
 */
export default async function EditPageForm({ params, searchParams }: PageProps) {
  const { id } = await params;
  const page = await getPageById(id);
  if (!page) notFound();

  const sp = await searchParams;
  const errorCode = typeof sp.error === "string" ? sp.error : "";
  const errorMessage = errorCode ? EDIT_ERRORS[errorCode] ?? "Ошибка сохранения." : null;

  return (
    <div className="rounded-2xl border-2 border-[#5858E2]/20 bg-white p-8 shadow-lg">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Редактировать: {page.title}
      </h1>
      <p className="mt-2 text-sm text-neutral-dark">
        Адрес: {["courses", "lib", "connect", "contacts"].includes(page.slug) ? `/${page.slug}` : `/s/${page.slug}`}
      </p>

      {errorMessage && (
        <div className="mt-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-800">
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      <form action={updatePage.bind(null, id)} method="post" className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground">Название *</label>
          <input
            type="text"
            name="title"
            required
            defaultValue={page.title}
            className="mt-1 w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Slug *</label>
          <input
            type="text"
            name="slug"
            required
            defaultValue={page.slug}
            className="mt-1 w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Шаблон</label>
          <select
            name="template"
            defaultValue={page.template}
            className="mt-1 w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          >
            <option value="text">Текст</option>
            <option value="empty">Пустой (HTML)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Контент</label>
          <textarea
            name="content"
            rows={12}
            defaultValue={page.content}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-mono text-sm text-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          <input type="hidden" name="isPublished" value="off" />
          <input
            type="checkbox"
            name="isPublished"
            id="isPublished"
            value="on"
            defaultChecked={page.isPublished}
          />
          <label htmlFor="isPublished" className="text-sm font-medium text-foreground">
            Опубликовать (показывать на сайте)
          </label>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            type="submit"
            className="rounded-xl bg-[#5858E2] px-6 py-2 font-medium text-white hover:bg-[#4848d0]"
          >
            Сохранить
          </button>
          <Link
            href="/admin/pages"
            className="rounded-xl border border-neutral-300 px-6 py-2 font-medium text-foreground hover:bg-[#F5F5F7]"
          >
            Отмена
          </Link>
          <DeletePageButton id={id} />
        </div>
      </form>
    </div>
  );
}
