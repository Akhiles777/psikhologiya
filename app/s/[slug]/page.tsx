import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import type { PageBlock } from "@/types/blocks";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  if (!prisma) return buildMetadata({ title: slug, path: `/s/${slug}` });
  try {
    const page = await prisma.staticPage.findUnique({
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

export default async function StaticPageRoute({ params }: PageProps) {
  const { slug } = await params;
  if (!prisma) notFound();
  let page: { title: string; blocks: unknown } | null;
  try {
    page = await prisma.staticPage.findUnique({
      where: { slug },
      select: { title: true, blocks: true },
    });
  } catch {
    notFound();
  }
  if (!page) notFound();

  const blocks = page.blocks as PageBlock[];
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-foreground">{page.title}</h1>
        <p className="mt-4 text-neutral-dark">Нет блоков для отображения.</p>
      </div>
    );
  }

  return (
    <div>
      <BlockRenderer blocks={blocks} />
    </div>
  );
}
