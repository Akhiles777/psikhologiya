import Link from "next/link";
import Image from "next/image";
import { getPageBySlug } from "@/lib/page-content";
import { buildMetadata } from "@/lib/seo";
import { PageContent } from "@/components/PageContent";

export const metadata = buildMetadata({
  title: "Для психологов — Давай вместе",
  description:
    "Почему выгодно быть в реестре, как попасть, уровни сертификации. Информация для специалистов. Сервис «Давай вместе».",
  path: "/connect",
});

export default async function ConnectPage() {
  const page = await getPageBySlug("connect");

  if (page) {
    return <PageContent title={page.title} template={page.template} content={page.content} />;
  }

  const benefits = [
    {
      icon: "🎯",
      title: "Качественный трафик",
      description: "Клиенты приходят с конкретными запросами и готовы к работе.",
      accent: "bg-lime-100 text-lime-800",
    },
    {
      icon: "📊",
      title: "Прозрачная аналитика",
      description: "Понимайте, как клиенты находят вас и что для них важно.",
      accent: "bg-blue-100 text-blue-800",
    },
    {
      icon: "🛡️",
      title: "Защита репутации",
      description: "Проверенная платформа добавляет вес вашим сертификатам.",
      accent: "bg-[#5858E2]/10 text-[#5858E2]",
    },
    {
      icon: "🚀",
      title: "Быстрый старт",
      description: "От заявки до первой анкеты — за 72 часа.",
      accent: "bg-amber-100 text-amber-800",
    },
    {
      icon: "💎",
      title: "Премиум-позиционирование",
      description: "Выделяйтесь среди коллег профессиональным оформлением.",
      accent: "bg-purple-100 text-purple-800",
    },
    {
      icon: "🤝",
      title: "Сопровождение",
      description: "Помощь в оформлении и продвижении вашего профиля.",
      accent: "bg-emerald-100 text-emerald-800",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Знакомство",
      description: "Расскажите о своей практике в формате короткого интервью.",
      color: "border-lime-300",
      duration: "1-2 дня",
    },
    {
      step: "02",
      title: "Верификация",
      description: "Проверка документов и оценка уровня сертификации.",
      color: "border-[#5858E2]",
      duration: "1-2 дня",
    },
    {
      step: "03",
      title: "Оформление",
      description: "Создание уникальной анкеты с акцентами на ваши сильные стороны.",
      color: "border-amber-400",
      duration: "1-2 дня",
    },
    {
      step: "04",
      title: "Запуск",
      description: "Размещение в каталоге и первые показы целевой аудитории.",
      color: "border-emerald-400",
      duration: "1-2 дня",
    },
  ];

  const certificationLevels = [
    { level: "1", title: "Базовый", desc: "Начальная практика", color: "bg-lime-500" },
    { level: "2", title: "Продвинутый", desc: "Стабильная практика", color: "bg-[#5858E2]" },
    { level: "3", title: "Экспертный", desc: "Глубокий опыт", color: "bg-amber-500" },
  ];

  const criteria = [
    { label: "Опыт практики", value: "85%", color: "bg-lime-500" },
    { label: "Образование", value: "90%", color: "bg-[#5858E2]" },
    { label: "Супервизия", value: "75%", color: "bg-amber-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-lime-50/20">
      {/* Герой с изображением */}
      <div className="relative overflow-hidden border-b border-gray-200">
        <div className="absolute inset-0 z-0">
          <div className="relative h-full w-full">
            <Image
              src="/images/image-doctor.png"
              alt="Психологи в реестре Давай вместе"
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 mb-8 border border-lime-200 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-lime-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-800">Для психологов</span>
            </div>

            <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Присоединяйтесь к реестру
              <span className="block mt-4 text-lime-300">«Давай вместе»</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg sm:text-xl text-white/90">
              Место, где ваша практика встречает клиентов, которые ищут именно вас
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contacts"
                className="inline-flex justify-center items-center rounded-lg bg-lime-500 px-8 py-4 font-medium text-white hover:bg-lime-600 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Начать сотрудничество
              </Link>
              <Link
                href="/psy-list"
                className="inline-flex justify-center items-center rounded-lg border-2 border-white bg-transparent px-8 py-4 font-medium text-white hover:bg-white/10 transition-colors duration-200"
              >
                Смотреть каталог
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Преимущества */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="mb-12 lg:mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-1 w-12 bg-lime-500 rounded-full" />
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Почему выбирают нас
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl">
            Более 800 психологов уже доверили нам свою практику
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item, index) => (
            <div
              key={index}
              className="group relative border border-gray-200 bg-white p-6 sm:p-8 rounded-2xl hover:border-lime-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white to-lime-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-lime-100 text-2xl group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>

                <h3 className="mb-4 text-xl font-bold text-gray-900">
                  {item.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Процесс */}
      <div className="bg-gradient-to-b from-lime-50/30 to-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 lg:mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-1 w-12 bg-[#5858E2] rounded-full" />
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Как присоединиться
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl">
              Простой путь от знакомства до первых клиентов
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((item, index) => (
              <div
                key={index}
                className="relative group"
              >
                <div className="relative bg-white rounded-2xl p-6 sm:p-8 border-l-4 border-t border-r border-b border-gray-200 hover:border-lime-300 hover:shadow-lg transition-all duration-300 h-full">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5858E2] text-white font-bold text-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-3 text-xl font-bold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {item.description}
                      </p>
                      <div className="text-sm font-medium text-gray-500 bg-gray-100 inline-block px-3 py-1 rounded-full">
                        Срок: {item.duration}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Сертификация */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 sm:p-12 text-white overflow-hidden">
          <div className="relative z-10">
            <div className="mb-8 lg:mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-1 w-12 bg-lime-400 rounded-full" />
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Уровни сертификации
                </h2>
              </div>
              <p className="text-lg text-gray-300 max-w-3xl">
                Прозрачная система, которая помогает клиентам понять ваш уровень
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              <div>
                <div className="space-y-6">
                  {certificationLevels.map((item) => (
                    <div
                      key={item.level}
                      className="flex items-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors duration-200"
                    >
                      <div
                        className={`flex h-16 w-16 items-center justify-center rounded-xl ${item.color} font-bold text-2xl`}
                      >
                        {item.level}
                      </div>
                      <div className="flex-1">
                        <div className="text-xl font-bold mb-2">{item.title}</div>
                        <div className="text-gray-400">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10">
                  <Link
                    href="/certification-levels"
                    className="inline-flex items-center gap-3 rounded-xl bg-white px-8 py-4 font-medium text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Подробнее о критериях
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              <div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                  <h4 className="mb-8 text-2xl font-bold">Критерии оценки</h4>

                  <div className="space-y-8">
                    {criteria.map((item) => (
                      <div key={item.label}>
                        <div className="mb-3 flex justify-between items-center">
                          <span className="text-lg">{item.label}</span>
                          <span className="text-xl font-bold">{item.value}</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: item.value }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="rounded-3xl bg-gradient-to-r from-[#5858E2] via-[#5858E2] to-lime-500 p-8 sm:p-12 text-center text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          <div className="relative z-10">
            <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
              Начните сейчас
            </h2>

            <p className="mx-auto mb-10 max-w-2xl text-lg sm:text-xl text-white/90">
              Первая консультация бесплатно. Обсудим, как реестр поможет именно вам.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/contacts"
                className="inline-flex justify-center items-center rounded-xl bg-white px-10 py-4 font-medium text-[#5858E2] hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                Записаться на консультацию
              </Link>
              <Link
                href="/psy-list"
                className="inline-flex justify-center items-center rounded-xl border-2 border-white px-10 py-4 font-medium text-white hover:bg-white/10 transition-colors duration-200 w-full sm:w-auto"
              >
                Примеры анкет
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-white/20">
              <p className="text-base text-white/80 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Отвечаем в течение 4 часов
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}