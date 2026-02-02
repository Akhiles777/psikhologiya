"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isDbSyncError } from "@/lib/db-error";

const CURRENT_YEAR = 2026;



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

/** Получить психологов с фильтрами для каталога */
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
    // Базовые условия where
    const where: any = {
      isPublished: isPublished ? true : undefined,
    };

    // Фильтр по цене
    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = parseInt(priceMin, 10);
      if (priceMax) where.price.lte = parseInt(priceMax, 10);
    }

    // Фильтр по городу
    if (city) {
      where.city = {
        contains: city,
        mode: "insensitive" as const,
      };
    }

    // Фильтр по полу
    if (gender) {
      where.gender = gender;
    }

    // Фильтр по парадигмам
    if (paradigms.length > 0) {
      where.mainParadigm = {
        hasSome: paradigms,
      };
    }

    // Фильтр по уровням сертификации
    if (levels.length > 0) {
      where.certificationLevel = {
        in: levels.map((l) => parseInt(l, 10)),
      };
    }

    // Фильтр по возрасту (рассчитывается на основе даты рождения)
    if (ageMin || ageMax) {
      where.birthDate = {};
      
      // Возраст от X лет: birthDate <= (CURRENT_YEAR - X)
      if (ageMin) {
        const minBirthYear = CURRENT_YEAR - parseInt(ageMin, 10);
        where.birthDate.lte = new Date(`${minBirthYear}-12-31`);
      }
      
      // Возраст до X лет: birthDate >= (CURRENT_YEAR - X)
      if (ageMax) {
        const maxBirthYear = CURRENT_YEAR - parseInt(ageMax, 10);
        where.birthDate.gte = new Date(`${maxBirthYear}-01-01`);
      }
    }

    // Подготовка orderBy
    let orderBy: any = {};
    
    // Специальная сортировка по возрасту
    if (sortBy === "age") {
      // Для сортировки по возрасту используем дату рождения
      // asc = моложе (позднее рождение) → desc = старше (раннее рождение)
      orderBy = { birthDate: sortOrder === "asc" ? "desc" : "asc" };
    } else if (sortBy === "price" || sortBy === "certificationLevel") {
      orderBy = { [sortBy]: sortOrder };
    } else {
      // По умолчанию сортировка по дате создания
      orderBy = { createdAt: "desc" };
    }

    // Подготовка курсора для пагинации
    const cursorCondition = cursor ? { id: cursor } : undefined;

    // Запрос к БД
    const items = await prisma.psychologist.findMany({
      where,
      orderBy,
      cursor: cursorCondition,
      skip: cursor ? 1 : 0,
      take: limit + 1, // Берем на один больше для проверки следующей страницы
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
        // Вычисляем возраст для отображения
      },
    });

    // Проверяем есть ли следующая страница
    const hasNextPage = items.length > limit;
    const actualItems = hasNextPage ? items.slice(0, -1) : items;
    const nextCursor = hasNextPage ? items[items.length - 2]?.id : null;

    // Добавляем вычисленный возраст к каждому психологу
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

/** Получить уникальные города для автозаполнения */
export async function getUniqueCities() {
  if (!prisma) return [];
  try {
    const psychologists = await prisma.psychologist.findMany({
      where: { isPublished: true },
      select: { city: true },
      distinct: ["city"],
    });
    
    return psychologists
      .map(p => p.city)
      .filter((city): city is string => !!city && city.trim() !== "")
      .sort();
  } catch (err) {
    if (isDbSyncError(err)) return [];
    return [];
  }
}

