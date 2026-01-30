/** Блок «Почему психологам из реестра можно доверять». Синий + лайм. */
export function TrustBlock() {
  const items = [
    { num: "50+", title: "Специалистов в реестре", text: "Разные направления: КПТ, гештальт, психодинамика, семейная терапия. У каждого указаны образование, парадигма и уровень сертификации.", color: "bg-[#5858E2]" },
    { num: "3", title: "Уровня проверки", text: "Первый — базовое образование и личная терапия. Второй — специализация и супервизия. Третий — высшая категория и стаж. Критерии едины для всех.", color: "bg-[#A7FF5A]" },
    { num: "100%", title: "Прозрачность дипломов", text: "В анкете указаны год, организация и тип документа. Никаких скрытых компетенций.", color: "bg-[#5858E2]" },
  ];

  return (
    <section className="border-t-4 border-[#5858E2]/20 bg-white px-4 py-14 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          Почему психологам из реестра можно доверять
        </h2>
        <p className="mt-3 max-w-2xl text-neutral-dark">
          Единые критерии проверки, прозрачное образование и уровни сертификации — вы видите, с кем работаете.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item.num} className="rounded-2xl border-2 border-[#5858E2]/30 bg-[#F5F5F7] p-6 shadow-sm">
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${item.color} font-display text-xl font-bold text-foreground`}>
                {item.num}
              </span>
              <p className="mt-3 font-medium text-foreground">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-dark">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
