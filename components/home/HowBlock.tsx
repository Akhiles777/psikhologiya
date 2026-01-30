import Link from "next/link";

/** Блок «Как это работает»: три шага. */
export function HowBlock() {
  const steps = [
    {
      num: 1,
      title: "Задайте фильтры",
      text: "Выберите парадигму (КПТ, гештальт, семейная терапия и др.), диапазон цены, город, пол и возраст психолога, уровень сертификации. Можно сортировать по цене или уровню.",
    },
    {
      num: 2,
      title: "Смотрите карточки",
      text: "В каталоге отображаются фото, краткое «о себе», метод, уровень сертификации, количество дипломов и курсов. Нажмите «Подробнее», чтобы открыть полную анкету с образованием и контактами.",
    },
    {
      num: 3,
      title: "Свяжитесь со специалистом",
      text: "Контакты указаны в анкете. Дальнейшее общение — напрямую с психологом. Мы не ведём запись и не берём комиссию.",
    },
  ];

  return (
    <section className="border-y border-neutral-200 bg-white px-4 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl animate-fade-in-up initial-opacity">
          Как это работает
        </h2>
        <p className="mt-6 max-w-2xl text-xl leading-relaxed text-neutral-dark animate-fade-in-up initial-opacity animate-delay-1">
          Подбор психолога в три шага: фильтры → карточки → контакт. Всё бесплатно для клиента.
        </p>
        <div className="mt-16 grid gap-10 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="flex flex-col rounded-3xl border border-neutral-200 bg-[#F5F5F7] p-10 animate-fade-in-up initial-opacity"
              style={{ animationDelay: `${(i + 2) * 0.1}s` }}
            >
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#A7FF5A] font-display text-2xl font-bold text-foreground">
                {step.num}
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="mt-4 flex-1 text-lg leading-relaxed text-neutral-dark">{step.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center animate-fade-in-up initial-opacity animate-delay-4">
          <Link
            href="/psy-list"
            className="inline-block rounded-2xl border-2 border-[#5858E2] px-8 py-4 text-lg font-semibold text-[#5858E2] transition hover:bg-[#5858E2] hover:text-white"
          >
            Открыть каталог
          </Link>
        </div>
      </div>
    </section>
  );
}
