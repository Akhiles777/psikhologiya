/** Значения парадигм (совпадают с enum Paradigm в Prisma). */
export type Paradigm =
  | "CBT"
  | "GESTALT"
  | "PSYCHODYNAMIC"
  | "HUMANISTIC"
  | "SYSTEMIC"
  | "SOLUTION_FOCUSED"
  | "EXISTENTIAL"
  | "INTEGRATIVE"
  | "TRANSACTIONAL_ANALYSIS"
  | "COGNITIVE_BEHAVIORAL"
  | "OTHER";

/** Server-side filter for psychologist catalog */
export interface CatalogFilters {
  /** Price range: min (inclusive) */
  priceMin?: number;
  /** Price range: max (inclusive) */
  priceMax?: number;
  /** Age at least (computed from birthDate) */
  ageMin?: number;
  /** Age at most */
  ageMax?: number;
  /** Main paradigms: match any */
  paradigms?: Paradigm[];
  /** Certification levels: 1, 2, or 3 */
  certificationLevels?: (1 | 2 | 3)[];
  /** City (exact or normalized) */
  city?: string;
}

/** Pagination: cursor-based for "Show more" */
export interface CatalogPagination {
  /** Page size */
  limit: number;
  /** Cursor: psychologist id for next page */
  cursor?: string;
}

/** Result of catalog query with next cursor */
export interface CatalogResult {
  items: PsychologistCatalogItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

/** Public fields for a psychologist card in catalog */
export interface PsychologistCatalogItem {
  id: string;
  slug: string;
  fullName: string;
  gender: string;
  birthDate: Date;
  city: string;
  mainParadigm: Paradigm[];
  certificationLevel: number;
  shortBio: string;
  price: number;
  images: string[];
}
