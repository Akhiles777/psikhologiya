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
  return <PageContent title={page.title} template={page.template} content={page.content} />;
}
