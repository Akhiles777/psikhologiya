import Link from "next/link";
import { notFound } from "next/navigation";
import { ProfileGallery } from "@/components/catalog/ProfileGallery";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { prisma } from "@/lib/db";
import { buildMetadata, canonicalUrl, personJsonLd } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

function isDbError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("DATABASE_URL") ||
    msg.includes("PrismaClientInitializationError") ||
    msg.includes("does not exist") ||
    msg.includes("Unknown column")
  );
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
  if (!prisma) return buildMetadata({ title: "Психолог", path: `/psy-list/${slug}` });
  try {
    const p = await prisma.psychologist.findUnique({
      where: { slug, isPublished: true },
      select: { fullName: true, shortBio: true },
    });
    if (!p) return buildMetadata({ title: "Психолог", path: `/psy-list/${slug}` });
    return buildMetadata({
      title: p.fullName,
      description: p.shortBio.slice(0, 160),
      path: `/psy-list/${slug}`,
    });
  } catch (err) {
    if (isDbError(err)) return buildMetadata({ title: "Психолог", path: `/psy-list/${slug}` });
    throw err;
  }
}

export default async function PsychologistProfilePage({ params }: PageProps) {
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

  const pageUrl = canonicalUrl(`/psy-list/${slug}`);
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
  const mainParadigm = (psychologist.mainParadigm ?? []) as string[];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: personSchema }}
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/psy-list"
          className="mb-6 inline-block text-sm text-neutral-dark hover:text-[#5858E2]"
        >
          ← Назад в каталог
        </Link>

        <article className="rounded-2xl border border-neutral-light/80 bg-white/70 shadow-[var(--shadow-glass)] overflow-hidden backdrop-blur-sm">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
              <ProfileGallery
                images={psychologist.images ?? []}
                fullName={psychologist.fullName}
              />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-2xl font-bold tracking-tighter text-foreground sm:text-3xl">
                  {psychologist.fullName}
                </h1>
                <p className="mt-2 text-neutral-dark">{psychologist.city}</p>
                {psychologist.workFormat && (
                  <p className="mt-1 text-sm text-neutral-dark">{psychologist.workFormat}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="level" level={psychologist.certificationLevel as 1 | 2 | 3} />
                  {mainParadigm.map((p) => (
                    <Badge key={p} variant="primary">
                      {p}
                    </Badge>
                  ))}
                </div>
                <p className="mt-4 text-xl font-semibold text-[#5858E2]">
                  {psychologist.price} ₽ <span className="text-sm font-normal text-neutral">/ сессия</span>
                </p>
                <p className="mt-2 text-sm text-neutral-dark">
                  На сайте с{" "}
                  {new Date(psychologist.createdAt).toLocaleDateString("ru-RU", {
                    year: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-neutral-light/80 pt-8">
              <h2 className="font-display text-lg font-semibold text-foreground">О себе</h2>
              <p className="mt-2 leading-relaxed text-foreground">{psychologist.shortBio}</p>
              {psychologist.longBio && (
                <div
                  className="mt-4 text-foreground leading-relaxed [&_a]:text-[#5858E2] [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: psychologist.longBio }}
                />
              )}
            </div>

            {education.length > 0 && (
              <div className="mt-8 border-t border-neutral-light/80 pt-8">
                <h2 className="font-display text-lg font-semibold text-foreground">Образование</h2>
                <ul className="mt-4 space-y-3">
                  {[...education]
                    .sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0))
                    .map((item, i) => (
                      <li
                        key={i}
                        className="rounded-2xl border border-neutral-light/80 bg-[#F5F5F7]/50 p-3 text-sm"
                      >
                        {item.year != null && <span className="font-medium">{item.year}</span>}
                        {item.organization && (
                          <span className="text-foreground"> — {item.organization}</span>
                        )}
                        {item.title && (
                          <span className="text-neutral-dark">, {item.title}</span>
                        )}
                        {item.isDiploma && (
                          <span className="text-[#5858E2]"> (диплом)</span>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {psychologist.contactInfo && (
              <div className="mt-8 border-t border-neutral-light/80 pt-8">
                <h2 className="font-display text-lg font-semibold text-foreground">Контакты</h2>
                <div
                  className="mt-4 text-foreground [&_a]:text-[#5858E2] [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: psychologist.contactInfo }}
                />
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/psy-list">
                <Button variant="outline">В каталог</Button>
              </Link>
              <Link href="/certification-levels">
                <span className="text-sm text-neutral-dark hover:text-[#5858E2]">
                  Что такое уровни сертификации?
                </span>
              </Link>
              <Link href="/complaint">
                <span className="text-sm text-neutral-dark hover:text-[#5858E2]">
                  Пожаловаться
                </span>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
