// lib/uploads/file-utils.ts
import { unlink,  mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Удаляет файл из public/uploads
 */
export async function deleteUploadedFile(filename: string): Promise<boolean> {
  try {
    const filepath = join(process.cwd(), 'public', 'uploads', filename);
    
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
 * Извлекает имя файла из URL
 */
export function getFilenameFromUrl(url: string): string | null {
  if (!url) return null;
  
  // Если это локальный URL типа /uploads/filename.jpg
  const match = url.match(/\/uploads\/([^\/?]+)/);
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}

/**
 * Проверяет, является ли URL локальным файлом
 */
export function isLocalUpload(url: string): boolean {
  return url.includes('/uploads/') && !url.startsWith('http');
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