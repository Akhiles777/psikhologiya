import Link from "next/link";

const categories = [
  { label: "КПТ", href: "/catalog?paradigms=CBT", color: "bg-primary/10 border-primary/20 hover:bg-primary/15" },
  { label: "Гештальт", href: "/catalog?paradigms=GESTALT", color: "bg-accent/20 border-accent/40 hover:bg-accent/30" },
  { label: "Семейная", href: "/catalog?paradigms=SYSTEMIC", color: "bg-primary/10 border-primary/20 hover:bg-primary/15" },
];

export function FeaturedCategories() {
  return (
    <section
      className="px-4 py-20 sm:px-6 lg:px-8"
      aria-labelledby="categories-heading"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="categories-heading"
          className="font-display text-3xl font-bold tracking-tighter text-foreground sm:text-4xl"
        >
          Популярные направления
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-dark">
          Быстрый переход к подбору по подходу.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-4 sm:grid-rows-2">
          <Link
            href={categories[0].href}
            className={`rounded-2xl border p-8 text-center font-display text-xl font-semibold text-foreground transition sm:col-span-2 sm:row-span-2 flex items-center justify-center min-h-[180px] ${categories[0].color}`}
          >
            {categories[0].label}
          </Link>
          <Link
            href={categories[1].href}
            className={`rounded-2xl border p-8 text-center font-display text-xl font-semibold text-foreground transition flex items-center justify-center min-h-[88px] ${categories[1].color}`}
          >
            {categories[1].label}
          </Link>
          <Link
            href={categories[2].href}
            className={`rounded-2xl border p-8 text-center font-display text-xl font-semibold text-foreground transition flex items-center justify-center min-h-[88px] ${categories[2].color}`}
          >
            {categories[2].label}
          </Link>
        </div>
      </div>
    </section>
  );
}
