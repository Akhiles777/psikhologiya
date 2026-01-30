import Link from "next/link";

/** Блок про подбор психолога. Красочный акцент. */
export function CatalogBlock() {
  const filters = [
    "Стоимость сессии (от и до)",
    "Метод работы (КПТ, гештальт и др.)",
    "Город и пол",
    "Уровень сертификации (1–3)",
    "Сортировка по цене или дате",
  ];

  return (
    <section className="relative overflow-hidden border-y-4 border-[#A7FF5A]/50 bg-[#F5F5F7] px-4 py-16 sm:px-8 lg:px-12">
      <div className="absolute left-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#5858E2]/10 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-6xl">
        <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Подобрать психолога
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-neutral-dark">
          В каталоге — все психологи реестра. Задайте критерии, нажмите «Найти» — получите список анкет. У каждого указаны фото, краткое «о себе», метод, уровень, количество дипломов и курсов.
        </p>
        <div className="mt-8 rounded-2xl border-2 border-[#5858E2]/30 bg-white/80 p-6 shadow-lg">
          <p className="font-semibold text-foreground">Фильтры каталога:</p>
          <ul className="mt-3 space-y-2">
            {filters.map((f) => (
              <li key={f} className="flex items-center gap-2 text-neutral-dark">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5858E2]" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/psy-list" className="inline-block rounded-xl bg-[#5858E2] px-6 py-3.5 font-semibold text-white shadow-lg hover:bg-[#4848d0]">
            Перейти в каталог
          </Link>
          <Link href="/certification-levels" className="inline-block rounded-xl border-2 border-[#A7FF5A] bg-[#A7FF5A]/20 px-5 py-3 font-semibold text-foreground hover:bg-[#A7FF5A]/40">
            Что такое уровни?
          </Link>
        </div>
      </div>
    </section>
  );
}
