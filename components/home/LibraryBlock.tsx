import Link from "next/link";

/** Блок про библиотеку статей. */
export function LibraryBlock() {
  return (
    <section className="bg-[#F5F5F7] px-4 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl animate-fade-in-up initial-opacity">
          Библиотека
        </h2>
        <p className="mt-6 max-w-2xl text-xl leading-relaxed text-neutral-dark animate-fade-in-up initial-opacity animate-delay-1">
          В разделе «Библиотека» публикуются тематические статьи от психологов реестра. Это не реклама, а материалы о том, как устроена психика, что такое терапия и как выбрать специалиста.
        </p>
        <p className="mt-6 text-lg leading-relaxed text-neutral-dark animate-fade-in-up initial-opacity animate-delay-2">
          У каждой статьи указан автор — можно перейти на его анкету и связаться с ним. Статьи можно фильтровать по тегам и смотреть в хронологическом порядке.
        </p>
        <div className="mt-14 flex flex-wrap gap-4 animate-fade-in-up initial-opacity animate-delay-3">
          <Link
            href="/lib"
            className="inline-block rounded-2xl bg-[#5858E2] px-8 py-4 text-lg font-semibold text-white transition hover:bg-[#4848d0]"
          >
            В библиотеку
          </Link>
          <Link
            href="/lib/articles"
            className="inline-block rounded-2xl border-2 border-neutral-300 px-8 py-4 text-lg font-semibold text-foreground transition hover:border-[#5858E2] hover:text-[#5858E2]"
          >
            Все статьи
          </Link>
        </div>
      </div>
    </section>
  );
}
