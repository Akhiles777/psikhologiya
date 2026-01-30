import Link from "next/link";
import { Button } from "@/components/ui";
import type { BlockHero as BlockHeroType } from "@/types/blocks";

export function BlockHero({ block }: { block: BlockHeroType }) {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8" aria-labelledby="block-hero-title">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
      <div className="relative mx-auto max-w-4xl text-center">
        <h1
          id="block-hero-title"
          className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl"
        >
          {block.title}
        </h1>
        {block.subtitle && (
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-dark sm:text-xl">
            {block.subtitle}
          </p>
        )}
        {block.ctaText && block.ctaHref && (
          <div className="mt-10">
            <Link href={block.ctaHref}>
              <Button variant="primary" size="lg">
                {block.ctaText}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
