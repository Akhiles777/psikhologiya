import Link from "next/link";
import { getVisualPagesOverview } from "@/lib/visual-pages";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_key: "Неизвестная страница для визуального редактирования.",
};

export default async function AdminVisualPagesList({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const errorCode = typeof params.error === "string" ? params.error : "";
  const errorBanner = errorCode ? ERROR_MESSAGES[errorCode] ?? "Произошла ошибка." : null;

  const pages = await getVisualPagesOverview();

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        {errorBanner && (
          <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-3 text-amber-800 sm:rounded-xl sm:p-4">
            <p className="font-medium text-sm sm:text-base">{errorBanner}</p>
          </div>
        )}

        <div className="rounded-xl border-2 border-[#5858E2]/20 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6 lg:p-8">
          <h1 className="font-display text-xl font-bold text-gray-900 sm:text-2xl">Визуальный редактор страниц</h1>
          <p className="mt-2 text-sm text-gray-600">
            Этот раздел отдельный от HTML/текстового редактора. Здесь редактируются только фиксированные публичные страницы: главная и connect.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {pages.map((page) => (
              <div key={page.key} className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-900">{page.title}</p>
                <p className="mt-1 text-xs text-gray-600">Путь: {page.publicPath}</p>
                <p className="mt-2 text-xs text-gray-600">
                  Статус: {page.isPublished ? "опубликована" : "черновик"}
                </p>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/admin/pages/visual/${page.key}`}
                    className="rounded-lg bg-[#5858E2] px-3 py-2 text-xs font-medium text-white hover:bg-[#4848d0]"
                  >
                    Редактировать
                  </Link>
                  <Link
                    href={page.publicPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Открыть
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Link href="/admin/pages" className="text-sm font-medium text-[#5858E2] hover:text-[#4848d0]">
              ← Вернуться в HTML/текстовый раздел страниц
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