/** Получить статистику по фильтрам */
export async function getFilterStats(filters: {
  priceMin?: string;
  priceMax?: string;
  city?: string;
  gender?: string;
  paradigms?: string[];
  levels?: string[];
  ageMin?: string;
  ageMax?: string;
}) {
  if (!prisma) return null;

  const {
    priceMin,
    priceMax,
    city,
    gender,
    paradigms = [],
    levels = [],
    ageMin,
    ageMax,
  } = filters;

  try {
    const where: any = {
      isPublished: true,
    };

    // Фильтр по цене
    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = parseInt(priceMin, 10);
      if (priceMax) where.price.lte = parseInt(priceMax, 10);
    }

    // Фильтр по городу
    if (city) {
      where.city = {
        contains: city,
        mode: "insensitive",
      };
    }

    // Фильтр по полу
    if (gender) {
      where.gender = gender;
    }

    // Фильтр по парадигмам
    if (paradigms.length > 0) {
      where.mainParadigm = {
        hasSome: paradigms,
      };
    }

    // Фильтр по уровням сертификации
    if (levels.length > 0) {
      where.certificationLevel = {
        in: levels.map((l) => parseInt(l, 10)),
      };
    }

    // Фильтр по возрасту
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

    // Получаем статистику
    const [minPrice, maxPrice, minAge, maxAge, totalCount] = await Promise.all([
      // Минимальная цена
      prisma.psychologist.aggregate({
        where,
        _min: { price: true },
      }),
      // Максимальная цена
      prisma.psychologist.aggregate({
        where,
        _max: { price: true },
      }),
      // Минимальный возраст
      prisma.psychologist.aggregate({
        where,
        _max: { birthDate: true }, // Максимальная дата рождения = минимальный возраст
      }),
      // Максимальный возраст
      prisma.psychologist.aggregate({
        where,
        _min: { birthDate: true }, // Минимальная дата рождения = максимальный возраст
      }),
      // Общее количество
      prisma.psychologist.count({ where }),
    ]);

    // Вычисляем возраст из даты рождения
    const calculatedMinAge = minAge._max.birthDate 
      ? CURRENT_YEAR - minAge._max.birthDate.getFullYear()
      : null;
    const calculatedMaxAge = maxAge._min.birthDate 
      ? CURRENT_YEAR - maxAge._min.birthDate.getFullYear()
      : null;

    return {
      priceRange: {
        min: minPrice._min.price || 0,
        max: maxPrice._max.price || 0,
      },
      ageRange: {
        min: calculatedMinAge,
        max: calculatedMaxAge,
      },
      total: totalCount,
    };
  } catch (err) {
    if (isDbSyncError(err)) return null;
    console.error("Filter stats error:", err);
    return null;
  }
}

type EducationItem = {
  year?: string | number;
  type?: string;
  organization?: string;
  title?: string;
  isDiploma?: boolean;
};

/** Генерирует slug из ФИО: латиница, цифры, дефис. */
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

/** Создать психолога. Slug генерируется из ФИО, если не указан. */
export async function createPsychologist(formData: FormData) {
  if (!prisma) throw new Error("База данных недоступна");

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
  } catch (err: unknown) {
    if (isDbSyncError(err)) redirect("/admin/psychologists?error=db_sync");
    const code = err && typeof (err as { code?: string }).code === "string" ? (err as { code: string }).code : "";
    if (code === "P2002") redirect("/admin/psychologists/new?error=duplicate_slug");
    throw err;
  }

  revalidatePath("/admin/psychologists");
  revalidatePath("/psy-list");
  redirect("/admin/psychologists");
}

