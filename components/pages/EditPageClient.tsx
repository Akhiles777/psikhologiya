"use client";

import { useState } from "react";
import Link from "next/link";
import { updatePage } from "@/lib/actions/manager-pages";
import DeleteButton from "@/components/pages/DeleteButton";
import AddImageToPage from "@/components/pages/AddImageToPage";

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
  errorBanner: string | null;
  updatePage: (id: string, formData: FormData) => void;
}

export default function EditPageClient({ page, pageId, errorBanner, updatePage }: EditPageClientProps) {
  const [template, setTemplate] = useState<"text" | "empty">(
    page.template === "empty" ? "empty" : "text"
  );
  const [isPublished, setIsPublished] = useState(page.isPublished);
  const [images, setImages] = useState<string[]>(page.images ?? []);

  return (
    <div className="rounded-xl border-2 border-[#4CAF50]/20 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
  <form action={(formData) => updatePage(pageId, formData)}>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Изображения страницы</h3>
          <div className="max-w-md">
            <AddImageToPage initialImages={images} />
          </div>
        </div>
        <div className="space-y-6">
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
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">/s/</span>
              <input
                type="text"
                id="slug"
                name="slug"
                defaultValue={page.slug}
                required
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#4CAF50] focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Будет автоматически преобразован в нижний регистр и очищен от спецсимволов.
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
              defaultValue={page.content}
              required
              rows={15}
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
              <p className="text-sm font-medium text-gray-900">Опубликована</p>
              <p className="text-xs text-gray-500">
                {isPublished ? "Страница доступна на сайте" : "Страница в черновиках"}
              </p>
            </div>
          </div>

          {errorBanner && (
            <div className="rounded-lg border-2 border-red-300 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">{errorBanner}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#4CAF50] px-4 py-3 text-sm font-medium text-white hover:bg-[#43A047] active:bg-[#388E3C] transition-colors flex-1"
            >
              Сохранить изменения
            </button>
            
            <div className="flex-1">
              <DeleteButton pageId={pageId} />
            </div>
            
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