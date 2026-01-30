import Link from "next/link";

/** Блок «Как это работает». */
export function HowBlock() {
  const steps = [
    { num: 1, title: "Задайте фильтры", text: "Парадигма, цена, город, уровень сертификации. Сортировка по цене или уровню." },
    { num: 2, title: "Смотрите карточки", text: "Фото, краткое «о себе», метод, уровень, дипломы и курсы. «Подробнее» — полная анкета с образованием и контактами." },
    { num: 3, title: "Свяжитесь со специалистом", text: "Контакты в анкете. Дальнейшее общение — напрямую с психологом. Мы не ведём запись и не берём комиссию." },
  ];

  return (
    <section className="border-t border-neutral-200 bg-white px-4 py-14 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          Как это работает
        </h2>
        <p className="mt-3 text-base text-neutral-dark sm:text-lg">
          Подбор в три шага: фильтры → карточки → контакт. Бесплатно для клиента.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.num} className="flex flex-col rounded-xl border border-neutral-200 bg-[#F5F5F7] p-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#5858E2] font-display text-lg font-bold text-white shadow-md">
                {step.num}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-dark">{step.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/psy-list" className="inline-block rounded-xl border border-[#5858E2] px-5 py-2.5 font-semibold text-[#5858E2] hover:bg-[#5858E2] hover:text-white">
            Открыть каталог
          </Link>
        </div>
      </div>
    </section>
  );
}
