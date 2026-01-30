import Link from "next/link";

/** Призыв к действию и контакты. */
export function CtaBlock() {
  return (
    <section className="border-t border-neutral-200 px-4 py-14 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl rounded-xl border border-[#5858E2]/20 bg-[#5858E2] px-6 py-12 text-center sm:px-10 sm:py-14">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Найди своего психолога
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/90 sm:text-lg">
          Открой каталог, задай фильтры по подходу, цене и уровню — выбери специалиста.
        </p>
        <div className="mt-8">
          <Link href="/psy-list" className="inline-block rounded-xl bg-white px-6 py-3 font-semibold text-[#5858E2] hover:bg-white/95">
            Подобрать психолога
          </Link>
        </div>
        <p className="mt-8 text-sm text-white/80">
          Вопросы: <a href="https://t.me/psy_smirnov" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Telegram @psy_smirnov</a>
          {" · "}
          <Link href="/contacts" className="underline hover:no-underline">Контакты</Link>
        </p>
      </div>
    </section>
  );
}
