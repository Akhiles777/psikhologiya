import { Cta } from "@/components/landing/Cta";
import { FeaturedCategories } from "@/components/landing/FeaturedCategories";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Library } from "@/components/landing/Library";
import { SelectionAlgorithm } from "@/components/landing/SelectionAlgorithm";
import { TrustBar } from "@/components/landing/TrustBar";
import { Values } from "@/components/landing/Values";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Давай вместе — Находим своего психолога вместе",
  description:
    "Профессиональный реестр специалистов с прозрачной системой сертификации и честным подходом к терапии.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Values />
      <HowItWorks />
      <FeaturedCategories />
      <SelectionAlgorithm />
      <Library />
      <Cta />
    </>
  );
}
