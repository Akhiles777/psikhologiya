"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isDbSyncError } from "@/lib/db-error";
import fs from "fs";
import path from "path";

const CURRENT_YEAR = 2026;

// Вспомогательные функции (те же самые)
function slugFromName(name: string): string {
  const translit: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
    и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  let s = name.toLowerCase().trim();
  let out = "";
  for (const c of s) {
    if (translit[c]) out += translit[c];
    else if (/[a-z0-9]/.test(c)) out += c;
    else if (/\s/.test(c) && out && out.slice(-1) !== "-") out += "-";
  }
  return out.replace(/-+/g, "-").replace(/^-|-$/g, "") || "psychologist";
}

async function saveUploadedFile(file: File): Promise<string> {
  try {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Недопустимый тип файла: ${file.type}. Разрешены: JPEG, PNG, WebP, GIF`);
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`Файл слишком большой: ${(file.size / 1024 / 1024).toFixed(2)}MB. Максимум: 5MB`);
    }

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const ext = path.extname(file.name) || '.jpg';
    const safeName = `${timestamp}_${random}${ext}`;
    
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, safeName);
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);
    
    console.log(`✅ Файл сохранен: ${filePath}`);
    
    return `/uploads/${safeName}`;
  } catch (error) {
    console.error("Ошибка сохранения файла:", error);
    throw error;
  }
}

/** Список всех психологов для менеджеров */
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

/** Один психолог по id для формы редактирования (для менеджеров) */
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

/** Создать психолога (для менеджеров) */
export async function createPsychologist(formData: FormData) {
  if (!prisma) throw new Error("База данных недоступна");

  try {
    console.log("🚀 Начало создания психолога");
    
    const fullName = (formData.get("fullName") as string)?.trim();
    if (!fullName) throw new Error("Укажите ФИО");

    let slug = (formData.get("slug") as string)?.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
    if (!slug) slug = slugFromName(fullName);

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
    const publishedVal = formData.getAll("isPublished");
    const isPublished = publishedVal[publishedVal.length - 1] === "on";
    
    // Обработка загруженных файлов
    const imageFiles = formData.getAll("images") as File[];
    const uploadedImagePaths: string[] = [];

    console.log(`📎 Получено файлов: ${imageFiles.length}`);

    for (const file of imageFiles) {
      if (file && file.size > 0 && file.name) {
        console.log(`📄 Обработка: ${file.name} (${file.size} байт, ${file.type})`);
        try {
          const imagePath = await saveUploadedFile(file);
          console.log(`✅ Сохранен: ${imagePath}`);
          uploadedImagePaths.push(imagePath);
        } catch (error) {
          console.error(`❌ Ошибка: ${file.name}`, error);
        }
      }
    }

    // Обработка текстового поля с URL изображений
    const imagesUrlsStr = (formData.get("imageUrls") as string)?.trim();
    const imageUrls = imagesUrlsStr 
      ? imagesUrlsStr.split("\n").map((s) => s.trim()).filter(Boolean) 
      : [];

    console.log(`🖼️ Файлов: ${uploadedImagePaths.length}, URL: ${imageUrls.length}`);

    // Объединяем загруженные файлы и URL
    const allImages = [...uploadedImagePaths, ...imageUrls];
    console.log(`🎯 Всего изображений: ${allImages.length}`);
    
    // Обработка образования
    const educationStr = (formData.get("education") as string)?.trim();
    let education: any[] = [];
    if (educationStr) {
      try {
        education = JSON.parse(educationStr);
        if (!Array.isArray(education)) education = [];
      } catch {
        education = [];
      }
    }

    // Создаем запись в базе данных
    console.log("💾 Сохранение в БД...");
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
        images: allImages,
        education,
      },
    });

    console.log("✅ Психолог успешно создан");

  } catch (err: unknown) {
    console.error("💥 Ошибка создания психолога:", err);
    
    if (isDbSyncError(err)) {
      redirect("/managers/psychologists?error=db_sync"); // Менеджерский путь
    }
    
    const code = err && typeof (err as { code?: string }).code === "string" 
      ? (err as { code: string }).code 
      : "";
    
    if (code === "P2002") {
      redirect("/managers/psychologists/new?error=duplicate_slug"); // Менеджерский путь
    }
    
    throw err;
  }

  revalidatePath("/managers/psychologists"); // Менеджерский путь
  revalidatePath("/psy-list");
  redirect("/managers/psychologists"); // Менеджерский путь
}

/** Обновить психолога (для менеджеров) */
export async function updatePsychologist(id: string, formData: FormData) {
  if (!prisma) throw new Error("База данных недоступна");

  try {
    console.log(`🚀 Начало обновления психолога ID: ${id}`);
    
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
    const firstDiplomaDate = firstDiplomaStr ? new Date(firstDiplomaStr) : null;
    const lastCertificationDate = lastCertStr ? new Date(lastCertStr) : null;
    
    const paradigmStr = (formData.get("mainParadigm") as string)?.trim();
    const mainParadigm = paradigmStr 
      ? paradigmStr.split("\n").map((s) => s.trim()).filter(Boolean) 
      : [];
    
    const certificationLevelRaw = (formData.get("certificationLevel") as string) || "1";
    const certificationLevel = Math.min(3, Math.max(1, parseInt(certificationLevelRaw, 10)));
    
    const shortBio = (formData.get("shortBio") as string)?.trim().slice(0, 400) || "";
    const longBio = (formData.get("longBio") as string)?.trim() || "";
    const price = Math.max(0, parseInt((formData.get("price") as string) || "0", 10));
    const contactInfo = (formData.get("contactInfo") as string)?.trim() || "";
    
    const publishedVal = formData.getAll("isPublished");
    const isPublished = publishedVal[publishedVal.length - 1] === "on";
    
    // Обработка изображений
    const imageFiles = formData.getAll("images") as File[];
    const uploadedImagePaths: string[] = [];

    console.log(`📎 Получено файлов: ${imageFiles.length}`);

    for (const file of imageFiles) {
      if (file && file.size > 0 && file.name) {
        console.log(`📄 Обработка: ${file.name} (${file.size} байт, ${file.type})`);
        try {
          const imagePath = await saveUploadedFile(file);
          console.log(`✅ Сохранен: ${imagePath}`);
          uploadedImagePaths.push(imagePath);
        } catch (error) {
          console.error(`❌ Ошибка: ${file.name}`, error);
        }
      }
    }

    // Обработка текстового поля с URL изображений
    const imagesUrlsStr = (formData.get("imageUrls") as string)?.trim();
    const imageUrls = imagesUrlsStr 
      ? imagesUrlsStr.split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
          .filter(url => url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/'))
      : [];

    console.log(`🖼️ Загруженных файлов: ${uploadedImagePaths.length}, Внешних URL: ${imageUrls.length}`);

    const allImages = [...uploadedImagePaths, ...imageUrls];
    console.log(`🎯 Всего изображений: ${allImages.length}`);

    // Удаление файлов, которые были удалены из images
    const oldPsychologist = await prisma.psychologist.findUnique({ where: { id } });
    if (oldPsychologist && Array.isArray(oldPsychologist.images)) {
      for (const oldImg of oldPsychologist.images) {
        if (
          typeof oldImg === 'string' &&
          oldImg.startsWith('/uploads/') &&
          !allImages.includes(oldImg)
        ) {
          const absPath = path.join(process.cwd(), 'public', oldImg.replace(/^\/uploads\//, 'uploads/'));
          try {
            if (fs.existsSync(absPath)) {
              fs.unlinkSync(absPath);
            }
          } catch (e) {
            console.error('Ошибка удаления файла:', absPath, e);
          }
        }
      }
    }

    // Обработка образования
    const educationStr = (formData.get("education") as string)?.trim();
    let education: any[] = [];
    if (educationStr) {
      try {
        education = JSON.parse(educationStr);
        if (!Array.isArray(education)) education = [];
      } catch {
        education = [];
      }
    }

    const updateData: any = {
      fullName,
      slug,
      gender,
      birthDate,
      city,
      workFormat,
      firstDiplomaDate,
      lastCertificationDate,
      mainParadigm,
      certificationLevel,
      shortBio,
      longBio,
      price,
      contactInfo,
      isPublished,
      images: allImages,
      education: education,
    };

    const result = await prisma.psychologist.update({
      where: { id },
      data: updateData,
    });

    console.log("✅ Психолог успешно обновлен");

  } catch (err) {
    console.error("💥 Ошибка обновления психолога:", err);
    
    if (err instanceof Error) {
      console.error(`💥 Сообщение ошибки: ${err.message}`);
      console.error(`💥 Stack trace: ${err.stack}`);
    }
    
    if (isDbSyncError(err)) {
      redirect("/managers/psychologists?error=db_sync"); // Менеджерский путь
    }
    
    throw err;
  }

  revalidatePath("/managers/psychologists"); // Менеджерский путь
  revalidatePath("/psy-list");
  revalidatePath(`/psy-list/${formData.get("slug")}`);
  redirect("/managers/psychologists"); // Менеджерский путь
}

/** Удалить психолога (для менеджеров) */
export async function deletePsychologist(id: string, _formData?: FormData) {
  if (!prisma) redirect("/managers/psychologists?error=db_unavailable"); // Менеджерский путь
  try {
    // Получаем данные психолога, чтобы узнать его изображения
    const psychologist = await prisma.psychologist.findUnique({ where: { id } });
    if (!psychologist) {
      redirect("/managers/psychologists?error=not_found");
    }
    // Удаляем психолога из базы
    await prisma.psychologist.delete({ where: { id } });
    // Удаляем изображения из папки uploads
    if (psychologist.images && Array.isArray(psychologist.images)) {
      for (const imgPath of psychologist.images) {
        // Удаляем только локальные файлы (начинаются с /uploads/)
        if (typeof imgPath === 'string' && imgPath.startsWith('/uploads/')) {
          const absPath = path.join(process.cwd(), 'public', imgPath.replace(/^\/uploads\//, 'uploads/'));
          try {
            if (fs.existsSync(absPath)) {
              fs.unlinkSync(absPath);
            }
          } catch (e) {
            console.error('Ошибка удаления файла:', absPath, e);
          }
        }
      }
    }
  } catch (err: unknown) {
    if (isDbSyncError(err)) redirect("/managers/psychologists?error=db_sync"); // Менеджерский путь
    redirect("/managers/psychologists?error=delete_failed"); // Менеджерский путь
  }
  revalidatePath("/managers/psychologists"); // Менеджерский путь
  revalidatePath("/psy-list");
  redirect("/managers/psychologists"); // Менеджерский путь
}

/** Остальные функции (можно оставить те же) */
export async function getFilteredPsychologists(filters: {
  priceMin?: string;
  priceMax?: string;
  city?: string;
  gender?: string;
  paradigms?: string[];
  levels?: string[];
  ageMin?: string;
  ageMax?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  cursor?: string;
  limit?: number;
  isPublished?: boolean;
}) {
  if (!prisma) return { items: [], nextCursor: null };

  const {
    priceMin,
    priceMax,
    city,
    gender,
    paradigms = [],
    levels = [],
    ageMin,
    ageMax,
    sortBy = "createdAt",
    sortOrder = "desc",
    cursor,
    limit = 20,
    isPublished = true,
  } = filters;

  try {
    const where: any = {
      isPublished: isPublished ? true : undefined,
    };

    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = parseInt(priceMin, 10);
      if (priceMax) where.price.lte = parseInt(priceMax, 10);
    }

    if (city) {
      where.city = {
        contains: city,
        mode: "insensitive" as const,
      };
    }

    if (gender) {
      where.gender = gender;
    }

    if (paradigms.length > 0) {
      where.mainParadigm = {
        hasSome: paradigms,
      };
    }

    if (levels.length > 0) {
      where.certificationLevel = {
        in: levels.map((l) => parseInt(l, 10)),
      };
    }

    if (ageMin || ageMax) {
      where.birthDate = {};
      if (ageMin) {
        const minBirthYear = CURRENT_YEAR - parseInt(ageMin, 10);
        where.birthDate.lte = new Date(`${minBirthYear}-12-31`);
      }
      if (ageMax) {
        const maxBirthYear = CURRENT_YEAR - parseInt(ageMax, 10);
        where.birthDate.gte = new Date(`${maxBirthYear}-01-01`);
      }
    }

    let orderBy: any = {};
    if (sortBy === "age") {
      orderBy = { birthDate: sortOrder === "asc" ? "desc" : "asc" };
    } else if (sortBy === "price" || sortBy === "certificationLevel") {
      orderBy = { [sortBy]: sortOrder };
    } else {
      orderBy = { createdAt: "desc" };
    }

    const cursorCondition = cursor ? { id: cursor } : undefined;

    const items = await prisma.psychologist.findMany({
      where,
      orderBy,
      cursor: cursorCondition,
      skip: cursor ? 1 : 0,
      take: limit + 1,
      select: {
        id: true,
        slug: true,
        fullName: true,
        gender: true,
        birthDate: true,
        city: true,
        price: true,
        shortBio: true,
        images: true,
        mainParadigm: true,
        certificationLevel: true,
        workFormat: true,
      },
    });

    const hasNextPage = items.length > limit;
    const actualItems = hasNextPage ? items.slice(0, -1) : items;
    const nextCursor = hasNextPage ? items[items.length - 2]?.id : null;

    const itemsWithAge = actualItems.map((item) => {
      const age = item.birthDate 
        ? CURRENT_YEAR - item.birthDate.getFullYear()
        : null;
      
      return {
        ...item,
        age,
      };
    });

    return {
      items: itemsWithAge,
      nextCursor,
      totalCount: await prisma.psychologist.count({ where }),
    };
  } catch (err) {
    if (isDbSyncError(err)) return { items: [], nextCursor: null, totalCount: 0 };
    throw err;
  }
}