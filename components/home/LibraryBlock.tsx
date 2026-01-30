import Link from "next/link";

/** Блок про библиотеку. */
export function LibraryBlock() {
  return (
    <section className="bg-[#F5F5F7] px-4 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl font-bold text-foreground">
          Библиотека
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-neutral-dark">
          Тематические статьи от психологов реестра: не реклама, а материалы о психике, терапии и выборе специалиста. У каждой статьи указан автор — можно перейти на его анкету. Фильтр по тегам, хронологический порядок.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/lib" className="inline-block rounded-xl bg-[#5858E2] px-6 py-3 font-semibold text-white hover:bg-[#4848d0]">
            В библиотеку
          </Link>
          <Link href="/lib/articles" className="inline-block rounded-xl border-2 border-neutral-300 px-6 py-3 font-semibold text-foreground hover:border-[#5858E2] hover:text-[#5858E2]">
            Все статьи
          </Link>
        </div>
      </div>
    </section>
  );
}
