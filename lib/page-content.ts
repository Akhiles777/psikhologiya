"use server";

import { prisma } from "@/lib/db";

/**
 * Возвращает опубликованную страницу по slug для отображения на сайте.
 * Используется для /courses, /lib, /connect, /contacts и /s/[slug].
 */
export async function getPageBySlug(slug: string) {
  if (!prisma) return null;
  try {
    const page = await prisma.page.findUnique({
      where: { slug, isPublished: true },
      select: { title: true, template: true, content: true },
    });
    return page;
  } catch {
    return null;
  }
}
