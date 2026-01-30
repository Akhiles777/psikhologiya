/** Фильтры каталога психологов */
export interface CatalogFilters {
  priceMin?: number;
  priceMax?: number;
  ageMin?: number;
  ageMax?: number;
  paradigms?: string[];
  certificationLevels?: (1 | 2 | 3)[];
  city?: string;
  gender?: string;
  sortBy?: "price" | "certificationLevel";
  sortOrder?: "asc" | "desc";
}

/** Пагинация: курсор + лимит */
export interface CatalogPagination {
  limit: number;
  cursor?: string;
}

/** Результат запроса каталога */
export interface CatalogResult {
  items: PsychologistCatalogItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

/** Карточка психолога в каталоге */
export interface PsychologistCatalogItem {
  id: string;
  slug: string;
  fullName: string;
  gender: string;
  birthDate: Date;
  city: string;
  workFormat: string;
  mainParadigm: string[];
  certificationLevel: number;
  shortBio: string;
  price: number;
  images: string[];
  educationCount: number;
  coursesCount: number;
}
