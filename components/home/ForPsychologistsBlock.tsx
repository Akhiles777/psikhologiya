import Link from "next/link";

/** Блок «Для психологов»: зачем быть в реестре. */
export function ForPsychologistsBlock() {
  return (
    <section className="border-y border-neutral-200 bg-white px-4 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl animate-fade-in-up initial-opacity">
          Для психологов
        </h2>
        <p className="mt-6 max-w-2xl text-xl leading-relaxed text-neutral-dark animate-fade-in-up initial-opacity animate-delay-1">
          Реестр «Давай вместе» — это возможность быть видимым для клиентов, которые ищут проверенных специалистов с понятными критериями сертификации.
        </p>
        <ul className="mt-10 space-y-5 text-lg leading-relaxed text-neutral-dark animate-fade-in-up initial-opacity animate-delay-2">
          <li className="flex gap-3">
            <span className="text-[#A7FF5A] text-xl">✓</span>
            <span>Ваша анкета отображается в каталоге с фильтрами по парадигме, цене, городу и уровню сертификации.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#A7FF5A] text-xl">✓</span>
            <span>Клиенты видят единые критерии: уровни сертификации, образование, формат работы.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#A7FF5A] text-xl">✓</span>
            <span>Можно публиковать статьи в библиотеке и указывать авторство с ссылкой на анкету.</span>
          </li>
        </ul>
        <p className="mt-10 text-lg leading-relaxed text-neutral-dark animate-fade-in-up initial-opacity animate-delay-3">
          Как попасть в реестр и какие документы нужны — написано в разделе «Для психологов». Там же объяснение уровней сертификации и как их пройти.
        </p>
        <div className="mt-14 animate-fade-in-up initial-opacity animate-delay-4">
          <Link
            href="/connect"
            className="inline-block rounded-2xl border-2 border-[#5858E2] px-8 py-4 text-lg font-semibold text-[#5858E2] transition hover:bg-[#5858E2] hover:text-white"
          >
            Подробнее для психологов
          </Link>
        </div>
      </div>
    </section>
  );
}
