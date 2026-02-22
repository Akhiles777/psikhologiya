"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AddImageToPage from "@/components/pages/AddImageToPage";
import { createPage } from "@/lib/actions/manager-pages";

interface NewPagePageProps {
  searchParams: Promise<{ error?: string; slug?: string }>;
}

export default function NewPagePage({ searchParams }: NewPagePageProps) {
  const [template, setTemplate] = useState<"text" | "empty">("text");
  const [isPublished, setIsPublished] = useState(false);
  const [searchParamsState, setSearchParamsState] = useState<{ error?: string; slug?: string }>({});
  const [slug, setSlug] = useState("");
  const [slugError, setSlugError] = useState<string | null>(null);
  const directPathSlugs = ["courses", "lib", "connect", "contacts"];

  // Используем useEffect для обработки Promise
  useEffect(() => {
    let mounted = true;
    searchParams.then(params => {
      if (mounted) setSearchParamsState(params);
    });
    return () => { mounted = false; };
  }, [searchParams]);

  // Валидация slug
  const validateSlug = (value: string): string | null => {
    if (!value) return null;

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

  const errorMessages: Record<string, string> = {
    db_unavailable: "База данных недоступна.",
    fill_title_slug: "Заполните заголовок и URL.",
    duplicate_slug: `Страница с URL «${searchParamsState.slug}» уже существует.`,
    create_failed: "Не удалось создать страницу.",
  };

  const errorBanner = searchParamsState.error ? errorMessages[searchParamsState.error] ?? "Произошла ошибка." : null;
  const previewPath = slug === "home" ? "/" : directPathSlugs.includes(slug) ? `/${slug}` : `/s/${slug}`;

  return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-gray-900">
              Создание страницы
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Заполните форму для создания новой страницы. Для прямых адресов используйте slug: courses, lib, contacts. Главная (home) и connect редактируются в отдельных системных карточках на странице списка.
            </p>
          </div>

          {errorBanner && (
              <div className="mb-4 rounded-lg border-2 border-red-300 bg-red-50 p-3 text-red-800 sm:rounded-xl sm:p-4">
                <p className="font-medium text-sm sm:text-base">{errorBanner}</p>
              </div>
          )}

          <div className="rounded-xl border-2 border-[#4CAF50]/20 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
            <form action={createPage}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Заголовок страницы *
                  </label>
                  <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      placeholder="Например: О нашей компании"
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
                        placeholder="about-us"
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#4CAF50] focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                    />
                  </div>

                  {/* Предупреждение о недопустимых символах */}
                  {slugError && (
                      <p className="mt-1 text-sm text-amber-600 flex items-center gap-1">
                        <span>⚠️</span> {slugError}
                      </p>
                  )}

                  {/* Предпросмотр URL */}
                  {slug && !slugError && (
                      <p className="mt-1 text-xs text-green-600">
                        ✓ Будет доступно по адресу: {previewPath}
                      </p>
                  )}

                  {["courses", "lib", "connect", "contacts"].includes(slug) && !slugError && (
                      <p className="mt-1 text-xs text-blue-600">
                        Специальный slug: страница будет открываться по адресу /{slug}
                      </p>
                  )}

                  {/* Полезные примеры */}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="text-gray-500">✅ примеры:</span>
                    <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700">about-us</span>
                    <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700">contacts</span>
                    <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700">faq</span>
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    Будет автоматически преобразован в нижний регистр и очищен от кириллицы и спецсимволов.
                  </p>
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
                        <div className={`h-4 w-4 rounded-full border ${template === "text" ? "border-[#4CAF50] bg-[#4CAF50]" : "border-gray-300"}`}></div>
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
                        <div className={`h-4 w-4 rounded-full border ${template === "empty" ? "border-[#4CAF50] bg-[#4CAF50]" : "border-gray-300"}`}></div>
                        <span className="font-medium text-gray-900">Пустой</span>
                      </div>
                      <p className="mt-2 text-xs text-gray-600">
                        Произвольный HTML-код. Для опытных пользователей.
                      </p>
                    </button>
                  </div>
                  <input type="hidden" name="template" value={template} />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Содержимое {template === "empty" ? "(HTML)" : "(текст)"} *
                  </label>
                  <textarea
                      id="content"
                      name="content"
                      required
                      placeholder={template === "empty" ? "<div>Ваш HTML-код здесь</div>" : "Текст вашей страницы..."}
                      rows={10}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-[#4CAF50] focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                  />
                  {template === "empty" && (
                      <p className="mt-1 text-xs text-gray-500">
                        Можно использовать HTML, CSS, JavaScript. Будьте осторожны с кодом.
                      </p>
                  )}
                </div>

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
                    <p className="text-sm font-medium text-gray-900">Опубликовать сразу</p>
                    <p className="text-xs text-gray-500">
                      {isPublished ? "Страница будет доступна сразу после создания" : "Страница будет создана как черновик"}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Добавить файлы для страницы</h3>
                  <div className="max-w-md">
                    <AddImageToPage />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Загрузите файлы и скопируйте путь для вставки в HTML контент страницы.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#4CAF50] px-4 py-3 text-sm font-medium text-white hover:bg-[#43A047] active:bg-[#388E3C] transition-colors flex-1"
                      disabled={!!slugError}
                  >
                    Создать страницу
                  </button>

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
        </div>
      </div>
  );
}
