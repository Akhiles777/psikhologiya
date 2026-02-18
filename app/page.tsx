import { HeroBlock } from "@/components/home/HeroBlock";
import { TrustBlock } from "@/components/home/TrustBlock";
import { ValuesBlock } from "@/components/home/ValuesBlock";
import { HowBlock } from "@/components/home/HowBlock";
import { CatalogBlock } from "@/components/home/CatalogBlock";
import { ForPsychologistsBlock } from "@/components/home/ForPsychologistsBlock";
import { LibraryBlock } from "@/components/home/LibraryBlock";
import { CtaBlock } from "@/components/home/CtaBlock";
import { buildMetadata } from "@/lib/seo";
import { PageContent } from "@/components/PageContent";
import { getPublishedVisualContent } from "@/lib/visual-pages";

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

  const visualContent = await getPublishedVisualContent("home");
  if (visualContent && !isVisualSource) {
    return <PageContent title="Главная страница" template="empty" content={visualContent} />;
  }

  return (
    <>
      <HeroBlock />
      <TrustBlock />
      <ValuesBlock />
      <HowBlock />
      <CatalogBlock />
      <ForPsychologistsBlock />
      <LibraryBlock />
      <CtaBlock />
    </>
  );
}
