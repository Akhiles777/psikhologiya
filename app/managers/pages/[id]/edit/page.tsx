import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getPageById, updatePage } from "@/lib/actions/manager-pages";
import EditPageClient from "@/components/pages/EditPageClient";

export default async function EditPagePage({
                                             params,
                                             searchParams,
                                           }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Ждем params и searchParams
  const { id } = await params;
  const searchParamsObj = await searchParams;

  // Получаем данные страницы
  const page = await getPageById(id);

  if (!page) {
    notFound();
  }

  const errorMessages: Record<string, string> = {
    fill_title_slug: "Заполните заголовок корректно.",
    duplicate_slug: "Страница с таким URL уже существует.",
    update_failed: "Не удалось обновить страницу.",
    invalid_slug: "URL может содержать только латинские буквы, цифры и дефисы (-).",
  };

  const errorCode = typeof searchParamsObj.error === "string" ? searchParamsObj.error : "";
  const errorBanner = errorCode ? errorMessages[errorCode] ?? "Произошла ошибка." : null;

  return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-gray-900">
              Редактирование: {page.title}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Измените данные страницы.
            </p>
          </div>

          {errorBanner && (
              <div className="mb-4 rounded-lg border-2 border-red-300 bg-red-50 p-3 text-red-800 sm:rounded-xl sm:p-4">
                <p className="font-medium text-sm sm:text-base">{errorBanner}</p>
              </div>
          )}

          {/* Передаем данные в Client Component */}
          <EditPageClient
              page={page}
              pageId={id}
              errorBanner={errorBanner}
              updatePage={updatePage}
          />
        </div>
      </div>
  );
}