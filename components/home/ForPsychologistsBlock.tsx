import Link from "next/link";

/** Блок «Для психологов». */
export function ForPsychologistsBlock() {
  return (
    <section className="border-t border-neutral-200 bg-white px-4 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl font-bold text-foreground">
          Для психологов
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-neutral-dark">
          Реестр «Давай вместе» — возможность быть видимым для клиентов с понятными критериями сертификации. Анкета в каталоге с фильтрами, статьи в библиотеке с авторством и ссылкой на анкету.
        </p>
        <p className="mt-6 text-neutral-dark">
          Как попасть в реестр и что нужно — в разделе «Для психологов». Там же — про уровни сертификации.
        </p>
        <div className="mt-10">
          <Link href="/connect" className="inline-block rounded-xl border-2 border-[#5858E2] px-6 py-3 font-semibold text-[#5858E2] hover:bg-[#5858E2] hover:text-white">
            Подробнее для психологов
          </Link>
        </div>
      </div>
    </section>
  );
}
