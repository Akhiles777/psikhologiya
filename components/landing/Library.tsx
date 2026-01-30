import Link from "next/link";

export function Library() {
  return (
    <section
      className="px-4 py-20 sm:px-6 lg:px-8"
      aria-labelledby="library-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-neutral-light/80 bg-white/70 p-10 shadow-[var(--shadow-glass)] backdrop-blur-sm sm:p-14">
          <h2
            id="library-heading"
            className="font-display text-3xl font-bold tracking-tighter text-foreground sm:text-4xl"
          >
            Читайте, чтобы понимать себя
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-dark">
            Статьи от наших экспертов о том, как работает психика.
          </p>
          <p className="mt-6 text-sm text-neutral-dark">
            Раздел в разработке. Скоро здесь появятся материалы.
          </p>
        </div>
      </div>
    </section>
  );
}
