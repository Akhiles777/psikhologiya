import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/articles";
import { Badge } from "@/components/ui/Badge";
import { buildMetadata } from "@/lib/seo";
import { ArticleAuthorBadge } from "@/components/articles/ArticleAuthorBadge";
import type { Metadata } from "next";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params; // Добавьте await здесь
  
  try {
    const article = await getArticleBySlug(slug);
    
    if (!article) {
      return buildMetadata({ 
        title: "Статья не найдена", 
        path: `/lib/articles/${slug}` 
      });
    }
    
    return buildMetadata({
      title: article.title,
      description: article.shortText || article.content?.slice(0, 160).replace(/<[^>]+>/g, "") || "",
      path: `/lib/articles/${slug}`,
    });
  } catch (error) {
    console.error("[generateMetadata] Error:", error);
    return buildMetadata({ 
      title: "Ошибка загрузки статьи", 
      path: `/lib/articles/${slug}` 
    });
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params; // Добавьте await здесь
  
  try {
    console.log("[ArticlePage] Fetching article with slug:", slug);
    
    const article = await getArticleBySlug(slug);
    console.log("[ArticlePage] Article fetched:", article ? "found" : "not found");
    
    if (!article) {
      console.log("[ArticlePage] Article not found, calling notFound()");
      notFound();
    }

    const author = article.author;

    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/lib/articles"
          className="text-sm text-neutral-dark hover:text-[#5858E2]"
        >
          ← К списку статей
        </Link>

        <article className="mt-6">
          <h1 className="font-display text-3xl font-bold tracking-tighter text-foreground md:text-4xl">
            {article.title}
          </h1>
          {article.tags && article.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {article.tags.map((t: string) => (
                <Badge key={t} variant="primary">
                  {t}
                </Badge>
              ))}
            </div>
          )}
          {article.publishedAt && (
            <p className="mt-2 text-sm text-neutral-dark">
              {new Date(article.publishedAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}

          <div
            className="mt-8 prose prose-neutral max-w-none text-foreground [&_a]:text-[#5858E2] [&_a]:underline [&_ul]:list-disc [&_ol]:list-decimal"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {author && <ArticleAuthorBadge author={author} />}
        </article>
      </div>
    );
  } catch (error) {
    console.error("[ArticlePage] Error loading article:", error);
    notFound();
  }
}