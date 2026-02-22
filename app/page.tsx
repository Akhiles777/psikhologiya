import { buildMetadata } from "@/lib/seo";
import { getPageBySlug } from "@/lib/page-content";
import { PageContent } from "@/components/PageContent";
import { HomeFallback } from "@/components/pages/HomeFallback";

export const metadata = buildMetadata({
  title: "Давай вместе — Находим своего психолога вместе",
  description: "Реестр психологов с прозрачной сертификацией. Подбор по подходу, цене, городу. Каталог, фильтры, уровни 1–3.",
  path: "/",
});

export default async function HomePage() {
  const page = await getPageBySlug("home");
  const hasCustomHomeContent = Boolean(page?.content?.trim());

  if (page && hasCustomHomeContent) {
    return <PageContent title={page.title} template={page.template} content={page.content} />;
  }

  return <HomeFallback />;
}
