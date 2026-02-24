import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { getPageBySlug } from "@/lib/page-content";
import { PageContent } from "@/components/PageContent";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  if (!prisma) return buildMetadata({ title: slug, path: `/s/${slug}` });
  try {
    const page = await prisma.page.findUnique({
      where: { slug },
      select: { title: true },
    });
    if (!page) return buildMetadata({ title: slug, path: `/s/${slug}` });
    return buildMetadata({
      title: page.title,
      path: `/s/${slug}`,
    });
  } catch {
    return buildMetadata({ title: slug, path: `/s/${slug}` });
  }
}

export default async function PageBySlugRoute({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  const cssRules: string[] = [];
  if (!page.showHeader) cssRules.push("#site-header { display: none !important; }");
  if (!page.showFooter) cssRules.push("#site-footer { display: none !important; }");

  return (
    <>
      {cssRules.length > 0 && <style>{cssRules.join("\n")}</style>}
      <PageContent title={page.title} template={page.template} content={page.content} />
    </>
  );
}
