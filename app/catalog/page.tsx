import { Suspense } from "react";
import { CatalogFiltersForm } from "./CatalogFiltersForm";
import { CatalogList } from "./CatalogList";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Каталог психологов — Давай вместе",
  description:
    "Подберите психолога по парадигме, цене, городу и уровню сертификации. Фильтры по цене, возрасту, парадигме и уровню.",
  path: "/catalog",
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          Каталог психологов
        </h1>
        <p className="mt-2 text-lg text-neutral-dark">
          Фильтруйте по цене, возрасту, парадигме и уровню сертификации
        </p>
      </header>
      <CatalogFiltersForm initialSearchParams={params} />
      <Suspense fallback={<CatalogSkeleton />} key={JSON.stringify(params)}>
        <CatalogList searchParams={params} />
      </Suspense>
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-96 animate-pulse rounded-card bg-neutral-light/50"
        />
      ))}
    </div>
  );
}
