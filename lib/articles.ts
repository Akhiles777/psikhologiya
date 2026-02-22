import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

// Проверка существования модели
function checkPrismaModel() {
  if (!prisma) {
    throw new Error("Prisma client is not initialized");
  }

  // В Prisma модель называется article (с маленькой буквы)
  if (!prisma.article) {
    throw new Error("Model 'article' not found in Prisma schema");
  }
  
  return prisma.article;
}

// Получить статью по slug (для клиентской части)
export async function getArticleBySlug(slug: string) {
  return getArticleBySlugCached(slug);
}

// Получить список статей с фильтрами
export async function getArticles({ tag, authorId, catalogSlug, publishedOnly }: {
  tag?: string;
  authorId?: string;
  catalogSlug?: string;
  publishedOnly?: boolean;
} = {}) {
  return getArticlesCached(
    tag ?? null,
    authorId ?? null,
    catalogSlug ?? null,
    Boolean(publishedOnly)
  );
}

// Получить одну статью по id
export async function getArticleById(id: string) {
  try {
    const model = checkPrismaModel();
    
    const article = await model.findUnique({
      where: { id },
      include: { author: true },
    });
    
    return article ?? null;
  } catch (error) {
    console.error("[getArticleById] Error:", error);
    return null;
  }
}

export interface CreateArticleInput {
  title: string;
  slug: string;
  shortText?: string;
  content: string;
  tags: string[];
  authorId?: string | null;
  catalogSlug?: string | null;
  isPublished?: boolean;
}

function revalidateArticleViews(slugs: Array<string | null | undefined> = []) {
  revalidateTag("articles", "max");

  // Публичные страницы библиотеки
  revalidatePath("/lib/articles");
  revalidatePath("/lib/articles/[slug]", "page");

  // Служебные списки в админке и менеджерке
  revalidatePath("/admin/articles");
  revalidatePath("/managers/articles");

  const uniqSlugs = Array.from(
    new Set(
      slugs
        .map((slug) => (typeof slug === "string" ? slug.trim() : ""))
        .filter(Boolean)
    )
  );

  for (const slug of uniqSlugs) {
    revalidatePath(`/lib/articles/${slug}`);
  }
}

export async function createArticle(data: CreateArticleInput) {
  try {
    const model = checkPrismaModel();
    
    console.log("[createArticle] input:", data);
    
    // Проверка уникальности slug
    const exists = await model.findUnique({ where: { slug: data.slug } });
    if (exists) {
      throw new Error("Статья с таким slug уже существует");
    }
    
    // Формируем объект для создания
    const createData: Prisma.ArticleCreateInput = {
      title: data.title,
      slug: data.slug,
      shortText: data.shortText ?? null,
      content: data.content,
      tags: data.tags || [],
      catalogSlug: data.catalogSlug,
      publishedAt: data.isPublished ? new Date() : null,
    };
    
    // Обработка автора - используем connect
    if (data.authorId) {
      createData.author = {
        connect: { id: data.authorId }
      };
    }
    
    const article = await model.create({ data: createData });
    console.log("[createArticle] created:", article);
    revalidateArticleViews([article.slug, data.slug]);
    return article;
  } catch (e) {
    console.error("[createArticle] error:", e);
    throw e;
  }
}

// Обновить статью
// Обновить статью
export async function updateArticle(id: string, data: {
  title?: string;
  slug?: string;
  shortText?: string;
  content?: string;
  tags?: string[];
  authorId?: string | null;
  catalogSlug?: string | null;
  isPublished?: boolean;
}) {
  try {
    const model = checkPrismaModel();
    const current = await model.findUnique({
      where: { id },
      select: { slug: true },
    });
    
    // Проверка уникальности slug (если меняется)
    if (data.slug) {
      const exists = await model.findUnique({ where: { slug: data.slug } });
      if (exists && exists.id !== id) {
        throw new Error("Статья с таким slug уже существует");
      }
    }
    
    // Формируем данные для обновления
    const updateData: Prisma.ArticleUpdateInput = {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.shortText !== undefined ? { shortText: data.shortText } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.tags !== undefined ? { tags: data.tags } : {}),
      ...(data.catalogSlug !== undefined ? { catalogSlug: data.catalogSlug } : {}),
    };

    // Обработка publishedAt
    if (data.isPublished !== undefined) {
      updateData.publishedAt = data.isPublished ? new Date() : null;
    }

    // Обработка автора - используем connect/disconnect
    if (data.authorId !== undefined) {
      if (data.authorId && data.authorId !== "") {
        updateData.author = {
          connect: { id: data.authorId }
        };
      } else {
        updateData.author = {
          disconnect: true
        };
      }
    }
    
    const updated = await model.update({
      where: { id },
      data: updateData,
    });
    revalidateArticleViews([current?.slug, updated.slug, data.slug]);
    return updated;
  } catch (error) {
    console.error("[updateArticle] error:", error);
    throw error;
  }
}

// Удалить статью
export async function deleteArticle(id: string) {
  try {
    const model = checkPrismaModel();
    const current = await model.findUnique({
      where: { id },
      select: { slug: true },
    });
    const deleted = await model.delete({ where: { id } });
    revalidateArticleViews([current?.slug, deleted.slug]);
    return deleted;
  } catch (error) {
    console.error("[deleteArticle] error:", error);
    throw error;
  }
}

// Получить все уникальные тэги
export async function getAllArticleTags() {
  return getAllArticleTagsCached();
}

const getArticleBySlugCached = unstable_cache(
  async (slug: string) => {
    try {
      const model = checkPrismaModel();
      const article = await model.findUnique({
        where: { slug },
        include: { author: true },
      });
      return article ?? null;
    } catch (error) {
      console.error("[getArticleBySlug] Error:", error);
      return null;
    }
  },
  ["articles-by-slug"],
  { revalidate: 30, tags: ["articles"] }
);

const getArticlesCached = unstable_cache(
  async (
    tag: string | null,
    authorId: string | null,
    catalogSlug: string | null,
    publishedOnly: boolean
  ) => {
    try {
      const model = checkPrismaModel();
      return await model.findMany({
        where: {
          ...(tag ? { tags: { has: tag } } : {}),
          ...(authorId ? { authorId } : {}),
          ...(catalogSlug ? { catalogSlug } : {}),
          ...(publishedOnly ? { publishedAt: { not: null } } : {}),
        },
        orderBy: { publishedAt: "desc" },
        include: { author: true },
      });
    } catch (error) {
      console.error("[getArticles] Error:", error);
      return [];
    }
  },
  ["articles-list"],
  { revalidate: 20, tags: ["articles"] }
);

const getAllArticleTagsCached = unstable_cache(
  async () => {
    try {
      const model = checkPrismaModel();
      
      const articles = await model.findMany({ select: { tags: true } });
      const tags = new Set<string>();
      for (const a of articles) {
        for (const t of a.tags) {
          tags.add(t);
        }
      }
      return Array.from(tags).sort();
    } catch (error) {
      console.error("[getAllArticleTags] error:", error);
      return [];
    }
  },
  ["articles-tags"],
  { revalidate: 60, tags: ["articles"] }
);
