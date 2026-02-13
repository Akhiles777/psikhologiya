"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isDbSyncError } from "@/lib/db-error";
import { promises as fs } from "fs";
import path from "path";

/** Список всех страниц для менеджеров */
export async function getPagesList() {
  if (!prisma) return [];
  try {
    const list = await prisma.page.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, slug: true, title: true, template: true, isPublished: true },
    });
    return list;

  } catch (err) {
    if (isDbSyncError(err)) return [];
    throw err;
  }
}

/** Одна страница по id для формы */
export async function getPageById(id: string) {
  if (!prisma) return null;
  try {
    const p = await prisma.page.findUnique({
      where: { id },
    });
    return p;
  } catch (err) {
    if (isDbSyncError(err)) return null;
    throw err;
  }
}


/** Создать страницу. При ошибке — редирект с ?error=... */
export async function createPage(formData: FormData) {
  if (!prisma) redirect("/managers/pages/new?error=db_unavailable");

  const title = (formData.get("title") as string)?.trim();
  const rawSlug = (formData.get("slug") as string)?.trim();
  const slug = rawSlug ? rawSlug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "") : "";
  if (!title || !slug) redirect("/managers/pages/new?error=fill_title_slug");

  const template = ((formData.get("template") as string)?.trim() === "empty" ? "empty" : "text") as string;
  const content = (formData.get("content") as string)?.trim() || "";
  const publishedVal = formData.getAll("isPublished");
  const isPublished = publishedVal[publishedVal.length - 1] === "on";
  const images = formData.getAll("images").filter(v => typeof v === "string" && v.startsWith("/pages/")) as string[];

  try {
    await prisma.page.create({
      data: { title, slug, template, content, isPublished, images },
    });
  } catch (err: unknown) {
    if (isDbSyncError(err)) redirect("/managers/pages?error=db_sync");
    const msg = err && typeof (err as { code?: string }).code === "string" ? (err as { code: string }).code : "";
    if (msg === "P2002") redirect("/managers/pages/new?error=duplicate_slug&slug=" + encodeURIComponent(slug));
    redirect("/managers/pages/new?error=create_failed");
  }
  revalidatePath("/managers/pages");
  revalidatePath(`/s/${slug}`);
  redirect("/managers/pages");
}


/** Обновить страницу. Вызывается из формы: updatePage(id, formData). */
export async function updatePage(id: string, formData: FormData) {
  if (!prisma) redirect("/managers/pages?error=db_unavailable");

  const title = (formData.get("title") as string)?.trim();
  const rawSlug = (formData.get("slug") as string)?.trim();
  const slug = rawSlug ? rawSlug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "") : "";
  if (!title || !slug) redirect("/managers/pages/" + id + "/edit?error=fill_title_slug");

  const template = ((formData.get("template") as string)?.trim() === "empty" ? "empty" : "text") as string;
  const content = (formData.get("content") as string)?.trim() || "";
  const publishedVal = formData.getAll("isPublished");
  const isPublished = publishedVal[publishedVal.length - 1] === "on";
  const images = formData.getAll("images").filter(v => typeof v === "string" && v.startsWith("/pages/")) as string[];

  try {
    const old = await prisma.page.findUnique({ where: { id }, select: { slug: true } });
    await prisma.page.update({
      where: { id },
      data: { title, slug, template, content, isPublished, images },
    });
    revalidatePath("/managers/pages");
    revalidatePath(`/s/${slug}`);
    if (old?.slug !== slug) revalidatePath(`/s/${old?.slug}`);
  } catch (err: unknown) {
    if (isDbSyncError(err)) redirect("/managers/pages?error=db_sync");
    const code = err && typeof (err as { code?: string }).code === "string" ? (err as { code: string }).code : "";
    if (code === "P2002") redirect("/managers/pages/" + id + "/edit?error=duplicate_slug");
    redirect("/managers/pages/" + id + "/edit?error=update_failed");
  }
  redirect("/managers/pages");
}

/** Удалить страницу. Вызывается из формы: deletePage(id) или deletePage(id, formData). */
export async function deletePage(id: string, _formData?: FormData) {
  if (!prisma) redirect("/managers/pages?error=db_unavailable");
  try {
    // Получаем список изображений
    const page = await prisma.page.findUnique({ where: { id }, select: { images: true } });
    if (page?.images && Array.isArray(page.images)) {
      for (const imgPath of page.images) {
        // Удаляем только файлы из public/pages
        if (typeof imgPath === "string" && imgPath.startsWith("/pages/")) {
          // Корректно формируем абсолютный путь
          const absPath = path.join(process.cwd(), "public", imgPath);
          try {
            await fs.unlink(absPath);
          } catch (e: any) {
            if (e && e.code !== "ENOENT") {
              // eslint-disable-next-line no-console
              console.error("Ошибка удаления файла:", absPath, e);
            }
          }
        }
      }
    }
    await prisma.page.delete({ where: { id } });
  } catch (err: unknown) {
    if (isDbSyncError(err)) redirect("/managers/pages?error=db_sync");
    redirect("/managers/pages?error=delete_failed");
  }
  revalidatePath("/managers/pages");
  redirect("/managers/pages");
}