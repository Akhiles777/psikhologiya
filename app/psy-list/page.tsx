import { getPsychologists } from "@/app/actions/catalog";
import { CatalogWithModal } from "@/components/catalog/CatalogWithModal";
import { buildMetadata } from "@/lib/seo";
import { CATALOG_PAGE_SIZE } from "@/constants/catalog";
import { searchParamsToFilters, searchParamsToPagination } from "@/app/catalog/params";

export const metadata = buildMetadata({
  title: "Подобрать психолога — Давай вместе",
  description:
    "Каталог психологов с фильтрами по парадигме, цене, городу и уровню сертификации.",
  path: "/psy-list",
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Страница каталога: слева — фильтры (чекбоксы), в центре — карточки психологов.
 * Клик по карточке открывает модальное окно; из модалки можно перейти на полную страницу.
 */
export default async function PsyListPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = searchParamsToFilters(params);
  const pagination = searchParamsToPagination(params);

  const { items, nextCursor, hasMore } = await getPsychologists(filters, {
    ...pagination,
    limit: CATALOG_PAGE_SIZE,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Подобрать психолога
        </h1>
        <p className="mt-2 text-lg leading-relaxed text-neutral-dark">
          Выберите фильтры слева и нажмите «Найти». Клик по карточке откроет краткую информацию; кнопка «Подробнее» ведёт на полную анкету.
        </p>
      </header>
      <CatalogWithModal
        items={items}
        nextCursor={nextCursor}
        hasMore={hasMore ?? false}
        searchParams={params}
      />
    </div>
  );
}
