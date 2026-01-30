"use server";

import { prisma } from "@/lib/db";
import { CATALOG_PAGE_SIZE, CATALOG_PAGE_SIZE_MAX } from "@/constants/catalog";
import type {
  CatalogFilters,
  CatalogPagination,
  CatalogResult,
  Paradigm,
  PsychologistCatalogItem,
} from "@/types/catalog";

function computeAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Server action: fetch psychologists with filters and cursor-based pagination.
 * Only returns published psychologists.
 */
export async function getPsychologists(
  filters: CatalogFilters = {},
  pagination: CatalogPagination = { limit: CATALOG_PAGE_SIZE }
): Promise<CatalogResult> {
  if (!prisma) {
    return { items: [], nextCursor: null, hasMore: false };
  }

  const { priceMin, priceMax, ageMin, ageMax, paradigms, certificationLevels, city } = filters;
  const { limit, cursor } = pagination;

  const take = Math.min(Math.max(limit, 1), CATALOG_PAGE_SIZE_MAX);

  type WhereClause = {
    isPublished: boolean;
    price?: { gte?: number; lte?: number };
    certificationLevel?: { in: (1 | 2 | 3)[] };
    city?: { equals: string; mode: "insensitive" };
    mainParadigm?: { hasSome: Paradigm[] };
  };
  const where: WhereClause = {
    isPublished: true,
  };

  if (priceMin != null || priceMax != null) {
    where.price = {};
    if (priceMin != null) where.price.gte = priceMin;
    if (priceMax != null) where.price.lte = priceMax;
  }

  if (certificationLevels != null && certificationLevels.length > 0) {
    where.certificationLevel = { in: certificationLevels };
  }

  if (city != null && city.trim() !== "") {
    where.city = { equals: city.trim(), mode: "insensitive" };
  }

  if (paradigms != null && paradigms.length > 0) {
    where.mainParadigm = { hasSome: paradigms };
  }

  const orderBy = { createdAt: "desc" as const };
  const select = {
    id: true,
    slug: true,
    fullName: true,
    gender: true,
    birthDate: true,
    city: true,
    mainParadigm: true,
    certificationLevel: true,
    shortBio: true,
    price: true,
    images: true,
  };

  let rawItems: PsychologistCatalogItem[];
  try {
    const rows = await prisma.psychologist.findMany({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma where type from our WhereClause
      where: where as any,
      select,
      orderBy,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
    rawItems = rows as PsychologistCatalogItem[];
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("DATABASE_URL") || message.includes("PrismaClientInitializationError")) {
      return { items: [], nextCursor: null, hasMore: false };
    }
    throw err;
  }

  let items: PsychologistCatalogItem[] = rawItems;

  let nextCursor: string | null = null;
  if (items.length > take) {
    const next = items.pop();
    if (next) nextCursor = next.id;
  }

  if (ageMin != null || ageMax != null) {
    items = items.filter((p: PsychologistCatalogItem) => {
      const age = computeAge(p.birthDate);
      if (ageMin != null && age < ageMin) return false;
      if (ageMax != null && age > ageMax) return false;
      return true;
    });
    if (nextCursor != null && items.length < take) {
      nextCursor = null;
    }
  }

  const result: CatalogResult = {
    items: items.map((p: PsychologistCatalogItem) => ({
      id: p.id,
      slug: p.slug,
      fullName: p.fullName,
      gender: p.gender,
      birthDate: p.birthDate,
      city: p.city,
      mainParadigm: p.mainParadigm,
      certificationLevel: p.certificationLevel,
      shortBio: p.shortBio,
      price: p.price,
      images: p.images,
    })),
    nextCursor,
    hasMore: nextCursor != null,
  };

  return result;
}
