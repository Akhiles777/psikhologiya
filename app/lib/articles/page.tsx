import Link from "next/link";
import { getArticles, getArticleTags } from "@/app/actions/articles";
import { buildMetadata } from "@/lib/seo";
import { Badge } from "@/components/ui";
import { Calendar, Tag, ArrowLeft, ArrowRight, User } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

export const revalidate = 60;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const tag = typeof params?.tag === "string" ? params.tag : undefined;
  
  return buildMetadata({
    title: tag ? `Статьи по теме «${tag}» — Библиотека — Давай вместе` : "Статьи — Библиотека — Давай вместе",
    description: tag 
      ? `Статьи по психологии на тему «${tag}» от психологов реестра «Давай вместе».`
      : "Тематические статьи по психологии и психотерапии от психологов реестра «Давай вместе».",
    path: "/lib/articles",
  });
}

export default async function ArticlesListPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const tag = typeof params?.tag === "string" ? params.tag : undefined;

  const [result, tags] = await Promise.all([
    getArticles({ page, tag }),
    getArticleTags(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold text-[#5858E2] md:text-5xl">
            {tag ? `Статьи о «${tag}»` : "Блог о психологии"}
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            {tag 
              ? `Подборка статей по теме «${tag}» от практикующих психологов`
              : "Глубокие материалы о психологии, саморазвитии и отношениях от экспертов реестра"
            }
          </p>
        </div>

        {/* Фильтр по тэгам */}
        {tags.length > 0 && (
          <div className="mb-12 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-[#5858E2]" />
              <span className="font-medium text-gray-700">Выберите тему:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Link
                href="/lib/articles"
                className={`
                  px-5 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${!tag 
                    ? 'bg-[#5858E2] text-white shadow-md shadow-[#5858E2]/25' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                Все материалы
              </Link>
              
              {tags.map((t) => (
                <Link
                  key={t}
                  href={tag === t ? "/lib/articles" : `/lib/articles?tag=${encodeURIComponent(t)}`}
                  className={`
                    px-5 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${tag === t 
                      ? 'bg-[#5858E2] text-white shadow-md shadow-[#5858E2]/25' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Результаты */}
        {result.items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-xl font-medium text-gray-900">Здесь пока пусто</p>
            <p className="text-gray-500 mt-2">Скоро появятся новые статьи</p>
            {tag && (
              <Link 
                href="/lib/articles"
                className="inline-flex items-center gap-2 mt-6 text-[#5858E2] hover:gap-3 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Все статьи
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Информация о количестве */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Найдено <span className="font-semibold text-[#5858E2]">{result.total}</span> материалов
              </p>
              {tag && (
                <Link 
                  href="/lib/articles"
                  className="text-sm text-[#5858E2] hover:underline"
                >
                  Сбросить фильтр
                </Link>
              )}
            </div>

            {/* Список статей */}
            <div className="space-y-6">
              {result.items.map((article: any) => (
                <article 
                  key={article.id}
                  className="group relative bg-white rounded-2xl border border-gray-100 hover:border-[#5858E2]/20 transition-all duration-300 hover:shadow-xl overflow-hidden"
                >
                  <Link href={`/lib/articles/${article.slug}`} className="block p-8">
                    <div className="flex items-start gap-6">
                      {/* Фото автора (если есть) */}
                      {article.author?.images?.[0] && (
                        <div className="shrink-0">
                          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#5858E2]/20 group-hover:border-[#5858E2]/40 transition-colors">
                            <img 
                              src={article.author.images[0]} 
                              alt={article.author.fullName || "Автор"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        {/* Заголовок */}
                        <h2 className="font-display text-2xl font-bold text-gray-900 group-hover:text-[#5858E2] transition-colors mb-3">
                          {article.title}
                        </h2>

                        {/* Тэги */}
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {article.tags.map((t: string) => (
                              <span 
                                key={t} 
                                className="inline-flex px-3 py-1 bg-[#5858E2]/5 text-[#5858E2] rounded-full text-xs font-medium"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Мета-информация */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          {article.author?.fullName && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{article.author.fullName}</span>
                            </div>
                          )}
                          {article.publishedAt && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(article.publishedAt).toLocaleDateString("ru-RU", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Короткий текст */}
                        {article.shortText && (
                          <p className="mt-4 text-gray-600 leading-relaxed line-clamp-2">
                            {article.shortText}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Индикатор чтения */}
                    <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm text-[#5858E2] font-medium flex items-center gap-1">
                        Читать далее
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </>
        )}

        {/* Пагинация */}
        {result.totalPages > 1 && (
          <nav className="mt-12 pt-6 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                Страница {result.page} из {result.totalPages}
              </div>
              
              <div className="flex gap-3">
                {result.page > 1 && (
                  <Link
                    href={
                      tag
                        ? `/lib/articles?page=${result.page - 1}&tag=${encodeURIComponent(tag)}`
                        : `/lib/articles?page=${result.page - 1}`
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-[#5858E2]/30 hover:text-[#5858E2] hover:shadow-md transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Предыдущая
                  </Link>
                )}
                
                {result.page < result.totalPages && (
                  <Link
                    href={
                      tag
                        ? `/lib/articles?page=${result.page + 1}&tag=${encodeURIComponent(tag)}`
                        : `/lib/articles?page=${result.page + 1}`
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-[#5858E2]/30 hover:text-[#5858E2] hover:shadow-md transition-all"
                  >
                    Следующая
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </nav>
        )}

        {/* Навигация назад */}
        <div className="mt-12 text-center">
          <Link 
            href="/lib" 
            className="inline-flex items-center gap-2 text-[#5858E2] hover:gap-3 transition-all font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться в библиотеку
          </Link>
        </div>
      </div>
    </div>
  );
}
