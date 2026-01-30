import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Для психологов — Давай вместе",
  description:
    "Почему выгодно быть в реестре, как попасть, уровни сертификации. Информация для специалистов. Сервис «Давай вместе».",
  path: "/connect",
});

export default function ConnectPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold tracking-tighter text-foreground md:text-4xl">
        Для психологов
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-neutral-dark">
        Реестр «Давай вместе» — это возможность быть видимым для клиентов, которые ищут проверенных специалистов с понятными критериями сертификации.
      </p>

      <section id="benefits" className="mt-12">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Почему выгодно находиться в реестре
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-neutral-dark">
          <li>Ваша анкета отображается в каталоге с фильтрами по парадигме, цене, городу и уровню сертификации.</li>
          <li>Клиенты видят единые критерии: уровни сертификации, образование, формат работы.</li>
          <li>Возможность публиковать статьи в библиотеке и указывать авторство с ссылкой на анкету.</li>
        </ul>
      </section>

      <section id="how-to-join" className="mt-12">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Как попасть в реестр и что для этого нужно
        </h2>
        <p className="mt-4 leading-relaxed text-neutral-dark">
          Условия и порядок вступления в реестр уточняются организаторами. Напишите нам через раздел «Контакты» или по указанным каналам связи — мы подскажем шаги и необходимые документы.
        </p>
      </section>

      <section id="certification" className="mt-12">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Уровни сертификации
        </h2>
        <p className="mt-4 leading-relaxed text-neutral-dark">
          В реестре используются три уровня сертификации. Они отражают объём подготовки и практики специалиста. Подробное описание уровней и критериев — на отдельной странице.
        </p>
        <p className="mt-4">
<Link
              href="/certification-levels"
              className="text-[#5858E2] underline hover:no-underline"
            >
              Что такое уровни сертификации? →
            </Link>
        </p>
      </section>

      <p className="mt-12">
        <Link href="/contacts" className="text-[#5858E2] underline hover:no-underline">
          Контакты для связи
        </Link>
        {" · "}
        <Link href="/psy-list" className="text-[#5858E2] underline hover:no-underline">
          Каталог психологов
        </Link>
      </p>
    </div>
  );
}
