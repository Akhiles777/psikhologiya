import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";

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
  if (!prisma) notFound();
  let page: { title: string; template: string; content: string } | null;
  try {
    page = await prisma.page.findUnique({
      where: { slug, isPublished: true },
      select: { title: true, template: true, content: true },
    });
  } catch {
    notFound();
  }
  if (!page) notFound();

  if (page.template === "empty") {
    return (
      <div
        className="min-h-screen [&_img]:max-w-full [&_a]:text-[#5858E2] [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: page.content || "" }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold tracking-tighter text-foreground">
        {page.title}
      </h1>
      <div
        className="mt-8 prose prose-neutral max-w-none text-foreground [&_a]:text-[#5858E2] [&_a]:underline [&_ul]:list-disc [&_ol]:list-decimal"
        dangerouslySetInnerHTML={{ __html: page.content || "" }}
      />
    </div>
  );
}
