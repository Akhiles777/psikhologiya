import { Suspense } from "react";
import { CatalogFiltersForm } from "@/app/catalog/CatalogFiltersForm";
import { CatalogList } from "@/app/catalog/CatalogList";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Подобрать психолога — Давай вместе",
  description:
    "Каталог психологов с фильтрами по парадигме, цене, городу и уровню сертификации.",
  path: "/psy-list",
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PsyListPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold tracking-tighter text-foreground md:text-4xl">
          Подобрать психолога
        </h1>
        <p className="mt-2 text-lg leading-relaxed text-neutral-dark">
          Фильтры по стоимости, возрасту, парадигме, уровню сертификации и полу. Сортировка по цене или уровню.
        </p>
      </header>
      <CatalogFiltersForm initialSearchParams={params} />
      <Suspense fallback={<Skeleton />} key={JSON.stringify(params)}>
        <CatalogList searchParams={params} />
      </Suspense>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-96 animate-pulse rounded-2xl bg-neutral-light/50"
        />
      ))}
    </div>
  );
}
