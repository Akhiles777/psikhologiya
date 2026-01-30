import Link from "next/link";

/** Блок про подбор психолога: что такое каталог и зачем фильтры. */
export function CatalogBlock() {
  return (
    <section className="bg-[#F5F5F7] px-4 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl animate-fade-in-up initial-opacity">
          Подобрать психолога
        </h2>
        <p className="mt-6 max-w-2xl text-xl leading-relaxed text-neutral-dark animate-fade-in-up initial-opacity animate-delay-1">
          Каталог — это сердце сайта. В нём все психологи реестра с включённой опцией «отображать на сайте». Вы задаёте критерии, нажимаете «Найти» и получаете список подходящих анкет.
        </p>
        <ul className="mt-10 list-inside list-disc space-y-3 text-lg leading-relaxed text-neutral-dark animate-fade-in-up initial-opacity animate-delay-2">
          <li><strong className="text-foreground">Стоимость</strong> — от и до в рублях за сессию.</li>
          <li><strong className="text-foreground">Метод</strong> — парадигма терапии (КПТ, гештальт, семейная и др.) или «Не важно».</li>
          <li><strong className="text-foreground">Пол и возраст</strong> — по желанию. Возраст считается по дате рождения психолога.</li>
          <li><strong className="text-foreground">Уровень сертификации</strong> — 1, 2 или 3. Что это значит, можно прочитать на отдельной странице.</li>
          <li><strong className="text-foreground">Сортировка</strong> — по цене или по уровню, по возрастанию или убыванию.</li>
        </ul>
        <p className="mt-10 text-lg leading-relaxed text-neutral-dark animate-fade-in-up initial-opacity animate-delay-3">
          В карточке отображаются главное фото, ФИО, уровень, метод, краткое «о себе», количество дипломов и курсов. Кнопка «Подробнее» ведёт на страницу психолога с полной анкетой, образованием и контактами.
        </p>
        <div className="mt-14 animate-fade-in-up initial-opacity animate-delay-4">
          <Link
            href="/psy-list"
            className="inline-block rounded-2xl bg-[#5858E2] px-10 py-5 text-lg font-semibold text-white transition hover:bg-[#4848d0]"
          >
            Перейти в каталог
          </Link>
        </div>
      </div>
    </section>
  );
}
