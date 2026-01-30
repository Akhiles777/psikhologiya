import type { BlockFeatures as BlockFeaturesType } from "@/types/blocks";

export function BlockFeatures({ block }: { block: BlockFeaturesType }) {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="block-features-heading">
      <div className="mx-auto max-w-6xl">
        {block.heading && (
          <h2
            id="block-features-heading"
            className="font-display text-2xl font-bold text-foreground sm:text-3xl"
          >
            {block.heading}
          </h2>
        )}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {block.items.map((item, i) => (
            <article
              key={i}
              className="rounded-card border border-neutral-light/80 bg-white/70 p-6 shadow-[var(--shadow-glass)] backdrop-blur-[12px]"
            >
              <h3 className="font-display text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-dark">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
