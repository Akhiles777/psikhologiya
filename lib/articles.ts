import { prisma } from "@/lib/db";

// Проверка существования модели
function checkPrismaModel() {
  if (!prisma) {
    throw new Error("Prisma client is not initialized");
  }
  
  // Проверяем, есть ли модель article (с маленькой буквы)
  const models = Object.keys(prisma).filter(key => !key.startsWith('_'));
  console.log("[articles] Available Prisma models:", models);
  
  // В Prisma модель называется article (с маленькой буквы)
  if (!prisma.article) {
    throw new Error(`Model 'article' not found in Prisma schema. Available models: ${models.join(', ')}`);
  }
  
  return prisma.article;
}

// Получить статью по slug (для клиентской части)
export async function getArticleBySlug(slug: string) {
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
}

// Получить список статей с фильтрами
export async function getArticles({ tag, authorId, catalogSlug, publishedOnly }: {
  tag?: string;
  authorId?: string;
  catalogSlug?: string;
  publishedOnly?: boolean;
} = {}) {
  try {
    const model = checkPrismaModel();
    
    return await model.findMany({
      where: {
        ...(tag ? { tags: { has: tag } } : {}),
        ...(authorId ? { authorId } : {}),
        ...(catalogSlug ? { catalogSlug } : {}),
        ...(publishedOnly ? { publishedAt: { not: null } } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      include: { author: true },
    });
  } catch (error) {
    console.error("[getArticles] Error:", error);
    return [];
  }
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
  shortText: string;
  content: string;
  tags: string[];
  authorId?: string | null;
  catalogSlug?: string | null;
  isPublished?: boolean;
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
    const createData: any = {
      title: data.title,
      slug: data.slug,
      shortText: data.shortText,
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
    
    // Проверка уникальности slug (если меняется)
    if (data.slug) {
      const exists = await model.findUnique({ where: { slug: data.slug } });
      if (exists && exists.id !== id) {
        throw new Error("Статья с таким slug уже существует");
      }
    }
    
    // Формируем данные для обновления
    const updateData: any = {
      title: data.title,
      slug: data.slug,
      shortText: data.shortText,
      content: data.content,
      tags: data.tags,
      catalogSlug: data.catalogSlug,
    };

    // Удаляем undefined поля
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

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
    
    return await model.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    console.error("[updateArticle] error:", error);
    throw error;
  }
}

// Удалить статью
export async function deleteArticle(id: string) {
  try {
    const model = checkPrismaModel();
    return await model.delete({ where: { id } });
  } catch (error) {
    console.error("[deleteArticle] error:", error);
    throw error;
  }
}

// Получить все уникальные тэги
export async function getAllArticleTags() {
  try {
    const model = checkPrismaModel();
    
    const articles = await model.findMany({ select: { tags: true } });
    const tags = new Set<string>();
    for (const a of articles) {
      for (const t of a.tags) {
        tags.add(t);
      }
    }
    return Array.from(tags);
  } catch (error) {
    console.error("[getAllArticleTags] error:", error);
    return [];
  }
}