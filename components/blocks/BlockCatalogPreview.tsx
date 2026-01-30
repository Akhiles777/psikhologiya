import Link from "next/link";
import { getPsychologists } from "@/app/actions/catalog";
import { PsychologistCard } from "@/components/catalog/PsychologistCard";
import { Button } from "@/components/ui";
import { CATALOG_PAGE_SIZE } from "@/constants/catalog";
import type { BlockCatalogPreview as BlockCatalogPreviewType } from "@/types/blocks";

export async function BlockCatalogPreview({ block }: { block: BlockCatalogPreviewType }) {
  const limit = Math.min(block.limit ?? 6, 12);
  const { items } = await getPsychologists({}, { limit, cursor: undefined });

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="block-catalog-heading">
      <div className="mx-auto max-w-6xl">
        <h2
          id="block-catalog-heading"
          className="font-display text-2xl font-bold text-foreground sm:text-3xl"
        >
          {block.heading ?? "Психологи"}
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <PsychologistCard key={p.id} psychologist={p} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/catalog">
            <Button variant="primary" size="lg">
              Весь каталог
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
