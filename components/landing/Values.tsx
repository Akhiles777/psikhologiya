export function Values() {
  return (
    <section
      className="px-4 py-20 sm:px-6 lg:px-8"
      aria-labelledby="values-heading"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="values-heading"
          className="font-display text-3xl font-bold tracking-tighter text-foreground sm:text-4xl"
        >
          Ценности
        </h2>
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          <article className="rounded-2xl border border-neutral-light/80 bg-white/70 p-8 shadow-[var(--shadow-glass)] backdrop-blur-sm">
            <h3 className="font-display text-xl font-semibold text-foreground">
              Прозрачность
            </h3>
            <p className="mt-4 leading-relaxed text-neutral-dark">
              Вы видите каждый диплом и каждый сертификат. Никаких &quot;скрытых&quot; компетенций.
            </p>
          </article>
          <article className="rounded-2xl border border-neutral-light/80 bg-white/70 p-8 shadow-[var(--shadow-glass)] backdrop-blur-sm">
            <h3 className="font-display text-xl font-semibold text-foreground">
              Безопасность
            </h3>
            <p className="mt-4 leading-relaxed text-neutral-dark">
              Тщательная модерация каждого профиля практикующими экспертами.
            </p>
          </article>
          <article className="rounded-2xl border border-neutral-light/80 bg-white/70 p-8 shadow-[var(--shadow-glass)] backdrop-blur-sm">
            <h3 className="font-display text-xl font-semibold text-foreground">
              Доступность
            </h3>
            <p className="mt-4 leading-relaxed text-neutral-dark">
              База знаний и подбор под любой запрос и бюджет.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
