import { FOOTER_PAGE_SLUG, FOOTER_PAGE_TITLE } from "@/lib/footer-config";

export const HOME_PAGE_SLUG = "home";
export const HOME_PAGE_TITLE = "Главная страница";

export const CONNECT_PAGE_SLUG = "connect";
export const CONNECT_PAGE_TITLE = "Страница Connect";

export type SystemPageKey = "footer" | "home" | "connect";

export const SYSTEM_PAGE_CONFIG: Record<
  SystemPageKey,
  {
    key: SystemPageKey;
    slug: string;
    title: string;
    description: string;
    adminPath: string;
    managerPath: string;
  }
> = {
  footer: {
    key: "footer",
    slug: FOOTER_PAGE_SLUG,
    title: FOOTER_PAGE_TITLE,
    description: "Этот HTML используется как общий футер на всех публичных страницах сайта.",
    adminPath: "/admin/pages/footer",
    managerPath: "/managers/pages/footer",
  },
  home: {
    key: "home",
    slug: HOME_PAGE_SLUG,
    title: HOME_PAGE_TITLE,
    description: "Этот HTML используется как главная страница сайта (/).",
    adminPath: "/admin/pages/home",
    managerPath: "/managers/pages/home",
  },
  connect: {
    key: "connect",
    slug: CONNECT_PAGE_SLUG,
    title: CONNECT_PAGE_TITLE,
    description: "Этот HTML используется как страница /connect.",
    adminPath: "/admin/pages/connect",
    managerPath: "/managers/pages/connect",
  },
};

export const SYSTEM_PAGE_SLUGS = Object.values(SYSTEM_PAGE_CONFIG).map((page) => page.slug);

export function getSystemPageBySlug(slug?: string | null) {
  if (!slug) return null;

  for (const page of Object.values(SYSTEM_PAGE_CONFIG)) {
    if (page.slug === slug) return page;
  }

  return null;
}

export function isSystemPageSlug(slug?: string | null) {
  return getSystemPageBySlug(slug) !== null;
}
