/**
 * Типы блоков для StaticPage.blocks (JSON).
 * Block Renderer рендерит секции по type.
 */

export type BlockHero = {
  type: "Hero";
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
};

export type BlockFeature = {
  type: "Feature";
  title: string;
  text: string;
  icon?: string;
};

export type BlockFeatures = {
  type: "Features";
  heading?: string;
  items: BlockFeature[];
};

export type BlockCatalogPreview = {
  type: "CatalogPreview";
  heading?: string;
  limit?: number;
};

export type PageBlock = BlockHero | BlockFeatures | BlockCatalogPreview;
