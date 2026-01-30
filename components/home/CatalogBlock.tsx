import Link from "next/link";

/** Блок про подбор психолога. */
export function CatalogBlock() {
  return (
    <section className="bg-[#F5F5F7] px-4 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl font-bold text-foreground">
          Подобрать психолога
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-neutral-dark">
          В каталоге — все психологи реестра с опцией «отображать на сайте». Задайте критерии, нажмите «Найти» — получите список анкет. Фильтры: стоимость, метод, пол, возраст, уровень сертификации, город. Сортировка по цене или уровню.
        </p>
        <div className="mt-10">
          <Link href="/psy-list" className="inline-block rounded-xl bg-[#5858E2] px-8 py-4 font-semibold text-white hover:bg-[#4848d0]">
            Перейти в каталог
          </Link>
        </div>
      </div>
    </section>
  );
}
