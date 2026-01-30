export function SelectionAlgorithm() {
  return (
    <section
      className="border-y border-neutral-light/60 bg-white/50 px-4 py-20 sm:px-6 lg:px-8"
      aria-labelledby="cert-heading"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="cert-heading"
          className="font-display text-3xl font-bold tracking-tighter text-foreground sm:text-4xl"
        >
          Система сертификации
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-dark">
          Как мы отбираем специалистов. Три уровня — от базового до высшей категории.
        </p>
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          <article className="rounded-2xl border border-neutral-light/80 bg-background p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 font-display text-xl font-bold text-primary">
              1
            </span>
            <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
              Уровень 1
            </h3>
            <p className="mt-3 leading-relaxed text-neutral-dark">
              Базовое высшее образование и личная терапия.
            </p>
          </article>
          <article className="rounded-2xl border border-neutral-light/80 bg-background p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/30 font-display text-xl font-bold text-foreground">
              2
            </span>
            <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
              Уровень 2
            </h3>
            <p className="mt-3 leading-relaxed text-neutral-dark">
              Оконченная специализация в одном из подходов и супервизия.
            </p>
          </article>
          <article className="rounded-2xl border border-neutral-light/80 bg-background p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 font-display text-xl font-bold text-primary">
              3
            </span>
            <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
              Уровень 3
            </h3>
            <p className="mt-3 leading-relaxed text-neutral-dark">
              Высшая категория, признание ассоциациями и большой стаж.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
