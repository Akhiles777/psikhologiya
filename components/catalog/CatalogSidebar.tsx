"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { buildCatalogUrl, searchParamsToObject } from "@/lib/url";
import { PARADIGM_OPTIONS } from "@/lib/paradigm-options";

const LEVELS: (1 | 2 | 3)[] = [1, 2, 3];

type Props = {
  initialParams: Record<string, string | string[] | undefined>;
};

/** Упрощённая панель фильтров: цена, метод, уровень, сортировка. */
export function CatalogSidebar({ initialParams }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const get = useCallback(
    (key: string): string => {
      const v = searchParams?.get(key) ?? initialParams[key];
      if (Array.isArray(v)) return v[0] ?? "";
      return (v as string) ?? "";
    },
    [searchParams, initialParams]
  );

  const apply = useCallback(
    (updates: Record<string, string | string[]>) => {
      const current = searchParams ? searchParamsToObject(searchParams) : {};
      const url = buildCatalogUrl(current, updates);
      startTransition(() => router.push(url));
    },
    [router, searchParams]
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const priceMin = (formData.get("priceMin") as string)?.trim() ?? "";
    const priceMax = (formData.get("priceMax") as string)?.trim() ?? "";
    const paradigm = (formData.get("paradigm") as string)?.trim() ?? "";
    const level = (formData.get("level") as string)?.trim() ?? "";
    const sort = (formData.get("sort") as string)?.trim() ?? "createdAt-desc";
    const [sortBy, sortOrder] = sort.includes("-") ? sort.split("-") : [sort, "desc"];
    apply({
      priceMin,
      priceMax,
      paradigms: paradigm ? [paradigm] : [],
      levels: level ? [level] : [],
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "desc",
      cursor: "",
    });
  };

  const selectedParadigm = get("paradigms") || get("paradigm");
  const selectedLevel = get("levels") || get("level");
  const sortBy = get("sortBy") || "createdAt";
  const sortOrder = get("sortOrder") || "desc";
  const sortValue = `${sortBy}-${sortOrder}`;

  return (
    <aside className="w-52 shrink-0 rounded-xl border border-neutral-200 bg-white p-4">
      <h2 className="font-display text-base font-bold text-foreground">Фильтры</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-dark">Цена (₽)</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="priceMin"
              min={0}
              defaultValue={get("priceMin")}
              placeholder="от"
              className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            />
            <input
              type="number"
              name="priceMax"
              min={0}
              defaultValue={get("priceMax")}
              placeholder="до"
              className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-dark">Метод</label>
          <select
            name="paradigm"
            defaultValue={selectedParadigm || ""}
            className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
          >
            <option value="">Не важно</option>
            {PARADIGM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-dark">Уровень</label>
          <select
            name="level"
            defaultValue={selectedLevel || ""}
            className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
          >
            <option value="">Любой</option>
            {LEVELS.map((l) => (
              <option key={l} value={String(l)}>{l} уровень</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-dark">Сортировка</label>
          <select
            name="sort"
            defaultValue={sortValue}
            className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
          >
            <option value="createdAt-desc">Сначала новые</option>
            <option value="price-asc">Дешевле</option>
            <option value="price-desc">Дороже</option>
            <option value="certificationLevel-desc">По уровню</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-[#5858E2] py-2.5 text-sm font-semibold text-white hover:bg-[#4848d0] disabled:opacity-60"
        >
          {isPending ? "Загрузка…" : "Найти"}
        </button>
      </form>
    </aside>
  );
}
