"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isDbSyncError } from "@/lib/db-error";

/** Список всех страниц для админки */
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

/** Создать страницу */
export async function createPage(formData: FormData) {
  if (!prisma) throw new Error("База данных недоступна");

  const title = (formData.get("title") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim().toLowerCase().replace(/\s+/g, "-");
  if (!title || !slug) throw new Error("Укажите название и slug");

  const template = ((formData.get("template") as string)?.trim() === "empty" ? "empty" : "text") as "text" | "empty";
  const content = (formData.get("content") as string)?.trim() || "";
  const isPublished = formData.get("isPublished") === "on";

  try {
    await prisma.page.create({
      data: { title, slug, template, content, isPublished },
    });
  } catch (err) {
    if (isDbSyncError(err)) redirect("/admin/pages?error=db_sync");
    throw err;
  }

  revalidatePath("/admin/pages");
  revalidatePath(`/s/${slug}`);
  redirect("/admin/pages");
}

/** Обновить страницу */
export async function updatePage(id: string, formData: FormData) {
  if (!prisma) throw new Error("База данных недоступна");

  const title = (formData.get("title") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim().toLowerCase().replace(/\s+/g, "-");
  if (!title || !slug) throw new Error("Укажите название и slug");

  const template = ((formData.get("template") as string)?.trim() === "empty" ? "empty" : "text") as "text" | "empty";
  const content = (formData.get("content") as string)?.trim() || "";
  const isPublished = formData.get("isPublished") === "on";

  try {
    const old = await prisma.page.findUnique({ where: { id }, select: { slug: true } });
    await prisma.page.update({
      where: { id },
      data: { title, slug, template, content, isPublished },
    });
    revalidatePath("/admin/pages");
    revalidatePath(`/s/${slug}`);
    if (old?.slug !== slug) revalidatePath(`/s/${old?.slug}`);
  } catch (err) {
    if (isDbSyncError(err)) redirect("/admin/pages?error=db_sync");
    throw err;
  }
  redirect("/admin/pages");
}

/** Удалить страницу */
export async function deletePage(id: string) {
  if (!prisma) throw new Error("База данных недоступна");
  try {
    await prisma.page.delete({ where: { id } });
  } catch (err) {
    if (isDbSyncError(err)) redirect("/admin/pages?error=db_sync");
    throw err;
  }
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}
