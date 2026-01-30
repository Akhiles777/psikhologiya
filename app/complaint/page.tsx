import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Жалоба — Давай вместе",
  description: "Сообщить о нарушении или подать жалобу. Сервис «Давай вместе».",
  path: "/complaint",
});

export default function ComplaintPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold tracking-tighter text-foreground">
        Жалоба
      </h1>
      <p className="mt-4 leading-relaxed text-neutral-dark">
        Если вы столкнулись с некорректным поведением специалиста или нарушением правил сервиса, напишите нам. Мы разберём обращение и при необходимости примем меры.
      </p>
      <p className="mt-6">
        <strong className="text-foreground">Куда писать:</strong>{" "}
        <a
          href="https://t.me/psy_smirnov"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#5858E2] underline hover:no-underline"
        >
          Телеграм @psy_smirnov
        </a>
      </p>
      <p className="mt-8">
        <Link href="/contacts" className="text-[#5858E2] underline hover:no-underline">
          Все контакты
        </Link>
        {" · "}
        <Link href="/psy-list" className="text-[#5858E2] underline hover:no-underline">
          Каталог психологов
        </Link>
      </p>
    </div>
  );
}
