import Link from "next/link";
import AddImageToPage from "@/components/pages/AddImageToPage";
import { notFound } from "next/navigation";
import { getPageById, updatePage } from "@/lib/actions/admin-pages";
import { DeletePageButton } from "@/components/admin/DeletePageButton";

const EDIT_ERRORS: Record<string, string> = {
  fill_title_slug: "Укажите название и slug (латиница, цифры, дефис).",
  duplicate_slug: "Страница с таким slug уже есть.",
  update_failed: "Не удалось сохранить. Проверьте данные.",
  db_sync: "Ошибка базы данных. Выполните: npx prisma db push",
  invalid_slug: "Slug может содержать только латинские буквы, цифры, дефисы (-) и нижние подчеркивания (_). Без пробелов и спецсимволов.",
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

        <form action={updatePage.bind(null, id)} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground">Название *</label>
            <input
                type="text"
                name="title"
                required
                defaultValue={page.title}
                className="mt-1 w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-foreground focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
              Slug *
              <span className="ml-2 text-xs text-amber-600">только латиница, цифры, дефис, нижнее подчеркивание</span>
            </label>

            <div className="relative">
              <input
                  type="text"
                  name="slug"
                  required
                  defaultValue={page.slug}
                  pattern="[a-z0-9\-_]+"
                  title="Только латиница, цифры, дефис и нижнее подчеркивание. Без пробелов!"
                  className="mt-1 w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-foreground focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20 outline-none transition"
              />

              {/* Предпросмотр URL - статичный, без JS */}
              <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <span className="text-gray-400">📌</span>
                Будет доступно по адресу: <span className="font-mono text-[#5858E2] bg-[#5858E2]/5 px-1.5 py-0.5 rounded">
                {["courses", "lib", "connect", "contacts"].includes(page.slug) ? "/[slug]" : "/s/[slug]"}
              </span>
              </p>
            </div>

            {/* Полезные примеры */}
            <div className="mt-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100">

              <p className="text-xs font-medium text-red-800 mt-2 mb-1">❌ Неправильные примеры:</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-white px-2 py-1 rounded border border-red-200 text-red-700 line-through">о проекте</span>
                <span className="bg-white px-2 py-1 rounded border border-red-200 text-red-700 line-through">my page</span>
                <span className="bg-white px-2 py-1 rounded border border-red-200 text-red-700 line-through">page@123</span>
                <span className="bg-white px-2 py-1 rounded border border-red-200 text-red-700 line-through">страница!</span>
              </div>
            </div>

            {/* Важное предупреждение */}
            <div className="mt-2 flex items-start gap-2 text-amber-700 bg-amber-50 p-2 rounded text-xs">
              <span className="text-lg">⚠️</span>
              <span>
              <strong>Важно:</strong> Кириллица, пробелы и спецсимволы недопустимы в URL.
              Используйте только латиницу, цифры, дефисы и нижние подчеркивания.
            </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Шаблон</label>
            <select
                name="template"
                defaultValue={page.template}
                className="mt-1 w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-foreground focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20 outline-none transition"
            >
              <option value="text">Текст</option>
              <option value="empty">Пустой (HTML)</option>
            </select>
          </div>

          <div>
            {/* Кнопка добавления изображения для страницы */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-foreground mb-2">Добавить изображение для страницы</h3>
              <div className="max-w-md">
                <AddImageToPage initialImages={page.images ?? []} />
              </div>
              <p className="mt-1 text-xs text-neutral-dark">
                Загрузите изображения — они сохранятся автоматически и будут доступны для вставки в HTML контент страницы.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Контент</label>
            <textarea
                name="content"
                rows={12}
                defaultValue={page.content}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-mono text-sm text-foreground focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20 outline-none transition"
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
                className="w-4 h-4 rounded border-gray-300 text-[#5858E2] focus:ring-[#5858E2]"
            />
            <label htmlFor="isPublished" className="text-sm font-medium text-foreground">
              Опубликовать (показывать на сайте)
            </label>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
                type="submit"
                className="rounded-xl bg-[#5858E2] px-6 py-2 font-medium text-white hover:bg-[#4848d0] transition-colors"
            >
              Сохранить
            </button>
            <Link
                href="/admin/pages"
                className="rounded-xl border border-neutral-300 px-6 py-2 font-medium text-foreground hover:bg-[#F5F5F7] transition-colors"
            >
              Отмена
            </Link>
          </div>
        </form>

        <div className="mt-6 border-t border-neutral-200 pt-6">
          <p className="mb-2 text-sm text-neutral-dark">Удаление страницы необратимо.</p>
          <DeletePageButton id={id} />
        </div>
      </div>
  );
}