// lib/utils/docker-utils.ts (переименуйте из lib/uploads/docker-utils.ts)
import { unlink,  mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// Путь для загрузок из переменной окружения
const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');

/**
 * Удаляет файл из папки uploads
 */
export async function deleteUploadedFile(filename: string): Promise<boolean> {
  try {
    const filepath = join(UPLOAD_DIR, filename);
    
    if (existsSync(filepath)) {
      await unlink(filepath);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Ошибка при удалении файла:', error);
    return false;
  }
}

/**
 * Сохраняет файл в папку uploads
 */
export async function saveUploadedFile(file: File): Promise<string> {
  // Создаем папку, если не существует
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  // Создаем уникальное имя файла
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filename = `image_${timestamp}_${random}.${extension}`;
  
  const filepath = join(UPLOAD_DIR, filename);
  
  // Конвертируем File в Buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Сохраняем файл (используем стандартный Node.js writeFile)
  await writeFile(filepath, buffer);

  // Возвращаем URL для доступа к файлу
  return `/api/uploads/${filename}`;
}

/**
 * Извлекает имя файла из URL
 */
export function getFilenameFromUrl(url: string): string | null {
  if (!url) return null;
  
  // Если это URL API типа /api/uploads/filename.jpg
  const match = url.match(/\/api\/uploads\/([^\/?]+)/);
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}

/**
 * Проверяет, является ли URL локальным файлом
 */
export function isLocalUpload(url: string): boolean {
  return url.includes('/api/uploads/') && !url.startsWith('http');
}

/**
 * Создает уникальное имя файла
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  return `image_${timestamp}_${random}.${extension}`;
}