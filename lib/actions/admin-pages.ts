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

/** Создать страницу. При ошибке — редирект с ?error=... */
export async function createPage(formData: FormData) {
  if (!prisma) redirect("/admin/pages/new?error=db_unavailable");

  const title = (formData.get("title") as string)?.trim();
  const rawSlug = (formData.get("slug") as string)?.trim();
  const slug = rawSlug ? rawSlug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "") : "";
  if (!title || !slug) redirect("/admin/pages/new?error=fill_title_slug");

  const template = ((formData.get("template") as string)?.trim() === "empty" ? "empty" : "text") as "text" | "empty";
  const content = (formData.get("content") as string)?.trim() || "";
  const publishedVal = formData.getAll("isPublished");
  const isPublished = publishedVal[publishedVal.length - 1] === "on";

  try {
    await prisma.page.create({
      data: { title, slug, template, content, isPublished },
    });
  } catch (err: unknown) {
    if (isDbSyncError(err)) redirect("/admin/pages?error=db_sync");
    const msg = err && typeof (err as { code?: string }).code === "string" ? (err as { code: string }).code : "";
    if (msg === "P2002") redirect("/admin/pages/new?error=duplicate_slug&slug=" + encodeURIComponent(slug));
    redirect("/admin/pages/new?error=create_failed");
  }

  revalidatePath("/admin/pages");
  revalidatePath(`/s/${slug}`);
  redirect("/admin/pages");
}

/** Обновить страницу. Вызывается из формы: updatePage(id, formData). */
export async function updatePage(id: string, formData: FormData) {
  if (!prisma) redirect("/admin/pages?error=db_unavailable");

  const title = (formData.get("title") as string)?.trim();
  const rawSlug = (formData.get("slug") as string)?.trim();
  const slug = rawSlug ? rawSlug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "") : "";
  if (!title || !slug) redirect("/admin/pages/" + id + "/edit?error=fill_title_slug");

  const template = ((formData.get("template") as string)?.trim() === "empty" ? "empty" : "text") as "text" | "empty";
  const content = (formData.get("content") as string)?.trim() || "";
  const publishedVal = formData.getAll("isPublished");
  const isPublished = publishedVal[publishedVal.length - 1] === "on";

  try {
    const old = await prisma.page.findUnique({ where: { id }, select: { slug: true } });
    await prisma.page.update({
      where: { id },
      data: { title, slug, template, content, isPublished },
    });
    revalidatePath("/admin/pages");
    revalidatePath(`/s/${slug}`);
    if (old?.slug !== slug) revalidatePath(`/s/${old?.slug}`);
  } catch (err: unknown) {
    if (isDbSyncError(err)) redirect("/admin/pages?error=db_sync");
    const code = err && typeof (err as { code?: string }).code === "string" ? (err as { code: string }).code : "";
    if (code === "P2002") redirect("/admin/pages/" + id + "/edit?error=duplicate_slug");
    redirect("/admin/pages/" + id + "/edit?error=update_failed");
  }
  redirect("/admin/pages");
}

/** Удалить страницу. Вызывается из формы: deletePage(id) или deletePage(id, formData). */
export async function deletePage(id: string, _formData?: FormData) {
  if (!prisma) redirect("/admin/pages?error=db_unavailable");
  try {
    await prisma.page.delete({ where: { id } });
  } catch (err: unknown) {
    if (isDbSyncError(err)) redirect("/admin/pages?error=db_sync");
    redirect("/admin/pages?error=delete_failed");
  }
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}
