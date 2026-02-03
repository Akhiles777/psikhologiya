// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomBytes } from "crypto";

// Для Docker: используем переменную окружения или путь по умолчанию
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
const PUBLIC_URL_PREFIX = process.env.PUBLIC_URL_PREFIX || "/api/uploads";
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB (увеличил для гибкости)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

// Проверяем безопасность имени файла
function isSafeFilename(filename: string): boolean {
  const unsafePatterns = [
    /\.\./, // directory traversal
    /\//,   // path separator
    /\\/,   // windows path separator
    /^\./,  // hidden files
    /[\x00-\x1f\x7f<>:"|?*]/ // control chars and invalid chars
  ];
  
  return !unsafePatterns.some(pattern => pattern.test(filename));
}

/**
 * Загрузка файла (фото) в папку uploads (Docker volume).
 * POST multipart/form-data с полем "file".
 * Возвращает { url: "/api/uploads/..." }.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Нет файла" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ 
        error: `Файл слишком большой (максимум ${MAX_SIZE / 1024 / 1024} МБ)` 
      }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: "Разрешены только изображения (JPEG, PNG, WebP, GIF)" 
      }, { status: 400 });
    }

    // Создаем папку, если не существует
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Генерируем уникальное и безопасное имя файла
    const originalExt = path.extname(file.name).toLowerCase();
    const extension = ALLOWED_EXTENSIONS.includes(originalExt) ? originalExt : ".jpg";
    const uniqueName = randomBytes(16).toString("hex") + extension;
    
    // Проверяем безопасность имени
    if (!isSafeFilename(uniqueName)) {
      return NextResponse.json({ error: "Недопустимое имя файла" }, { status: 400 });
    }

    const filePath = path.join(UPLOAD_DIR, uniqueName);

    // Сохраняем файл
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Возвращаем URL для доступа к файлу
    const url = `${PUBLIC_URL_PREFIX}/${uniqueName}`;
    
    // Логируем для отладки
    console.log(`📁 Файл сохранен: ${filePath}`);
    console.log(`🔗 Доступен по URL: ${url}`);
    console.log(`📊 Размер: ${file.size} байт, Тип: ${file.type}`);

    return NextResponse.json({ 
      success: true,
      url,
      filename: uniqueName,
      size: file.size,
      type: file.type
    });
    
  } catch (err) {
    console.error("❌ Upload error:", err);
    return NextResponse.json({ 
      error: "Ошибка загрузки файла",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}

/**
 * DELETE - удаление файла
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");
    
    if (!filename) {
      return NextResponse.json({ error: "Имя файла не указано" }, { status: 400 });
    }

    // Проверяем безопасность имени файла
    if (!isSafeFilename(filename)) {
      return NextResponse.json({ error: "Недопустимое имя файла" }, { status: 400 });
    }

    const filePath = path.join(UPLOAD_DIR, filename);

    // Проверяем существование файла
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
    }

    // Удаляем файл
    await unlink(filePath);
    
    console.log(`🗑️ Файл удален: ${filePath}`);

    return NextResponse.json({ 
      success: true,
      message: "Файл успешно удален"
    });
    
  } catch (err) {
    console.error("❌ Delete error:", err);
    return NextResponse.json({ 
      error: "Ошибка удаления файла",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}

/**
 * GET - получение списка файлов (для админки)
 */
export async function GET(request: NextRequest) {
  try {
    // В продакшене нужно добавить аутентификацию
    const fs = await import("fs/promises");
    const files = await fs.readdir(UPLOAD_DIR);
    
    const fileStats = await Promise.all(
      files.map(async (filename) => {
        if (!isSafeFilename(filename)) return null;
        
        try {
          const filePath = path.join(UPLOAD_DIR, filename);
          const stat = await fs.stat(filePath);
          
          // Проверяем, что это файл (не папка)
          if (!stat.isFile()) return null;
          
          // Проверяем расширение
          const ext = path.extname(filename).toLowerCase();
          if (!ALLOWED_EXTENSIONS.includes(ext)) return null;
          
          return {
            filename,
            url: `${PUBLIC_URL_PREFIX}/${filename}`,
            size: stat.size,
            createdAt: stat.birthtime,
            modifiedAt: stat.mtime
          };
        } catch {
          return null;
        }
      })
    );
    
    const validFiles = fileStats.filter(Boolean);
    
    return NextResponse.json({
      success: true,
      files: validFiles,
      count: validFiles.length,
      uploadDir: UPLOAD_DIR
    });
    
  } catch (err) {
    console.error("❌ List files error:", err);
    return NextResponse.json({ 
      error: "Ошибка получения списка файлов"
    }, { status: 500 });
  }
}