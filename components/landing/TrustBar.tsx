export function TrustBar() {
  return (
    <section
      className="border-y border-neutral-light/60 bg-white/50 px-4 py-8 sm:px-6 lg:px-8"
      aria-label="Цифры доверия"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-12 sm:gap-16">
        <div className="text-center">
          <p className="font-display text-3xl font-bold tracking-tighter text-primary sm:text-4xl">
            50+
          </p>
          <p className="mt-1 text-sm text-neutral-dark">специалистов</p>
        </div>
        <div className="text-center">
          <p className="font-display text-3xl font-bold tracking-tighter text-primary sm:text-4xl">
            3
          </p>
          <p className="mt-1 text-sm text-neutral-dark">уровня проверки</p>
        </div>
        <div className="text-center">
          <p className="font-display text-3xl font-bold tracking-tighter text-primary sm:text-4xl">
            100%
          </p>
          <p className="mt-1 text-sm text-neutral-dark">прозрачность дипломов</p>
        </div>
      </div>
    </section>
  );
}
