import Link from "next/link";
import { getPsychologists } from "@/app/actions/catalog";
import { PsychologistCard } from "@/components/catalog/PsychologistCard";
import { Button } from "@/components/ui";
import { CATALOG_PAGE_SIZE } from "@/constants/catalog";
import { buildCatalogUrl } from "@/lib/url";
import { searchParamsToFilters, searchParamsToPagination } from "./params";

type CatalogListProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export async function CatalogList({ searchParams }: CatalogListProps) {
  const filters = searchParamsToFilters(searchParams);
  const pagination = searchParamsToPagination(searchParams);

  const { items, nextCursor, hasMore } = await getPsychologists(
    filters,
    { ...pagination, limit: CATALOG_PAGE_SIZE }
  );

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-card bg-background-subtle p-12 text-center">
        <p className="font-display text-lg text-foreground">
          По заданным фильтрам никого не найдено
        </p>
        <p className="mt-2 text-sm text-neutral-dark">
          Попробуйте ослабить условия поиска
        </p>
      </div>
    );
  }

  const nextUrl =
    nextCursor != null
      ? buildCatalogUrl(searchParams, { cursor: nextCursor })
      : null;

  return (
    <div className="mt-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <PsychologistCard key={p.id} psychologist={p} />
        ))}
      </div>
      {hasMore && nextUrl && (
        <div className="mt-10 flex justify-center">
          <Link href={nextUrl}>
            <Button variant="primary" size="lg">
              Показать ещё
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
