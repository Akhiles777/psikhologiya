import { HeroBlock } from "@/components/home/HeroBlock";
import { TrustBlock } from "@/components/home/TrustBlock";
import { ValuesBlock } from "@/components/home/ValuesBlock";
import { HowBlock } from "@/components/home/HowBlock";
import { CatalogBlock } from "@/components/home/CatalogBlock";
import { ForPsychologistsBlock } from "@/components/home/ForPsychologistsBlock";
import { LibraryBlock } from "@/components/home/LibraryBlock";
import { CtaBlock } from "@/components/home/CtaBlock";
import { buildMetadata } from "@/lib/seo";
import { getPublishedVisualPage } from "@/lib/visual-pages";
import VisualPageRuntime from "@/components/pages/VisualPageRuntime";

export const metadata = buildMetadata({
  title: "Давай вместе — Находим своего психолога вместе",
  description: "Реестр психологов с прозрачной сертификацией. Подбор по подходу, цене, городу. Каталог, фильтры, уровни 1–3.",
  path: "/",
});

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const isVisualSource = (typeof params.visual_source === "string" ? params.visual_source : "") === "1";

  const visualPage = await getPublishedVisualPage("home");
  if (visualPage && !isVisualSource) {
    return (
      <VisualPageRuntime
        html={visualPage.html}
        css={visualPage.css}
        styleHrefs={visualPage.styleHrefs}
        pageKey="home"
      />
    );
  }

  return (
    <div data-vp-import-root>
      <HeroBlock />
      <TrustBlock />
      <ValuesBlock />
      <HowBlock />
      <CatalogBlock />
      <ForPsychologistsBlock />
      <LibraryBlock />
      <CtaBlock />
    </div>
  );
}
