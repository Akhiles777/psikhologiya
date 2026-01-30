"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Button } from "@/components/ui";
import { buildCatalogUrl, searchParamsToObject } from "@/lib/url";
import { PARADIGM_OPTIONS } from "@/lib/paradigm-options";

type CatalogFiltersFormProps = {
  initialSearchParams: Record<string, string | string[] | undefined>;
};

export function CatalogFiltersForm({
  initialSearchParams,
}: CatalogFiltersFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const get = useCallback(
    (key: string): string => {
      const v = searchParams?.get(key) ?? initialSearchParams[key];
      if (Array.isArray(v)) return v[0] ?? "";
      return (v as string) ?? "";
    },
    [searchParams, initialSearchParams]
  );

  const getArray = useCallback(
    (key: string): string[] => {
      const fromUrl = searchParams?.getAll(key);
      if (fromUrl?.length) return fromUrl;
      const v = initialSearchParams[key];
      if (Array.isArray(v)) return v;
      if (typeof v === "string" && v) return [v];
      return [];
    },
    [searchParams, initialSearchParams]
  );

  const apply = useCallback(
    (updates: Record<string, string | string[]>) => {
      const current = searchParams ? searchParamsToObject(searchParams) : {};
      const url = buildCatalogUrl(current, updates);
      startTransition(() => router.push(url));
    },
    [router, searchParams]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const priceMin = formData.get("priceMin") as string;
      const priceMax = formData.get("priceMax") as string;
      const ageMin = formData.get("ageMin") as string;
      const ageMax = formData.get("ageMax") as string;
      const city = formData.get("city") as string;
      const paradigms = formData.getAll("paradigms") as string[];
      const levels = formData.getAll("levels") as string[];
      const gender = formData.get("gender") as string;
      const sortBy = formData.get("sortBy") as string;
      const sortOrder = formData.get("sortOrder") as string;
      apply({
        priceMin: priceMin?.trim() || "",
        priceMax: priceMax?.trim() || "",
        ageMin: ageMin?.trim() || "",
        ageMax: ageMax?.trim() || "",
        city: city?.trim() || "",
        gender: gender?.trim() || "",
        paradigms: paradigms.filter(Boolean),
        levels: levels.filter(Boolean),
        sortBy: sortBy?.trim() || "",
        sortOrder: sortOrder?.trim() || "",
        cursor: "",
      });
    },
    [apply]
  );

  const selectedParadigms = getArray("paradigms");
  const selectedLevels = getArray("levels");
  const certificationLevels: (1 | 2 | 3)[] = [1, 2, 3];

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-card border border-neutral-light/80 bg-white/70 p-4 shadow-glass backdrop-blur-[12px] sm:p-6"
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Цена от (₽)
          </label>
          <input
            type="number"
            name="priceMin"
            min={0}
            defaultValue={get("priceMin")}
            className="w-full rounded-button border border-neutral-light bg-white px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Цена до (₽)
          </label>
          <input
            type="number"
            name="priceMax"
            min={0}
            defaultValue={get("priceMax")}
            className="w-full rounded-button border border-neutral-light bg-white px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Возраст от
          </label>
          <input
            type="number"
            name="ageMin"
            min={18}
            max={100}
            defaultValue={get("ageMin")}
            className="w-full rounded-button border border-neutral-light bg-white px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Возраст до
          </label>
          <input
            type="number"
            name="ageMax"
            min={18}
            max={100}
            defaultValue={get("ageMax")}
            className="w-full rounded-button border border-neutral-light bg-white px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Город
          </label>
          <input
            type="text"
            name="city"
            defaultValue={get("city")}
            placeholder="Москва"
            className="w-full max-w-xs rounded-button border border-neutral-light bg-white px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Пол
          </label>
          <select
            name="gender"
            defaultValue={get("gender")}
            className="rounded-button border border-neutral-light bg-white px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Не важно</option>
            <option value="М">М</option>
            <option value="Ж">Ж</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Сортировка
          </label>
          <div className="flex gap-2">
            <select
              name="sortBy"
              defaultValue={get("sortBy") || "createdAt"}
              className="rounded-button border border-neutral-light bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Дата</option>
              <option value="price">Цена</option>
              <option value="certificationLevel">Уровень</option>
            </select>
            <select
              name="sortOrder"
              defaultValue={get("sortOrder") || "desc"}
              className="rounded-button border border-neutral-light bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="asc">По возрастанию</option>
              <option value="desc">По убыванию</option>
            </select>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <span className="mb-2 block text-sm font-medium text-foreground">
          Парадигмы
        </span>
        <div className="flex flex-wrap gap-2">
          {PARADIGM_OPTIONS.map((opt) => {
            const checked = selectedParadigms.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-button border border-neutral-light bg-white px-3 py-1.5 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10"
              >
                <input
                  type="checkbox"
                  name="paradigms"
                  value={opt.value}
                  defaultChecked={checked}
                  className="rounded border-neutral focus:ring-primary"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      </div>
      <div className="mt-4">
        <span className="mb-2 block text-sm font-medium text-foreground">
          Уровень сертификации
        </span>
        <div className="flex flex-wrap gap-2">
          {certificationLevels.map((l) => {
            const checked = selectedLevels.includes(String(l));
            return (
              <label
                key={l}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-button border border-neutral-light bg-white px-3 py-1.5 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10"
              >
                <input
                  type="checkbox"
                  name="levels"
                  value={l}
                  defaultChecked={checked}
                  className="rounded border-neutral focus:ring-primary"
                />
                Level {l}
              </label>
            );
          })}
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <Button type="submit" variant="primary" isLoading={isPending}>
          Применить фильтры
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => startTransition(() => router.push("/psy-list"))}
          disabled={isPending}
        >
          Сбросить
        </Button>
      </div>
    </form>
  );
}
