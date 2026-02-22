"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteButton from "@/components/pages/DeleteButton";
import AddImageToPage from "@/components/pages/AddImageToPage";
import { getSystemPageBySlug } from "@/lib/system-pages";

interface EditPageClientProps {
  page: {
    id: string;
    title: string;
    slug: string;
    template: "text" | "empty" | string;
    content: string;
    images?: string[];
    isPublished: boolean;
  };
  pageId: string;
  updatePage: (id: string, formData: FormData) => Promise<void>;
}

export default function EditPageClient({ page, pageId, updatePage }: EditPageClientProps) {
  const [template, setTemplate] = useState<"text" | "empty">(
      page.template === "empty" ? "empty" : "text"
  );
  const [isPublished, setIsPublished] = useState(page.isPublished);
  const [slug, setSlug] = useState(page.slug || "");
  const [slugError, setSlugError] = useState<string | null>(null);
  const systemPage = getSystemPageBySlug(page.slug);
  const isSystemPage = Boolean(systemPage);
  const directPathSlugs = ["courses", "lib", "connect", "contacts"];
  const currentPublicPath = slug === "home" ? "/" : directPathSlugs.includes(slug) ? `/${slug}` : `/s/${slug}`;

  // Валидация slug
  const validateSlug = (value: string): string | null => {
    if (!value) return "Slug обязателен для заполнения";

    // Разрешаем только латиницу, цифры, дефисы
    const allowedPattern = /^[a-z0-9\-_]+$/;

    if (!allowedPattern.test(value)) {
      return "Slug может содержать только латинские буквы, цифры, дефисы (-) и нижние подчеркивания (_)";
    }

    return null;
  };

  // Обработчик изменения slug
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Заменяем недопустимые символы (кириллица, пробелы, спецсимволы)
    value = value.replace(/[^a-zA-Z0-9\-_]/g, '');
    value = value.toLowerCase();

    setSlug(value);

    // Проверяем на допустимые символы
    const error = validateSlug(value);
    setSlugError(error);
  };

  const handleSubmit = (formData: FormData) => {
    // Проверяем slug перед отправкой
    if (!isSystemPage && slugError) {
      alert(slugError);
      return;
    }
    updatePage(pageId, formData);
  };

  return (
      <div className="rounded-xl border-2 border-[#4CAF50]/20 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
        <form action={handleSubmit}>
          <div className="space-y-6">
            {isSystemPage && systemPage ? (
                <>
                  <input type="hidden" name="title" value={systemPage.title} />
                  <input type="hidden" name="slug" value={systemPage.slug} />
                  <input type="hidden" name="template" value="empty" />
                  <input type="hidden" name="isPublished" value="on" />

                  <div className="rounded-xl border border-[#4CAF50]/20 bg-[#4CAF50]/5 p-4">
                    <p className="text-sm font-semibold text-gray-900">Системная страница</p>
                    <p className="mt-1 text-xs text-gray-600">
                      Slug и шаблон зафиксированы: <code className="rounded bg-white px-1 py-0.5">{systemPage.slug}</code>, шаблон <code className="rounded bg-white px-1 py-0.5">empty</code>.
                    </p>
                  </div>
                </>
            ) : (
                <>
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Заголовок страницы *
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        defaultValue={page.title}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#4CAF50] focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                    />
                  </div>

                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                      URL (англ., через дефис) *
                      <span className="ml-2 text-xs text-amber-600">только латиница, цифры, дефис, нижнее подчеркивание</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">/s/</span>
                      <input
                          type="text"
                          id="slug"
                          name="slug"
                          value={slug}
                          onChange={handleSlugChange}
                          required
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#4CAF50] focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                      />
                    </div>

                    {slugError && (
                        <p className="mt-1 text-sm text-amber-600 flex items-center gap-1">
                          <span>⚠️</span> {slugError}
                        </p>
                    )}

                    {slug && !slugError && (
                        <p className="mt-1 text-xs text-green-600">
                          ✓ Будет доступно по адресу: {currentPublicPath}
                        </p>
                    )}

                    {slug === "home" && !slugError && (
                        <p className="mt-1 text-xs text-blue-600">
                          Специальный slug: это главная страница сайта
                        </p>
                    )}
                  </div>

                  <div className="mt-2 flex items-start gap-2 text-amber-700 bg-amber-50 p-2 rounded text-xs">
                    <span className="text-lg">⚠️</span>
                    <span>
                    <p>Важно:</p> Кириллица, пробелы и спецсимволы недопустимы в URL.
                    Используйте только латиницу, цифры, дефисы и нижние подчеркивания.
                  </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Шаблон страницы
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                          type="button"
                          onClick={() => setTemplate("text")}
                          className={`rounded-xl border-2 p-4 text-left transition-colors ${template === "text" ? "border-[#4CAF50] bg-[#4CAF50]/5" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                              className={`h-4 w-4 rounded-full border ${template === "text" ? "border-[#4CAF50] bg-[#4CAF50]" : "border-gray-300"}`}></div>
                          <span className="font-medium text-gray-900">Текст</span>
                        </div>
                        <p className="mt-2 text-xs text-gray-600">
                          Обычная страница с заголовком и текстовым содержимым.
                        </p>
                      </button>

                      <button
                          type="button"
                          onClick={() => setTemplate("empty")}
                          className={`rounded-xl border-2 p-4 text-left transition-colors ${template === "empty" ? "border-[#4CAF50] bg-[#4CAF50]/5" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                              className={`h-4 w-4 rounded-full border ${template === "empty" ? "border-[#4CAF50] bg-[#4CAF50]" : "border-gray-300"}`}></div>
                          <span className="font-medium text-gray-900">Пустой</span>
                        </div>
                        <p className="mt-2 text-xs text-gray-600">
                          Произвольный HTML-код. Для опытных пользователей.
                        </p>
                      </button>
                    </div>
                    <input type="hidden" name="template" value={template} />
                  </div>
                </>
            )}

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                {isSystemPage ? "HTML-код страницы" : `Содержимое ${template === "empty" ? "(HTML)" : "(текст)"} *`}
              </label>
              <textarea
                  id="content"
                  name="content"
                  defaultValue={page.content}
                  required
                  rows={isSystemPage ? 22 : 15}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-[#4CAF50] focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
              />
              {template === "empty" && (
                  <p className="mt-1 text-xs text-gray-500">
                    Можно использовать HTML, CSS, JavaScript. Будьте осторожны с кодом.
                  </p>
              )}
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {isSystemPage ? "Файлы системной страницы" : "Файлы страницы"}
              </h3>
              <div className="w-full">
                <AddImageToPage initialImages={page.images ?? []} entityKey={`page-${pageId}`} />
              </div>
            </div>

            {!isSystemPage && (
                <div className="flex items-center gap-3">
                  <button
                      type="button"
                      onClick={() => setIsPublished(!isPublished)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${isPublished ? "bg-[#4CAF50]" : "bg-gray-300"}`}
                  >
                  <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isPublished ? "translate-x-6" : "translate-x-1"}`}
                  />
                  </button>
                  <input type="hidden" name="isPublished" value={isPublished ? "on" : "off"} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Опубликована</p>
                    <p className="text-xs text-gray-500">
                      {isPublished ? "Страница доступна на сайте" : "Страница в черновиках"}
                    </p>
                  </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                  type="submit"
                  disabled={!isSystemPage && !!slugError}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#4CAF50] px-4 py-3 text-sm font-medium text-white hover:bg-[#43A047] active:bg-[#388E3C] transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Сохранить изменения
              </button>

              {!isSystemPage && (
                  <div className="flex-1">
                    <DeleteButton pageId={pageId} />
                  </div>
              )}

              <Link
                  href="/managers/pages"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex-1 text-center"
              >
                Отмена
              </Link>
            </div>
          </div>
        </form>
      </div>
  );
}
