import { HeroBlock } from "@/components/home/HeroBlock";
import { TrustBlock } from "@/components/home/TrustBlock";
import { ValuesBlock } from "@/components/home/ValuesBlock";
import { HowBlock } from "@/components/home/HowBlock";
import { CatalogBlock } from "@/components/home/CatalogBlock";
import { ForPsychologistsBlock } from "@/components/home/ForPsychologistsBlock";
import { LibraryBlock } from "@/components/home/LibraryBlock";
import { CtaBlock } from "@/components/home/CtaBlock";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Давай вместе — Находим своего психолога вместе",
  description: "Реестр психологов с прозрачной сертификацией. Подбор по подходу, цене, городу. Каталог, фильтры, уровни 1–3.",
  path: "/",
});

export default function HomePage() {
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