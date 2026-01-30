import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageById, updatePage } from "@/lib/actions/admin-pages";
import { DeletePageButton } from "@/components/admin/DeletePageButton";

type PageProps = { params: Promise<{ id: string }> };

/**
 * Форма редактирования страницы.
 */
export default async function EditPageForm({ params }: PageProps) {
  const { id } = await params;
  const page = await getPageById(id);
  if (!page) notFound();

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Редактировать: {page.title}
      </h1>
      <p className="mt-2 text-sm text-neutral-dark">
        /s/{page.slug}
      </p>

      <form action={updatePage.bind(null, id)} className="mt-8 space-y-6">
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
          <input
            type="checkbox"
            name="isPublished"
            id="isPublished"
            defaultChecked={page.isPublished}
          />
          <label htmlFor="isPublished" className="text-sm font-medium text-foreground">
            Опубликовать
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
