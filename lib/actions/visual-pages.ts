"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isVisualPageKey, upsertVisualPage, VisualPageKey } from "@/lib/visual-pages";

function toIsPublished(formData: FormData): boolean {
  const values = formData.getAll("isPublished");
  return values[values.length - 1] === "on";
}

function parseKey(value: string): VisualPageKey | null {
  return isVisualPageKey(value) ? value : null;
}

function parseStyleHrefs(formData: FormData): string[] {
  const raw = (formData.get("styleHrefs") as string | null) ?? "";
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^https?:\/\//.test(line) || line.startsWith("/"));
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

  const publicPath = key === "home" ? "/" : "/connect";
  revalidatePath(publicPath);
  revalidatePath(`/${scope}/pages/visual`);
  revalidatePath(`/${scope}/pages/visual/${key}`);

  redirect(`/${scope}/pages/visual/${key}?saved=1`);
}

export async function updateVisualPageAsAdmin(key: string, formData: FormData) {
  return saveVisualPage(key, formData, "admin");
}

export async function updateVisualPageAsManager(key: string, formData: FormData) {
  return saveVisualPage(key, formData, "managers");
}