/** Обновить психолога */
/** Обновить психолога */
export async function updatePsychologist(id: string, formData: FormData) {
  if (!prisma) throw new Error("База данных недоступна");

  // Получаем и валидируем обязательные поля
  const fullName = (formData.get("fullName") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim().toLowerCase().replace(/\s+/g, "-");
  if (!fullName || !slug) throw new Error("Укажите ФИО и slug");

  // Получаем базовые данные
  const gender = (formData.get("gender") as string)?.trim() || "Не указан";
  const birthDateStr = (formData.get("birthDate") as string)?.trim();
  const birthDate = birthDateStr ? new Date(birthDateStr) : new Date("1990-01-01");
  const city = (formData.get("city") as string)?.trim() || "";
  const workFormat = (formData.get("workFormat") as string)?.trim() || "Онлайн и оффлайн";
  
  // Даты
  const firstDiplomaStr = (formData.get("firstDiplomaDate") as string)?.trim();
  const lastCertStr = (formData.get("lastCertificationDate") as string)?.trim();
  const firstDiplomaDate = firstDiplomaStr ? new Date(firstDiplomaStr) : null;
  const lastCertificationDate = lastCertStr ? new Date(lastCertStr) : null;
  
  // Парадигмы
  const paradigmStr = (formData.get("mainParadigm") as string)?.trim();
  const mainParadigm = paradigmStr 
    ? paradigmStr.split("\n").map((s) => s.trim()).filter(Boolean) 
    : [];
  
  // Уровень сертификации
  const certificationLevelRaw = (formData.get("certificationLevel") as string) || "1";
  const certificationLevel = Math.min(3, Math.max(1, parseInt(certificationLevelRaw, 10)));
  
  // Биография и контакты
  const shortBio = (formData.get("shortBio") as string)?.trim().slice(0, 400) || "";
  const longBio = (formData.get("longBio") as string)?.trim() || "";
  const price = Math.max(0, parseInt((formData.get("price") as string) || "0", 10));
  const contactInfo = (formData.get("contactInfo") as string)?.trim() || "";
  
  // Статус публикации
  const publishedVal = formData.getAll("isPublished");
  const isPublished = publishedVal[publishedVal.length - 1] === "on";
  
  // Изображения
  const imagesStr = (formData.get("images") as string)?.trim();
  const images = imagesStr 
    ? imagesStr.split("\n").map((s) => s.trim()).filter(Boolean) 
    : [];
  
  // ОБРАБОТКА ОБРАЗОВАНИЯ
  const educationCount = parseInt((formData.get("education_count") as string) || "0", 10);
  let education: EducationItem[] = [];
  
  // Новый формат - поля формы
  for (let i = 0; i < educationCount; i++) {
    const year = (formData.get(`education[${i}][year]`) as string)?.trim();
    const type = (formData.get(`education[${i}][type]`) as string)?.trim();
    const organization = (formData.get(`education[${i}][organization]`) as string)?.trim();
    const title = (formData.get(`education[${i}][title]`) as string)?.trim();
    const isDiploma = formData.get(`education[${i}][isDiploma]`) === "on";

    // Проверяем обязательные поля
    if (year && type && organization && title) {
      education.push({
        year,
        type,
        organization,
        title,
        isDiploma
      });
    }
  }
  
  // Старый формат - JSON поле (используем только если новый формат не дал результатов)
  if (education.length === 0) {
    const educationStr = (formData.get("education") as string)?.trim();
    if (educationStr) {
      try {
        const parsedEducation = JSON.parse(educationStr);
        education = Array.isArray(parsedEducation) ? parsedEducation : [];
      } catch {
        education = [];
      }
    }
  }

  try {
    // Обновляем данные в базе
    await prisma.psychologist.update({
      where: { id },
      data: {
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
        images,
        education,
      },
    });
  } catch (err) {
    if (isDbSyncError(err)) redirect("/admin/psychologists?error=db_sync");
    throw err;
  }

  // Ревалидация кеша
  revalidatePath("/admin/psychologists");
  revalidatePath("/psy-list");
  revalidatePath(`/psy-list/${slug}`);
  
  // Перенаправление после успешного обновления
  redirect("/admin/psychologists");
}

/** Удалить психолога. Вызывается из формы: deletePsychologist(id) или deletePsychologist(id, formData). */
export async function deletePsychologist(id: string, _formData?: FormData) {
  if (!prisma) redirect("/admin/psychologists?error=db_unavailable");
  try {
    await prisma.psychologist.delete({ where: { id } });
  } catch (err: unknown) {
    if (isDbSyncError(err)) redirect("/admin/psychologists?error=db_sync");
    redirect("/admin/psychologists?error=delete_failed");
  }
  revalidatePath("/admin/psychologists");
  revalidatePath("/psy-list");
  redirect("/admin/psychologists");
}