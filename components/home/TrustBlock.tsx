/** Блок «Почему психологам из реестра можно доверять». */
export function TrustBlock() {
  return (
    <section className="border-y border-neutral-200 bg-white px-4 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl animate-fade-in-up initial-opacity">
          Почему психологам из реестра можно доверять
        </h2>
        <div className="mt-16 grid gap-10 sm:grid-cols-3">
          {[
            {
              num: "50+",
              title: "Специалистов в реестре",
              text: "Психологи из разных направлений: КПТ, гештальт, психодинамика, семейная терапия и другие. У каждого указаны образование, парадигма и уровень сертификации.",
              delay: "animate-delay-1",
            },
            {
              num: "3",
              title: "Уровня проверки",
              text: "Первый уровень — базовое образование и личная терапия. Второй — специализация и супервизия. Третий — высшая категория и большой стаж. Критерии прозрачны и едины для всех.",
              delay: "animate-delay-2",
            },
            {
              num: "100%",
              title: "Прозрачность дипломов",
              text: "В анкете каждого психолога указаны год получения диплома, организация и тип документа. Никаких «скрытых» компетенций — только то, что можно проверить.",
              delay: "animate-delay-3",
            },
          ].map((item) => (
            <div
              key={item.num}
              className={`rounded-3xl border border-neutral-200 bg-[#F5F5F7] p-8 animate-fade-in-up initial-opacity ${item.delay}`}
            >
              <p className="text-4xl font-bold text-[#5858E2]">{item.num}</p>
              <p className="mt-3 text-xl font-medium text-foreground">{item.title}</p>
              <p className="mt-4 text-base leading-relaxed text-neutral-dark">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
