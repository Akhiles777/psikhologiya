"use client";

import { useState, useCallback } from "react";

type Props = {
  name?: string;
  defaultValue?: string;
  /** Максимум URL (например 5: основное + 4 доп.) */
  maxUrls?: number;
};

/**
 * Поле для списка URL фото: добавить по URL или загрузить файл, удалить.
 * Значение уходит в скрытое textarea с name="images" (по одному URL на строку).
 */
export function ImageUrlsField({ name = "images", defaultValue = "", maxUrls = 5 }: Props) {
  const initial = defaultValue
    ? defaultValue.split("\n").map((s) => s.trim()).filter(Boolean)
    : [];
  const [urls, setUrls] = useState<string[]>(initial.slice(0, maxUrls));

  const addUrl = useCallback(
    (url: string) => {
      const trimmed = url.trim();
      if (!trimmed || urls.length >= maxUrls) return;
      setUrls((prev) => [...prev, trimmed]);
    },
    [urls.length, maxUrls]
  );

  const removeAt = useCallback((index: number) => {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || urls.length >= maxUrls) return;
      e.target.value = "";
      const formData = new FormData();
      formData.set("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) setUrls((prev) => [...prev, data.url]);
        else alert(data.error || "Ошибка загрузки");
      } catch {
        alert("Ошибка загрузки");
      }
    },
    [urls.length, maxUrls]
  );

  const [newUrl, setNewUrl] = useState("");

  return (
    <div>
      <input type="hidden" name={name} value={urls.join("\n")} readOnly />
      <div className="flex flex-wrap gap-2">
        <input
          type="url"
          placeholder="Добавить по URL"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl(newUrl);
              setNewUrl("");
            }
          }}
          className="max-w-xs rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => {
            addUrl(newUrl);
            setNewUrl("");
          }}
          disabled={urls.length >= maxUrls}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          Добавить URL
        </button>
        <label className="cursor-pointer rounded-lg border border-[#5858E2] bg-[#5858E2]/10 px-3 py-2 text-sm font-medium text-[#5858E2] hover:bg-[#5858E2]/20">
          Загрузить файл
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      </div>
      <p className="mt-1 text-xs text-neutral-dark">
        Основное фото — первое в списке. Максимум {maxUrls} фото.
      </p>
      {urls.length > 0 && (
        <ul className="mt-3 space-y-2">
          {urls.map((url, i) => (
            <li key={i} className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-sm">
              <span className="min-w-0 flex-1 truncate text-foreground" title={url}>
                {i === 0 ? "Основное: " : ""}{url}
              </span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="shrink-0 text-red-600 hover:underline"
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
