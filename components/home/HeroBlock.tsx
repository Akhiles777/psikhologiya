import Image from "next/image";
import Link from "next/link";

/** Первый блок главной: заголовок, о чём сайт, картинка, кнопка в каталог. */
export function HeroBlock() {
  return (
    <section className="border-b border-neutral-200 bg-[#F5F5F7] px-4 py-16 sm:px-8 sm:py-20 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Находим своего психолога вместе
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-dark sm:text-lg">
              «Давай вместе» — реестр психологов с прозрачной сертификацией. Подбор по подходу, цене, городу и уровню подготовки. Образование и дипломы видны в каждой анкете.
            </p>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-neutral-dark sm:text-lg">
              Мы не продаём консультации — помогаем найти специалиста, с которым будет комфортно и безопасно работать.
            </p>
            <div className="mt-8">
              <Link
                href="/psy-list"
                className="inline-block rounded-xl bg-[#5858E2] px-6 py-3.5 font-semibold text-white hover:bg-[#4848d0]"
              >
                Подобрать психолога
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-neutral-200 bg-white lg:aspect-square">
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
