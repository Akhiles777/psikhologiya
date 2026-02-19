import { notFound } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import VisualPageEditor from "@/components/pages/VisualPageEditor";
import { restorePreviousVisualPageAsManager, updateVisualPageAsManager } from "@/lib/actions/visual-pages";
import { getVisualPage, isVisualPageKey, VISUAL_PAGE_CONFIG } from "@/lib/visual-pages";

const EDIT_ERROR_MESSAGES: Record<string, string> = {
  save_failed: "Не удалось сохранить страницу. Попробуйте снова.",
  restore_failed: "Не удалось восстановить прошлую версию. Попробуйте снова.",
  no_previous_version: "Прошлая версия пока отсутствует.",
};

export default async function ManagerVisualPageEdit({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { key } = await params;
  if (!isVisualPageKey(key)) notFound();

  const config = VISUAL_PAGE_CONFIG[key];
  const data = await getVisualPage(key);
  const action = updateVisualPageAsManager.bind(null, key);
  const restoreAction = restorePreviousVisualPageAsManager.bind(null, key);

  const sp = await searchParams;
  const errorCode = typeof sp.error === "string" ? sp.error : "";
  const saved = sp.saved === "1";
  const restored = sp.restored === "1";
  const errorBanner = errorCode ? EDIT_ERROR_MESSAGES[errorCode] ?? "Ошибка сохранения." : null;

  return (
    <AuthGuard requiredPermission="pages.edit">
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
        <div className="mx-auto w-full max-w-[1800px] space-y-4">
          {saved && (
            <div className="rounded-lg border-2 border-green-300 bg-green-50 p-3 text-green-800 sm:rounded-xl sm:p-4">
              <p className="font-medium text-sm sm:text-base">Изменения сохранены.</p>
            </div>
          )}
          {restored && (
            <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-3 text-blue-800 sm:rounded-xl sm:p-4">
              <p className="font-medium text-sm sm:text-base">Прошлая версия восстановлена.</p>
            </div>
          )}
          {errorBanner && (
            <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-3 text-amber-800 sm:rounded-xl sm:p-4">
              <p className="font-medium text-sm sm:text-base">{errorBanner}</p>
            </div>
          )}

          <VisualPageEditor
            title={config.title}
            publicPath={config.publicPath}
            importSourcePath={config.publicPath}
            autoImportFromLive={!data.hasStoredContent}
            backHref="/managers/pages/visual"
            initialHtml={data.html}
            initialCss={data.css}
            initialStyleHrefs={data.styleHrefs}
            initialPublished={data.isPublished}
            submitAction={action}
            restoreAction={restoreAction}
            canRestorePrevious={data.hasPreviousVersion}
          />
        </div>
      </div>
    </AuthGuard>
  );
}
