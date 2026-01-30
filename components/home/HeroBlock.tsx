import Image from "next/image";
import Link from "next/link";

/** Первый блок главной: заголовок, о чём сайт, картинка, кнопка в каталог. */
export function HeroBlock() {
  return (
    <section className="bg-[#F5F5F7] px-4 py-24 sm:px-8 sm:py-32 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="animate-fade-in-up initial-opacity">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
              Находим своего психолога вместе
            </h1>
            <p className="mt-8 text-xl leading-relaxed text-neutral-dark sm:max-w-xl">
              «Давай вместе» — это реестр психологов с прозрачной системой сертификации.
              Здесь можно подобрать специалиста по подходу, цене, городу и уровню подготовки.
              Каждый психолог прошёл проверку: вы видите образование, дипломы и формат работы.
            </p>
            <p className="mt-6 text-xl leading-relaxed text-neutral-dark sm:max-w-xl">
              Мы не продаём консультации — мы помогаем найти того, с кем будет комфортно и безопасно работать.
            </p>
            <div className="mt-12">
              <Link
                href="/psy-list"
                className="inline-block rounded-2xl bg-[#5858E2] px-10 py-5 text-lg font-semibold text-white transition hover:bg-[#4848d0]"
              >
                Подобрать психолога
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-white shadow-xl lg:aspect-square animate-fade-in-up initial-opacity animate-delay-2">
            <Image
              src="/images/hero.png"
              alt="Подбор психолога: карточки специалистов на экране"
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
