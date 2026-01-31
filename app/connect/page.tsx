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
            accent: "bg-lime-100 text-lime-800"
        },
        {
            icon: "📊",
            title: "Прозрачная аналитика",
            description: "Понимайте, как клиенты находят вас и что для них важно.",
            accent: "bg-blue-100 text-blue-800"
        },
        {
            icon: "🛡️",
            title: "Защита репутации",
            description: "Проверенная платформа добавляет вес вашим сертификатам.",
            accent: "bg-[#5858E2]/10 text-[#5858E2]"
        },
        {
            icon: "🚀",
            title: "Быстрый старт",
            description: "От заявки до первой анкеты — за 72 часа.",
            accent: "bg-amber-100 text-amber-800"
        },
        {
            icon: "💎",
            title: "Премиум-позиционирование",
            description: "Выделяйтесь среди коллег профессиональным оформлением.",
            accent: "bg-purple-100 text-purple-800"
        },
        {
            icon: "🤝",
            title: "Сопровождение",
            description: "Помощь в оформлении и продвижении вашего профиля.",
            accent: "bg-emerald-100 text-emerald-800"
        }
    ];

    const steps = [
        {
            step: "01",
            title: "Знакомство",
            description: "Расскажите о своей практике в формате короткого интервью.",
            color: "border-lime-300"
        },
        {
            step: "02",
            title: "Верификация",
            description: "Проверка документов и оценка уровня сертификации.",
            color: "border-[#5858E2]"
        },
        {
            step: "03",
            title: "Оформление",
            description: "Создание уникальной анкеты с акцентами на ваши сильные стороны.",
            color: "border-amber-400"
        },
        {
            step: "04",
            title: "Запуск",
            description: "Размещение в каталоге и первые показы целевой аудитории.",
            color: "border-emerald-400"
        }
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
                            className="object-cover"
                            priority
                            sizes="100vw"
                            quality={90}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"/>
                    </div>
                </div>

                <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
                    <div className="text-center">
                        <div
                            className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 mb-8 border border-lime-200">
                            <span className="h-2 w-2 rounded-full bg-lime-500"/>
                            <span className="text-sm font-medium text-gray-800">Для психологов</span>
                        </div>

                        <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                            Присоединяйтесь к реестру
                            <span className="block mt-3 text-lime-300">«Давай вместе»</span>
                        </h1>

                        <p className="mx-auto mt-8 max-w-2xl text-lg text-white/90">
                            Место, где ваша практика встречает клиентов, которые ищут именно вас
                        </p>

                        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:gap-6">
                            <Link
                                href="/contacts"
                                className="rounded-lg bg-lime-500 px-8 py-3 font-medium text-white hover:bg-lime-600"
                            >
                                Начать сотрудничество
                            </Link>
                            <Link
                                href="/psy-list"
                                className="rounded-lg border-2 border-white bg-transparent px-8 py-3 font-medium text-white hover:bg-white/10"
                            >
                                Смотреть каталог
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Преимущества */}
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px w-12 bg-lime-500"/>
                        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            Почему выбирают нас
                        </h2>
                    </div>
                    <p className="text-gray-600">
                        Более 800 психологов уже доверили нам свою практику
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {benefits.map((item, index) => (
                        <div
                            key={index}
                            className="border border-gray-200 bg-white p-6 rounded-xl hover:border-lime-300"
                        >
                            <div
                                className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-lime-100 text-xl">
                                {item.icon}
                            </div>

                            <h3 className="mb-3 text-lg font-bold text-gray-900">
                                {item.title}
                            </h3>

                            <p className="text-gray-600">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Процесс */}
            <div className="bg-gradient-to-b from-lime-50/30 to-white py-16 sm:py-20">
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    <div className="mb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px w-12 bg-[#5858E2]"/>
                            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                Как присоединиться
                            </h2>
                        </div>
                        <p className="text-gray-600">
                            Простой путь от знакомства до первых клиентов
                        </p>
                    </div>

                    <div className="space-y-8">
                        {steps.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-6"
                            >
                                <div
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5858E2] text-white font-bold">
                                    {index + 1}
                                </div>
                                <div>
                                    <h3 className="mb-2 text-xl font-bold text-gray-900">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {item.description}
                                    </p>
                                    <div className="mt-3 text-sm text-gray-500">
                                        Срок: 1-2 дня
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Сертификация */}
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
                <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white">
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px w-12 bg-lime-400"/>
                            <h2 className="text-2xl font-bold text-white sm:text-3xl">
                                Уровни сертификации
                            </h2>
                        </div>
                        <p className="text-gray-300">
                            Прозрачная система, которая помогает клиентам понять ваш уровень
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        <div>
                            <div className="space-y-4">
                                {[
                                    {level: "1", title: "Базовый", desc: "Начальная практика", color: "bg-lime-500"},
                                    {
                                        level: "2",
                                        title: "Продвинутый",
                                        desc: "Стабильная практика",
                                        color: "bg-[#5858E2]"
                                    },
                                    {level: "3", title: "Экспертный", desc: "Глубокий опыт", color: "bg-amber-500"}
                                ].map((item) => (
                                    <div
                                        key={item.level}
                                        className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
                                    >
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-lg ${item.color} font-bold`}>
                                            {item.level}
                                        </div>
                                        <div>
                                            <div className="font-bold">{item.title}</div>
                                            <div className="text-sm text-gray-400">{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <Link
                                    href="/certification-levels"
                                    className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-gray-900"
                                >
                                    Подробнее
                                </Link>
                            </div>
                        </div>

                        <div>
                            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                                <h4 className="mb-6 text-xl font-bold">Критерии оценки</h4>

                                <div className="space-y-6">
                                    {[
                                        {label: "Опыт практики", value: "85%", color: "bg-lime-500"},
                                        {label: "Образование", value: "90%", color: "bg-[#5858E2]"},
                                        {label: "Супервизия", value: "75%", color: "bg-amber-500"}
                                    ].map((item) => (
                                        <div key={item.label}>
                                            <div className="mb-2 flex justify-between">
                                                <span>{item.label}</span>
                                                <span className="font-bold">{item.value}</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                                                <div
                                                    className={`h-full ${item.color} rounded-full`}
                                                    style={{width: item.value}}
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

            {/* CTA */}
            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
                <div className="rounded-2xl bg-gradient-to-r from-[#5858E2] to-lime-500 p-8 text-center text-white">
                    <h2 className="mb-6 text-2xl font-bold sm:text-3xl">
                        Начните сейчас
                    </h2>

                    <p className="mb-8 text-lg text-white/90">
                        Первая консультация бесплатно. Обсудим, как реестр поможет именно вам.
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                        <Link
                            href="/contacts"
                            className="rounded-lg bg-white px-8 py-3 font-medium text-[#5858E2]"
                        >
                            Записаться
                        </Link>
                        <Link
                            href="/psy-list"
                            className="rounded-lg border-2 border-white px-8 py-3 font-medium text-white"
                        >
                            Примеры анкет
                        </Link>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/20">
                        <p className="text-sm text-white/80">
                            Отвечаем в течение 4 часов
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}