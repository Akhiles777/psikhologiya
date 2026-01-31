import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Уровни сертификации — Давай вместе",
  description:
      "Что означают уровни сертификации психологов в реестре «Давай вместе»: 1, 2 и 3 уровень.",
  path: "/certification-levels",
});

export default function CertificationLevelsPage() {
  const levels = [
    {
      level: 1,
      title: "1 уровень",
      subtitle: "Базовый уровень",
      description: "Базовый уровень сертификации. Специалист прошёл необходимую подготовку и соответствует критериям реестра для первого уровня. Точные требования к уровню определяются организаторами реестра.",
      color: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      badgeColor: "bg-blue-100 text-blue-800",
      icon: "📘"
    },
    {
      level: 2,
      title: "2 уровень",
      subtitle: "Повышенный уровень",
      description: "Повышенный уровень. Отражает больший объём практики и/или дополнительного обучения. Критерии уточняются организаторами.",
      color: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      textColor: "text-purple-800",
      badgeColor: "bg-purple-100 text-purple-800",
      icon: "📗"
    },
    {
      level: 3,
      title: "3 уровень",
      subtitle: "Высший уровень",
      description: "Высший уровень сертификации в реестре. Соответствует наиболее высоким требованиям по опыту и подготовке.",
      color: "from-emerald-50 to-emerald-100",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-800",
      badgeColor: "bg-emerald-100 text-emerald-800",
      icon: "📙"
    }
  ];

  return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F5F7]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Заголовок */}
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Уровни сертификации
            </h1>
            <p className="mt-6 text-xl leading-relaxed text-neutral-dark max-w-3xl mx-auto">
              В реестре «Давай вместе» каждый психолог имеет уровень сертификации, который отражает объём подготовки и практики специалиста.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#5858E2]/10 px-4 py-2">
            <span className="text-sm font-medium text-[#5858E2]">
              🎯 Помогает сделать осознанный выбор
            </span>
            </div>
          </div>

          {/* Уровни сертификации */}
          <div className="grid gap-8 md:grid-cols-3">
            {levels.map((item) => (
                <div
                    key={item.level}
                    className={`relative rounded-3xl border-2 ${item.borderColor} bg-gradient-to-br ${item.color} p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
                >
                  {/* Иконка и бейдж */}
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 text-3xl shadow-sm">
                      {item.icon}
                    </div>
                    <span className={`rounded-full ${item.badgeColor} px-4 py-1.5 text-sm font-bold`}>
                  Уровень {item.level}
                </span>
                  </div>

                  {/* Заголовок */}
                  <h2 className={`font-display text-2xl font-bold ${item.textColor}`}>
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-neutral-600">
                    {item.subtitle}
                  </p>

                  {/* Описание */}
                  <p className="mt-6 leading-relaxed text-neutral-800">
                    {item.description}
                  </p>

                  {/* Декоративный элемент */}
                  <div className="mt-8 pt-6 border-t border-white/50">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-white/50"></div>
                      <span className="text-xs font-medium text-neutral-600">
                    Уровень {item.level} из 3
                  </span>
                    </div>
                  </div>
                </div>
            ))}
          </div>

          {/* Сравнительная таблица */}
          <div className="mt-20 rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8">
              Сравнение уровней
            </h2>
            <div className="overflow-hidden rounded-2xl border border-neutral-200">
              <table className="w-full">
                <thead className="bg-[#5858E2]/10">
                <tr>
                  <th className="px-6 py-4 text-left font-display font-bold text-foreground">Критерий</th>
                  <th className="px-6 py-4 text-center font-display font-bold text-blue-700">Уровень 1</th>
                  <th className="px-6 py-4 text-center font-display font-bold text-purple-700">Уровень 2</th>
                  <th className="px-6 py-4 text-center font-display font-bold text-emerald-700">Уровень 3</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                <tr className="hover:bg-[#F5F5F7]/50">
                  <td className="px-6 py-4 font-medium text-foreground">Опыт практики</td>
                  <td className="px-6 py-4 text-center text-sm text-neutral-700">Базовый</td>
                  <td className="px-6 py-4 text-center text-sm text-neutral-700">Средний</td>
                  <td className="px-6 py-4 text-center text-sm text-neutral-700">Значительный</td>
                </tr>
                <tr className="hover:bg-[#F5F5F7]/50">
                  <td className="px-6 py-4 font-medium text-foreground">Обучение</td>
                  <td className="px-6 py-4 text-center text-sm text-neutral-700">Основное</td>
                  <td className="px-6 py-4 text-center text-sm text-neutral-700">Дополнительное</td>
                  <td className="px-6 py-4 text-center text-sm text-neutral-700">Продвинутое</td>
                </tr>
                <tr className="hover:bg-[#F5F5F7]/50">
                  <td className="px-6 py-4 font-medium text-foreground">Супервизия</td>
                  <td className="px-6 py-4 text-center text-sm text-neutral-700">Рекомендуется</td>
                  <td className="px-6 py-4 text-center text-sm text-neutral-700">Регулярная</td>
                  <td className="px-6 py-4 text-center text-sm text-neutral-700">Обязательная</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Информационный блок */}
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col gap-6 rounded-2xl bg-gradient-to-r from-[#5858E2]/10 to-[#F5F5F7] p-8">
              <h3 className="font-display text-2xl font-bold text-foreground">
                Как присваиваются уровни?
              </h3>
              <p className="text-lg text-neutral-700 max-w-2xl mx-auto">
                Конкретные критерии и порядок присвоения уровней определяются организаторами проекта на основе экспертной оценки.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                    href="/contacts"
                    className="rounded-xl bg-[#5858E2] px-8 py-3 font-medium text-white hover:bg-[#4848d0] transition-colors"
                >
                  Задать вопрос
                </Link>
                <Link
                    href="/connect#certification"
                    className="rounded-xl border-2 border-[#5858E2] px-8 py-3 font-medium text-[#5858E2] hover:bg-[#5858E2]/10 transition-colors"
                >
                  Для психологов
                </Link>
              </div>
            </div>
          </div>

          {/* Навигация */}
          <div className="mt-16 flex flex-wrap justify-center gap-6">
            <Link
                href="/psy-list"
                className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-foreground shadow-sm hover:shadow-md transition-shadow"
            >
              <span>👥</span>
              Перейти в каталог психологов
            </Link>
            <Link
                href="/"
                className="flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-3 font-medium text-foreground hover:bg-[#F5F5F7] transition-colors"
            >
              <span>🏠</span>
              На главную
            </Link>
          </div>

          {/* Декоративный элемент внизу */}
          <div className="mt-20 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-neutral-500">
              <div className="h-px w-12 bg-neutral-300"></div>
              <span>Давай вместе • Реестр психологов</span>
              <div className="h-px w-12 bg-neutral-300"></div>
            </div>
          </div>
        </div>
      </div>
  );
}