import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { prisma } from "@/lib/db";
import { paradigmLabel } from "@/lib/paradigm-labels";
import type { Paradigm } from "@/types/catalog";
import { buildMetadata, canonicalUrl, personJsonLd } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

function isDbError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("DATABASE_URL") || msg.includes("PrismaClientInitializationError");
}

type EducationItem = {
  year?: string | number;
  type?: string;
  organization?: string;
  title?: string;
  isDiploma?: boolean;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  if (!prisma) return buildMetadata({ title: "Психолог", path: `/psychologist/${slug}` });
  try {
    const p = await prisma.psychologist.findUnique({
      where: { slug, isPublished: true },
      select: { fullName: true, shortBio: true },
    });
    if (!p) return buildMetadata({ title: "Психолог", path: `/psychologist/${slug}` });
    return buildMetadata({
      title: p.fullName,
      description: p.shortBio.slice(0, 160),
      path: `/psychologist/${slug}`,
    });
  } catch (err) {
    if (isDbError(err)) return buildMetadata({ title: "Психолог", path: `/psychologist/${slug}` });
    throw err;
  }
}

export default async function PsychologistPage({ params }: PageProps) {
  const { slug } = await params;
  if (!prisma) notFound();
  let psychologist: Awaited<ReturnType<typeof prisma.psychologist.findUnique>>;
  try {
    psychologist = await prisma.psychologist.findUnique({
      where: { slug, isPublished: true },
    });
  } catch (err) {
    if (isDbError(err)) notFound();
    throw err;
  }
  if (!psychologist) notFound();

  const pageUrl = canonicalUrl(`/psychologist/${slug}`);
  const firstImage = psychologist.images[0];
  const imageUrl =
    firstImage && firstImage !== ""
      ? firstImage.startsWith("http")
        ? firstImage
        : `${canonicalUrl("").replace(/\/$/, "")}${firstImage.startsWith("/") ? "" : "/"}${firstImage}`
      : undefined;
  const personSchema = personJsonLd({
    name: psychologist.fullName,
    description: psychologist.shortBio,
    url: pageUrl,
    image: imageUrl,
  });

  const education = (psychologist.education as EducationItem[] | null) ?? [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: personSchema }}
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/psy-list"
          className="mb-6 inline-block text-sm text-neutral-dark hover:text-primary"
        >
          ← Назад в каталог
        </Link>

        <article className="rounded-card border border-neutral-light/80 bg-white/70 shadow-[var(--shadow-glass)] backdrop-blur-[12px] overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
              {firstImage && firstImage !== "" ? (
                <div className="relative h-64 w-full shrink-0 sm:h-72 sm:w-56">
                  <Image
                    src={firstImage}
                    alt={psychologist.fullName}
                    fill
                    className="rounded-button object-cover"
                    sizes="(max-width: 640px) 100vw, 224px"
                    priority
                  />
                </div>
              ) : (
                <div className="flex h-64 w-full shrink-0 items-center justify-center rounded-button bg-background-subtle text-neutral sm:h-72 sm:w-56">
                  Нет фото
                </div>
              )}
              <div className="min-w-0 flex-1">
                <header>
                  <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                    {psychologist.fullName}
                  </h1>
                  <p className="mt-2 text-neutral-dark">{psychologist.city}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="level" level={psychologist.certificationLevel as 1 | 2 | 3} />
                    {psychologist.mainParadigm.map((p: Paradigm) => (
                      <Badge key={p} variant="primary">
                        {paradigmLabel(p)}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-4 text-xl font-semibold text-primary">
                    {psychologist.price} ₽ <span className="text-sm font-normal text-neutral">/ сессия</span>
                  </p>
                </header>
              </div>
            </div>

            <div className="mt-8 border-t border-neutral-light/80 pt-8">
              <h2 className="font-display text-lg font-semibold text-foreground">О себе</h2>
              <p className="mt-2 text-foreground">{psychologist.shortBio}</p>
              {psychologist.longBio && (
                <div
                  className="mt-4 text-foreground prose prose-neutral max-w-none [&_a]:text-primary [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: psychologist.longBio }}
                />
              )}
            </div>

            {education.length > 0 && (
              <div className="mt-8 border-t border-neutral-light/80 pt-8">
                <h2 className="font-display text-lg font-semibold text-foreground">Образование</h2>
                <ul className="mt-4 space-y-3">
                  {education.map((item, i) => (
                    <li key={i} className="rounded-button border border-neutral-light/80 bg-background-subtle/50 p-3 text-sm">
                      {item.year != null && <span className="font-medium">{item.year}</span>}
                      {item.organization && <span className="text-foreground"> — {item.organization}</span>}
                      {item.title && <span className="text-neutral-dark">, {item.title}</span>}
                      {item.isDiploma && <span className="text-primary"> (диплом)</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {psychologist.contactInfo && (
              <div className="mt-8 border-t border-neutral-light/80 pt-8">
                <h2 className="font-display text-lg font-semibold text-foreground">Контакты</h2>
                <div
                  className="mt-4 text-foreground [&_a]:text-primary [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: psychologist.contactInfo }}
                />
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <Link href="/psy-list">
                <Button variant="outline">В каталог</Button>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
