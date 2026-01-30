/** Блок «Ценности». */
export function ValuesBlock() {
  const items = [
    { title: "Прозрачность", text: "Вы видите каждый диплом и сертификат. Год, организация, тип образования. Только то, что психолог готов подтвердить." },
    { title: "Безопасность", text: "Каждый профиль проверяется. В реестре только специалисты с указанным образованием и уровнем сертификации." },
    { title: "Доступность", text: "Каталог с фильтрами по цене, городу, подходу и формату работы. Плюс библиотека статей от психологов реестра." },
  ];

  return (
    <section className="border-t border-neutral-200 bg-[#F5F5F7] px-4 py-14 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          Наши ценности
        </h2>
        <p className="mt-3 max-w-2xl text-base text-neutral-dark sm:text-lg">
          Реестр строится на трёх принципах: вы знаете, с кем работаете, как он подготовлен и чего ожидать.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {items.map((item) => (
            <article key={item.title} className="rounded-xl border border-neutral-200 bg-white p-5">
              <h3 className="font-display text-xl font-semibold text-foreground">{item.title}</h3>
              <p className="mt-4 leading-relaxed text-neutral-dark">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
