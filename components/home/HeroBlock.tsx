import Image from "next/image";
import Link from "next/link";

/** Первый блок главной: заголовок, о чём сайт, картинка, кнопка в каталог. Цвета: фон #F5F5F7, синий #5858E2, лайм #A7FF5A */
export function HeroBlock() {
  return (
    <section className="relative overflow-hidden border-b-4 border-[#5858E2] bg-[#F5F5F7] px-4 py-16 sm:px-8 sm:py-20 lg:px-12">
      <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#A7FF5A]/30 blur-3xl" aria-hidden />
      <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[#5858E2]/20 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div>
            <span className="inline-block rounded-full bg-[#A7FF5A] px-4 py-1.5 text-sm font-semibold text-foreground">
              Реестр психологов
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Находим своего психолога вместе
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-dark sm:text-lg">
              «Давай вместе» — реестр психологов с прозрачной сертификацией. Подбор по подходу, цене, городу и уровню подготовки. Образование и дипломы видны в каждой анкете.
            </p>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-neutral-dark sm:text-lg">
              Мы не продаём консультации — помогаем найти специалиста, с которым будет комфортно и безопасно работать.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-foreground sm:text-base">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#A7FF5A]" /> Фильтры по цене, методу, городу
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#A7FF5A]" /> Три уровня сертификации
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#A7FF5A]" /> Дипломы и курсы в каждой анкете
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/psy-list"
                className="inline-block rounded-xl bg-[#5858E2] px-6 py-3.5 font-semibold text-white shadow-lg hover:bg-[#4848d0]"
              >
                Подобрать психолога
              </Link>
              <Link
                href="/certification-levels"
                className="inline-block rounded-xl border-2 border-[#5858E2] px-5 py-3 font-semibold text-[#5858E2] hover:bg-[#5858E2] hover:text-white"
              >
                Уровни сертификации
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border-4 border-[#A7FF5A] bg-white shadow-xl lg:aspect-square">
            <Image
              src="/images/hero.png"
              alt="Подбор психолога: карточки специалистов"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
