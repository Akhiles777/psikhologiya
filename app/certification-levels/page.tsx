import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Уровни сертификации — Давай вместе",
  description:
    "Что означают уровни сертификации психологов в реестре «Давай вместе»: 1, 2 и 3 уровень.",
  path: "/certification-levels",
});

export default function CertificationLevelsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold tracking-tighter text-foreground md:text-4xl">
        Уровни сертификации
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-neutral-dark">
        В реестре «Давай вместе» у психологов указан уровень сертификации. Он отражает объём подготовки и практики специалиста и помогает сориентироваться при выборе.
      </p>

      <section className="mt-10 space-y-8">
        <div className="rounded-2xl border border-neutral-light/80 bg-white/70 p-6">
          <h2 className="font-display text-xl font-semibold text-foreground">
            1 уровень
          </h2>
          <p className="mt-2 leading-relaxed text-neutral-dark">
            Базовый уровень сертификации. Специалист прошёл необходимую подготовку и соответствует критериям реестра для первого уровня. Точные требования к уровню определяются организаторами реестра.
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-light/80 bg-white/70 p-6">
          <h2 className="font-display text-xl font-semibold text-foreground">
            2 уровень
          </h2>
          <p className="mt-2 leading-relaxed text-neutral-dark">
            Повышенный уровень. Отражает больший объём практики и/или дополнительного обучения. Критерии уточняются организаторами.
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-light/80 bg-white/70 p-6">
          <h2 className="font-display text-xl font-semibold text-foreground">
            3 уровень
          </h2>
          <p className="mt-2 leading-relaxed text-neutral-dark">
            Высший уровень сертификации в реестре. Соответствует наиболее высоким требованиям по опыту и подготовке.
          </p>
        </div>
      </section>

      <p className="mt-10 text-neutral-dark">
        Конкретные критерии и порядок присвоения уровней определяются организаторами проекта. По вопросам сертификации можно написать в разделе{" "}
        <Link href="/contacts" className="text-[#5858E2] underline hover:no-underline">
          Контакты
        </Link>
        .
      </p>

      <p className="mt-8">
        <Link href="/connect#certification" className="text-[#5858E2] underline hover:no-underline">
          Для психологов: уровни сертификации
        </Link>
        {" · "}
        <Link href="/psy-list" className="text-[#5858E2] underline hover:no-underline">
          Каталог психологов
        </Link>
      </p>
    </div>
  );
}
