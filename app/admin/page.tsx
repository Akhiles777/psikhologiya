import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Админ-панель — Давай вместе",
  path: "/admin",
  noIndex: true,
});

export default function AdminPage() {
  return (
    <div className="rounded-2xl border border-neutral-light/80 bg-white p-8 shadow-sm">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Админ-панель
      </h1>
      <p className="mt-4 leading-relaxed text-neutral-dark">
        Раздел в разработке. Здесь будет управление списками данных, парадигмами и контентом.
      </p>
    </div>
  );
}
