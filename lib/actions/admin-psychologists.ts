"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isDbSyncError } from "@/lib/db-error";

/** Список всех психологов для админки */
export async function getPsychologistsList() {
  if (!prisma) return [];
  try {
  const list = await prisma.psychologist.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      fullName: true,
      city: true,
      isPublished: true,
      price: true,
    },
  });
  return list;
  } catch (err) {
    if (isDbSyncError(err)) return [];
    throw err;
  }
}

/** Один психолог по id для формы редактирования */
export async function getPsychologistById(id: string) {
  if (!prisma) return null;
  try {
    const p = await prisma.psychologist.findUnique({
      where: { id },
    });
    return p;
  } catch (err) {
    if (isDbSyncError(err)) return null;
    throw err;
  }
}

type EducationItem = {
  year?: string | number;
  type?: string;
  organization?: string;
  title?: string;
  isDiploma?: boolean;
};

/** Создать психолога */
export async function createPsychologist(formData: FormData) {
  if (!prisma) throw new Error("База данных недоступна");

  const fullName = (formData.get("fullName") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim().toLowerCase().replace(/\s+/g, "-");
  if (!fullName || !slug) throw new Error("Укажите ФИО и slug");

  const gender = (formData.get("gender") as string)?.trim() || "Не указан";
  const birthDateStr = (formData.get("birthDate") as string)?.trim();
  const birthDate = birthDateStr ? new Date(birthDateStr) : new Date("1990-01-01");
  const city = (formData.get("city") as string)?.trim() || "";
  const workFormat = (formData.get("workFormat") as string)?.trim() || "Онлайн и оффлайн";
  const firstDiplomaStr = (formData.get("firstDiplomaDate") as string)?.trim();
  const lastCertStr = (formData.get("lastCertificationDate") as string)?.trim();
  const paradigmStr = (formData.get("mainParadigm") as string)?.trim();
  const mainParadigm = paradigmStr ? paradigmStr.split("\n").map((s) => s.trim()).filter(Boolean) : [];
  const certificationLevel = Math.min(3, Math.max(1, parseInt((formData.get("certificationLevel") as string) || "1", 10)));
  const shortBio = (formData.get("shortBio") as string)?.trim().slice(0, 400) || "";
  const longBio = (formData.get("longBio") as string)?.trim() || "";
  const price = Math.max(0, parseInt((formData.get("price") as string) || "0", 10));
  const contactInfo = (formData.get("contactInfo") as string)?.trim() || "";
  const isPublished = formData.get("isPublished") === "on";
  const imagesStr = (formData.get("images") as string)?.trim();
  const images = imagesStr ? imagesStr.split("\n").map((s) => s.trim()).filter(Boolean) : [];
  const educationStr = (formData.get("education") as string)?.trim();
  let education: EducationItem[] = [];
  if (educationStr) {
    try {
      education = JSON.parse(educationStr) as EducationItem[];
      if (!Array.isArray(education)) education = [];
    } catch {
      education = [];
    }
  }

  try {
    await prisma.psychologist.create({
      data: {
        fullName,
        slug,
        gender,
        birthDate,
        city,
        workFormat,
        firstDiplomaDate: firstDiplomaStr ? new Date(firstDiplomaStr) : null,
        lastCertificationDate: lastCertStr ? new Date(lastCertStr) : null,
        mainParadigm,
        certificationLevel,
        shortBio,
        longBio,
        price,
        contactInfo,
        isPublished,
        images,
        education,
      },
    });
  } catch (err) {
    if (isDbSyncError(err)) redirect("/admin/psychologists?error=db_sync");
    throw err;
  }

  revalidatePath("/admin/psychologists");
  revalidatePath("/psy-list");
  redirect("/admin/psychologists");
}

/** Обновить психолога */
export async function updatePsychologist(id: string, formData: FormData) {
  if (!prisma) throw new Error("База данных недоступна");

  const fullName = (formData.get("fullName") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim().toLowerCase().replace(/\s+/g, "-");
  if (!fullName || !slug) throw new Error("Укажите ФИО и slug");

  const gender = (formData.get("gender") as string)?.trim() || "Не указан";
  const birthDateStr = (formData.get("birthDate") as string)?.trim();
  const birthDate = birthDateStr ? new Date(birthDateStr) : new Date("1990-01-01");
  const city = (formData.get("city") as string)?.trim() || "";
  const workFormat = (formData.get("workFormat") as string)?.trim() || "Онлайн и оффлайн";
  const firstDiplomaStr = (formData.get("firstDiplomaDate") as string)?.trim();
  const lastCertStr = (formData.get("lastCertificationDate") as string)?.trim();
  const paradigmStr = (formData.get("mainParadigm") as string)?.trim();
  const mainParadigm = paradigmStr ? paradigmStr.split("\n").map((s) => s.trim()).filter(Boolean) : [];
  const certificationLevel = Math.min(3, Math.max(1, parseInt((formData.get("certificationLevel") as string) || "1", 10)));
  const shortBio = (formData.get("shortBio") as string)?.trim().slice(0, 400) || "";
  const longBio = (formData.get("longBio") as string)?.trim() || "";
  const price = Math.max(0, parseInt((formData.get("price") as string) || "0", 10));
  const contactInfo = (formData.get("contactInfo") as string)?.trim() || "";
  const isPublished = formData.get("isPublished") === "on";
  const imagesStr = (formData.get("images") as string)?.trim();
  const images = imagesStr ? imagesStr.split("\n").map((s) => s.trim()).filter(Boolean) : [];
  const educationStr = (formData.get("education") as string)?.trim();
  let education: EducationItem[] = [];
  if (educationStr) {
    try {
      education = JSON.parse(educationStr) as EducationItem[];
      if (!Array.isArray(education)) education = [];
    } catch {
      education = [];
    }
  }

  try {
    await prisma.psychologist.update({
      where: { id },
      data: {
        fullName,
        slug,
        gender,
        birthDate,
        city,
        workFormat,
        firstDiplomaDate: firstDiplomaStr ? new Date(firstDiplomaStr) : null,
        lastCertificationDate: lastCertStr ? new Date(lastCertStr) : null,
        mainParadigm,
        certificationLevel,
        shortBio,
        longBio,
        price,
        contactInfo,
        isPublished,
        images,
        education,
      },
    });
  } catch (err) {
    if (isDbSyncError(err)) redirect("/admin/psychologists?error=db_sync");
    throw err;
  }

  revalidatePath("/admin/psychologists");
  revalidatePath("/psy-list");
  revalidatePath(`/psy-list/${slug}`);
  redirect("/admin/psychologists");
}

/** Удалить психолога */
export async function deletePsychologist(id: string) {
  if (!prisma) throw new Error("База данных недоступна");
  try {
    await prisma.psychologist.delete({ where: { id } });
  } catch (err) {
    if (isDbSyncError(err)) redirect("/admin/psychologists?error=db_sync");
    throw err;
  }
  revalidatePath("/admin/psychologists");
  revalidatePath("/psy-list");
  redirect("/admin/psychologists");
}
