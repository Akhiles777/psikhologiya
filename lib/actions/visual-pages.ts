"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isVisualPageKey,
  restorePreviousVisualPage,
  upsertVisualPage,
  VisualPageKey,
} from "@/lib/visual-pages";

function toIsPublished(formData: FormData): boolean {
  const values = formData.getAll("isPublished");
  return values[values.length - 1] === "on";
}

function parseKey(value: string): VisualPageKey | null {
  return isVisualPageKey(value) ? value : null;
}

function parseStyleHrefs(formData: FormData): string[] {
  const raw = (formData.get("styleHrefs") as string | null) ?? "";
  return Array.from(
    new Set(
      raw
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => /^https?:\/\//.test(line) || line.startsWith("/"))
    )
  );
}

function revalidateVisualPaths(key: VisualPageKey, scope: "admin" | "managers") {
  const publicPath = key === "home" ? "/" : "/connect";
  revalidatePath(publicPath);
  revalidatePath("/admin/pages/visual");
  revalidatePath(`/admin/pages/visual/${key}`);
  revalidatePath("/managers/pages/visual");
  revalidatePath(`/managers/pages/visual/${key}`);
  revalidatePath(`/${scope}/pages/visual`);
  revalidatePath(`/${scope}/pages/visual/${key}`);
}

async function saveVisualPage(
  keyRaw: string,
  formData: FormData,
  scope: "admin" | "managers"
) {
  const key = parseKey(keyRaw);
  if (!key) {
    redirect(`/${scope}/pages/visual?error=invalid_key`);
  }

  const html = ((formData.get("html") as string | null) ?? (formData.get("content") as string | null) ?? "").trim();
  const css = ((formData.get("css") as string | null) ?? "").trim();
  const styleHrefs = parseStyleHrefs(formData);
  const isPublished = toIsPublished(formData);

  try {
    await upsertVisualPage(key, html, css, styleHrefs, isPublished);
  } catch {
    redirect(`/${scope}/pages/visual/${key}?error=save_failed`);
  }

  revalidateVisualPaths(key, scope);

  redirect(`/${scope}/pages/visual/${key}?saved=1&t=${Date.now()}`);
}

async function restoreVisualPage(
  keyRaw: string,
  scope: "admin" | "managers"
) {
  const key = parseKey(keyRaw);
  if (!key) {
    redirect(`/${scope}/pages/visual?error=invalid_key`);
  }

  let restored = false;
  try {
    restored = await restorePreviousVisualPage(key);
  } catch {
    redirect(`/${scope}/pages/visual/${key}?error=restore_failed`);
  }

  if (!restored) {
    redirect(`/${scope}/pages/visual/${key}?error=no_previous_version`);
  }

  revalidateVisualPaths(key, scope);
  redirect(`/${scope}/pages/visual/${key}?restored=1&t=${Date.now()}`);
}

export async function updateVisualPageAsAdmin(key: string, formData: FormData) {
  return saveVisualPage(key, formData, "admin");
}

export async function updateVisualPageAsManager(key: string, formData: FormData) {
  return saveVisualPage(key, formData, "managers");
}

export async function restorePreviousVisualPageAsAdmin(key: string, formData?: FormData) {
  void formData;
  return restoreVisualPage(key, "admin");
}

export async function restorePreviousVisualPageAsManager(key: string, formData?: FormData) {
  void formData;
  return restoreVisualPage(key, "managers");
}
