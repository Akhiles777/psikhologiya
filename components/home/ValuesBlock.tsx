/** Блок «Ценности»: прозрачность, безопасность, доступность. */
export function ValuesBlock() {
  return (
    <section className="bg-[#F5F5F7] px-4 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl animate-fade-in-up initial-opacity">
          Наши ценности
        </h2>
        <p className="mt-6 max-w-2xl text-xl leading-relaxed text-neutral-dark animate-fade-in-up initial-opacity animate-delay-1">
          Реестр «Давай вместе» строится на трёх принципах: вы знаете, с кем работаете, как он подготовлен и что можете от него ожидать.
        </p>
        <div className="mt-16 grid gap-10 sm:grid-cols-3">
          {[
            {
              title: "Прозрачность",
              text: "Вы видите каждый диплом и каждый сертификат. В анкете указаны год получения документа, название организации и тип образования. Никаких «скрытых» компетенций — только то, что психолог готов подтвердить.",
              delay: "animate-delay-2",
            },
            {
              title: "Безопасность",
              text: "Каждый профиль проверяется. Мы не гарантируем результат терапии — это зависит от пары «клиент–психолог», — но мы гарантируем, что в реестре только специалисты с указанным образованием и уровнем сертификации.",
              delay: "animate-delay-3",
            },
            {
              title: "Доступность",
              text: "Каталог с фильтрами по цене, городу, подходу и формату работы (онлайн или офлайн). Плюс библиотека статей от психологов реестра — чтобы лучше понимать себя и процесс терапии.",
              delay: "animate-delay-4",
            },
          ].map((item) => (
            <article
              key={item.title}
              className={`rounded-3xl border border-neutral-200 bg-white p-10 shadow-sm animate-fade-in-up initial-opacity ${item.delay}`}
            >
              <h3 className="font-display text-2xl font-semibold text-foreground">{item.title}</h3>
              <p className="mt-6 text-lg leading-relaxed text-neutral-dark">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
