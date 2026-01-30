import Link from "next/link";

/** Последний блок: призыв найти психолога + контакты. */
export function CtaBlock() {
  return (
    <section className="px-4 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl rounded-3xl bg-[#5858E2] px-10 py-20 text-center sm:px-16 sm:py-24 animate-fade-in-up initial-opacity">
        <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">
          Найди своего психолога
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-xl leading-relaxed text-white/90">
          Открой каталог, задай фильтры по подходу, цене и уровню — и выбери специалиста, с которым будет комфортно работать.
        </p>
        <div className="mt-12">
          <Link
            href="/psy-list"
            className="inline-block rounded-2xl bg-[#A7FF5A] px-10 py-5 text-lg font-semibold text-foreground transition hover:bg-[#8ee64a]"
          >
            Подобрать психолога
          </Link>
        </div>
        <p className="mt-12 text-base text-white/80">
          Вопросы по реестру и сертификации:{" "}
          <a
            href="https://t.me/psy_smirnov"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            Telegram @psy_smirnov
          </a>
          {" · "}
          <Link href="/contacts" className="underline hover:no-underline">
            Контакты
          </Link>
        </p>
      </div>
    </section>
  );
}
