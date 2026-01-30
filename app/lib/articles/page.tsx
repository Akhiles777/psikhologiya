import Link from "next/link";
import { getArticles, getArticleTags } from "@/app/actions/articles";
import { buildMetadata } from "@/lib/seo";
import { Badge } from "@/components/ui";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = buildMetadata({
  title: "Статьи — Библиотека — Давай вместе",
  description: "Тематические статьи по психологии и психотерапии от психологов реестра «Давай вместе».",
  path: "/lib/articles",
});

export default async function ArticlesListPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const tag = typeof params?.tag === "string" ? params.tag : undefined;

  const [result, tags] = await Promise.all([
    getArticles({ page, tag }),
    getArticleTags(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold tracking-tighter text-foreground md:text-4xl">
        Статьи
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-neutral-dark">
        Материалы от психологов реестра: о методах работы, саморазвитии и практических вопросах.
      </p>

      {tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href="/lib/articles"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              !tag
                ? "bg-[#5858E2] text-white"
                : "bg-neutral-light/60 text-foreground hover:bg-neutral-light"
            }`}
          >
            Все
          </Link>
          {tags.map((t) => (
            <Link
              key={t}
              href={tag === t ? "/lib/articles" : `/lib/articles?tag=${encodeURIComponent(t)}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                tag === t
                  ? "bg-[#5858E2] text-white"
                  : "bg-neutral-light/60 text-foreground hover:bg-neutral-light"
              }`}
            >
              {t}
            </Link>
          ))}
        </div>
      )}

      {result.items.length === 0 ? (
        <p className="mt-12 text-neutral-dark">Пока нет опубликованных статей.</p>
      ) : (
        <ul className="mt-10 space-y-6">
          {result.items.map((article) => (
            <li key={article.id}>
              <Link
                href={`/lib/articles/${article.slug}`}
                className="block rounded-2xl border border-neutral-light/80 bg-white/70 p-6 transition hover:border-[#5858E2]/30 hover:shadow-md"
              >
                <h2 className="font-display text-xl font-semibold text-foreground">
                  {article.title}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {article.tags.map((t) => (
                    <Badge key={t} variant="primary">
                      {t}
                    </Badge>
                  ))}
                </div>
                {article.authorName && (
                  <p className="mt-2 text-sm text-neutral-dark">Автор: {article.authorName}</p>
                )}
                {article.publishedAt && (
                  <p className="mt-1 text-sm text-neutral-dark">
                    {new Date(article.publishedAt).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {result.totalPages > 1 && (
        <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Пагинация">
          {result.page > 1 && (
            <Link
              href={
                tag
                  ? `/lib/articles?page=${result.page - 1}&tag=${encodeURIComponent(tag)}`
                  : `/lib/articles?page=${result.page - 1}`
              }
              className="rounded-lg border border-neutral-light/80 px-4 py-2 text-sm font-medium text-foreground hover:bg-neutral-light/50"
            >
              Назад
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-neutral-dark">
            Страница {result.page} из {result.totalPages}
          </span>
          {result.page < result.totalPages && (
            <Link
              href={
                tag
                  ? `/lib/articles?page=${result.page + 1}&tag=${encodeURIComponent(tag)}`
                  : `/lib/articles?page=${result.page + 1}`
              }
              className="rounded-lg border border-neutral-light/80 px-4 py-2 text-sm font-medium text-foreground hover:bg-neutral-light/50"
            >
              Вперёд
            </Link>
          )}
        </nav>
      )}

      <p className="mt-10">
        <Link href="/lib" className="text-[#5858E2] underline hover:no-underline">
          ← В библиотеку
        </Link>
      </p>
    </div>
  );
}
