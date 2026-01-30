/** Блок «Почему психологам из реестра можно доверять». */
export function TrustBlock() {
  const items = [
    { num: "50+", title: "Специалистов в реестре", text: "Разные направления: КПТ, гештальт, психодинамика, семейная терапия. У каждого указаны образование, парадигма и уровень сертификации." },
    { num: "3", title: "Уровня проверки", text: "Первый — базовое образование и личная терапия. Второй — специализация и супервизия. Третий — высшая категория и стаж. Критерии едины для всех." },
    { num: "100%", title: "Прозрачность дипломов", text: "В анкете указаны год, организация и тип документа. Никаких скрытых компетенций." },
  ];

  return (
    <section className="bg-white px-4 py-14 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          Почему психологам из реестра можно доверять
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item.num} className="rounded-xl border border-neutral-200 bg-[#F5F5F7] p-5">
              <p className="text-2xl font-bold text-[#5858E2]">{item.num}</p>
              <p className="mt-2 font-medium text-foreground">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-dark">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
