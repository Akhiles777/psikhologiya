"use client";

import { useState, useEffect, useRef } from "react";
import { ArticleContentEditor, type ArticleContentEditorApi } from "@/components/articles/ArticleContentEditor";
import EntityFilesField from "@/components/files/EntityFilesField";

function FormInput({ label, ...props }: any) {
  return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <input {...props} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20" />
      </div>
  );
}

function FormTextarea({ label, ...props }: any) {
  return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <textarea {...props} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20" />
      </div>
  );
}

interface ArticleFormProps {
  initialData?: any;
  onSubmit?: (data: any) => Promise<void> | void;
  loading?: boolean;
  psychologists?: any[];
}

export default function ArticleForm({
                                      initialData = {},
                                      onSubmit,
                                      loading: externalLoading,
                                      psychologists = []
                                    }: ArticleFormProps) {
  const articleId = typeof initialData.id === "string" ? initialData.id : "";
  const [draftFilesKey] = useState(() => `article-draft-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
  const [title, setTitle] = useState(initialData.title || "");
  const [slug, setSlug] = useState(initialData.slug || "");
  const [shortText, setShortText] = useState(initialData.shortText || "");
  const [content, setContent] = useState(initialData.content || "");
  const [tags, setTags] = useState<string[]>(initialData.tags || []);
  const [tagsInput, setTagsInput] = useState<string>((initialData.tags || []).join(", "));
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allCatalogs, setAllCatalogs] = useState<string[]>([]);
  const [authorId, setAuthorId] = useState(initialData.authorId || "");
  const [authorName, setAuthorName] = useState(initialData.author?.fullName || "");
  const [catalogSlug, setCatalogSlug] = useState(initialData.catalogSlug || "");
  const [isPublished, setIsPublished] = useState(!!initialData.publishedAt || !!initialData.isPublished);
  const [authorSearch, setAuthorSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [slugWarning, setSlugWarning] = useState<string | null>(null);
  const initialManagedFiles = useRef<string[]>(
    typeof initialData.content === "string"
      ? Array.from(
          new Set(
            (initialData.content.match(/\/articles\/files\/[a-z0-9_-]+\/[^\s"'<>`]+/gi) || []).map((item: string) =>
              item.replace(/[),.;]+$/, "")
            )
          )
        )
      : []
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentEditorApiRef = useRef<ArticleContentEditorApi | null>(null);

  // Загружаем тэги и каталоги через общий API /api/articles
  useEffect(() => {
    fetch("/api/articles", { cache: "no-store" })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.articles) {
            // Собираем уникальные тэги из всех статей
            const tagsSet = new Set<string>();
            // Собираем уникальные каталоги из всех статей
            const catalogsSet = new Set<string>();

            data.articles.forEach((article: any) => {
              article.tags?.forEach((tag: string) => tagsSet.add(tag));
              if (article.catalogSlug) {
                catalogsSet.add(article.catalogSlug);
              }
            });

            setAllTags(Array.from(tagsSet));
            setAllCatalogs(Array.from(catalogsSet));
          }
        })
        .catch(err => console.error("Error loading data:", err));
  }, []);

  // Закрываем дропдаун при клике вне
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Устанавливаем имя автора при загрузке
  useEffect(() => {
    if (initialData.author?.fullName) {
      setAuthorName(initialData.author.fullName);
      setAuthorSearch(initialData.author.fullName);
    }
  }, [initialData.author]);

  // Фильтруем психологов по поиску
  const filteredAuthors = authorSearch
      ? psychologists.filter((p: any) =>
          p.fullName?.toLowerCase().includes(authorSearch.toLowerCase())
      )
      : psychologists;

  // Выбираем автора
  const selectAuthor = (author: any) => {
    setAuthorId(author.id);
    setAuthorName(author.fullName);
    setAuthorSearch(author.fullName);
    setShowDropdown(false);
  };

  // Очищаем автора
  const clearAuthor = () => {
    setAuthorId("");
    setAuthorName("");
    setAuthorSearch("");
    setShowDropdown(false);
  };

  // Проверка slug на допустимые символы
  const validateSlug = (value: string): string | null => {
    if (!value) return null;

    // Разрешаем только латиницу, цифры, дефисы и нижние подчеркивания
    const allowedPattern = /^[a-z0-9\-_]+$/;

    if (!allowedPattern.test(value)) {
      return "Slug может содержать только латинские буквы, цифры, дефисы (-) и нижние подчеркивания (_)";
    }

    return null;
  };

  // Обработчик изменения slug
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value.replace(/\s/g, "").toLowerCase();
    setSlug(newSlug);

    // Проверяем на допустимые символы
    const warning = validateSlug(newSlug);
    setSlugWarning(warning);
  };

  const parseTags = (value: string): string[] =>
    value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const hasMeaningfulContent = (value: string): boolean => {
    const plain = value
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    return plain.length > 0;
  };

  const escapeHtml = (value: string): string =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const isImageFile = (value: string): boolean => /\.(png|jpe?g|gif|webp|avif|svg|heic|heif)(\?.*)?$/i.test(value);

  const insertHtmlToArticleContent = (snippet: string) => {
    const inserted = contentEditorApiRef.current?.insertHtml(snippet) ?? false;
    if (!inserted) {
      setContent((prev: string) => {
        const base = prev.trimEnd();
        return base ? `${base}\n\n${snippet}\n` : `${snippet}\n`;
      });
    }
    contentEditorApiRef.current?.focus();
    setSuccess("Файл вставлен в текст статьи.");
    window.setTimeout(() => setSuccess(null), 1400);
  };

  const handleInsertFileLink = (file: { url: string; name: string }) => {
    if (isImageFile(file.name) || isImageFile(file.url)) {
      handleInsertFileImage(file);
      return;
    }
    const safeName = escapeHtml(file.name || "Скачать файл");
    const safeUrl = escapeHtml(file.url);
    insertHtmlToArticleContent(
      `<p><a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeName}</a></p>`
    );
  };

  const handleInsertFileImage = (file: { url: string; name: string }) => {
    const alt = escapeHtml(file.name || "Изображение");
    const safeUrl = escapeHtml(file.url);
    insertHtmlToArticleContent(
      `<p><img src="${safeUrl}" alt="${alt}" style="max-width:100%;height:auto;" loading="lazy" /></p>`
    );
  };

  function validate() {
    if (!title.trim()) return "Заполните заголовок";
    if (!slug.trim()) return "Заполните slug";

    // Проверяем slug перед отправкой
    const slugWarning = validateSlug(slug);
    if (slugWarning) return slugWarning;

    if (!shortText.trim()) return "Заполните короткий текст";
    if (!hasMeaningfulContent(content)) return "Заполните длинный текст";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const err = validate();
    if (err) return setError(err);

    setSubmitting(true);

    try {
      const formData = {
        title: title.trim(),
        slug: slug.trim(),
        shortText: shortText.trim(),
        content: content.trim(),
        tags: parseTags(tagsInput),
        authorId: authorId || null,
        catalogSlug: catalogSlug?.trim() || null,
        isPublished: Boolean(isPublished)
      };

      console.log("🚀 Submitting article data:", formData);

      if (onSubmit) {
        await onSubmit(formData);
        setSuccess("Сохранено!");
        setTimeout(() => {
          window.location.assign(`/admin/articles?updated=${Date.now()}`);
        }, 450);
      }
      else {
        console.log("📡 Sending POST request to /api/articles");

        const response = await fetch("/api/articles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData)
        });

        console.log("📥 Response status:", response.status);

        const responseText = await response.text();
        console.log("📥 Response text:", responseText);

        if (!responseText) {
          throw new Error("Сервер вернул пустой ответ");
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("❌ Failed to parse JSON:", responseText);
          throw new Error(`Сервер вернул невалидный JSON. Первые 100 символов: ${responseText.substring(0, 100)}`);
        }

        if (!response.ok || !data.success) {
          throw new Error(data.error || `Ошибка сервера: ${response.status}`);
        }

        console.log("✅ Article created successfully:", data.article);
        setSuccess("Статья успешно сохранена!");

        setTimeout(() => {
          window.location.assign(`/admin/articles?created=${Date.now()}`);
        }, 650);
      }
    } catch (e: any) {
      console.error("❌ Form submission error:", e);
      setError(e?.message || "Ошибка сохранения");
    } finally {
      setSubmitting(false);
    }
  }

  const isSubmitting = submitting || externalLoading;
  const articleFilesEntityKey = articleId ? `article-${articleId}` : draftFilesKey;

  return (
      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-[#5858E2] mb-6">Данные статьи</h2>

          {error && (
              <div className="mb-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-800">
                <p className="font-medium">{error}</p>
              </div>
          )}

          {success && (
              <div className="mb-4 rounded-xl border-2 border-green-300 bg-green-50 p-4 text-green-800">
                <p className="font-medium">{success}</p>
              </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <FormInput
                label="Заголовок *"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                required
                disabled={isSubmitting}
            />
            <div>
              <FormInput
                  label="URL (slug) *"
                  value={slug}
                  onChange={handleSlugChange}
                  required
                  placeholder="my-article"
                  disabled={isSubmitting}
              />
              {/* Предупреждение о недопустимых символах */}
              {slugWarning && (
                  <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                    <span>⚠️</span> {slugWarning}
                  </p>
              )}
              {/* Подсказка по формату */}
              <p className="text-xs text-gray-500 mt-1">
                Только латинские буквы, цифры, дефисы (-) и нижние подчеркивания (_)
              </p>
              {/* Предпросмотр URL */}
              {slug && !slugWarning && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ URL: /lib/articles/{slug}
                  </p>
              )}
            </div>
          </div>

          <FormTextarea
              label="Короткий текст *"
              value={shortText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setShortText(e.target.value)}
              rows={2}
              maxLength={200}
              required
              disabled={isSubmitting}
          />

          <ArticleContentEditor
              label="Длинный текст"
              value={content}
              onChange={setContent}
              rows={14}
              required
              disabled={isSubmitting}
              placeholder="Введите полный текст статьи..."
              editorApiRef={contentEditorApiRef}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Тэги (через запятую)</label>
            <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onBlur={() => {
                  const parsed = parseTags(tagsInput);
                  setTags(parsed);
                  setTagsInput(parsed.join(", "));
                }}
                list="all-tags"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                placeholder="тег1, тег2, тег3"
                disabled={isSubmitting}
            />
            <datalist id="all-tags">
              {allTags.map(tag => <option key={tag} value={tag} />)}
            </datalist>
            <div className="text-xs text-gray-500 mt-1">
              Существующие тэги: {allTags.length > 0 ? allTags.join(", ") : "нет"}
            </div>
          </div>

          <EntityFilesField
              scope="articles"
              entityKey={articleFilesEntityKey}
              title="Файлы статьи"
              hint="Перетащите файлы или выберите их с устройства. Файлы сохраняются в /articles/files/[ключ-статьи]/."
              initialUrls={initialManagedFiles.current}
              onInsertLink={handleInsertFileLink}
              onInsertImage={handleInsertFileImage}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Каталог</label>
            <input
                type="text"
                value={catalogSlug}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCatalogSlug(e.target.value)}
                list="all-catalogs"
                placeholder="например, 26/сен"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                disabled={isSubmitting}
            />
            <datalist id="all-catalogs">
              {allCatalogs.map(catalog => <option key={catalog} value={catalog} />)}
            </datalist>
            <div className="text-xs text-gray-500 mt-1">
              Существующие каталоги: {allCatalogs.length > 0 ? allCatalogs.join(", ") : "нет"}
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Автор <span className="text-xs text-gray-500">(начните вводить фамилию)</span>
            </label>

            {/* Поле поиска */}
            <input
                ref={inputRef}
                type="text"
                value={authorSearch}
                onChange={(e) => {
                  const value = e.target.value;
                  setAuthorSearch(value);
                  setShowDropdown(true);
                  if (!value) {
                    setAuthorId("");
                    setAuthorName("");
                    return;
                  }
                  if (value !== authorName) {
                    setAuthorId("");
                    setAuthorName("");
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Иванов Иван Иванович"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                disabled={isSubmitting}
                autoComplete="off"
            />

            {/* Кнопка очистки */}
            {authorId && (
                <button
                    type="button"
                    onClick={clearAuthor}
                    className="absolute right-3 top-[42px] text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
            )}

            {/* Выпадающий список с результатами */}
            {showDropdown && (authorSearch || filteredAuthors.length > 0) && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredAuthors.length > 0 ? (
                      filteredAuthors.map((author: any) => (
                          <div
                              key={author.id}
                              onClick={() => selectAuthor(author)}
                              className={`
                      px-4 py-3 cursor-pointer hover:bg-[#5858E2]/5 border-b border-gray-100 last:border-0
                      ${author.id === authorId ? 'bg-[#5858E2]/10' : ''}
                    `}
                          >
                            <div className="font-medium text-gray-900">{author.fullName}</div>
                            {author.shortBio && (
                                <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                  {author.shortBio}
                                </div>
                            )}
                          </div>
                      ))
                  ) : (
                      <div className="px-4 py-3 text-gray-500">
                        Ничего не найдено
                      </div>
                  )}
                </div>
            )}

            {/* Подсказка */}
            <p className="text-xs text-gray-500 mt-2">
              {psychologists.length} психологов доступно для выбора
            </p>
            {authorSearch && !authorId && (
                <p className="text-xs text-amber-600 mt-1">
                  Выберите автора из списка психологов или очистите поле
                </p>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2">
            <input
                type="checkbox"
                checked={isPublished}
                onChange={e => setIsPublished(e.target.checked)}
                id="isPublished"
                className="h-4 w-4 rounded border-gray-300 text-[#5858E2] focus:ring-[#5858E2]"
                disabled={isSubmitting}
            />
            <label htmlFor="isPublished" className="font-medium text-gray-700">Опубликовать</label>
          </div>

          <div className="flex justify-end pt-6">
            <button
                type="submit"
                className="rounded-xl bg-[#5858E2] px-8 py-3 font-medium text-white hover:bg-[#4848d0] shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
            >
              {isSubmitting ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </div>
      </form>
  );
}
