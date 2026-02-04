'use server';

import { revalidatePath } from 'next/cache';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Импортируем статические парадигмы (этот файл нужно создать)
import { PARADIGM_OPTIONS } from '@/lib/paradigm-options';

// Получить все справочники
export async function getAllDataLists() {
  try {
    return await prisma.dataList.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching data lists:', error);
    return [];
  }
}

// Получить конкретный справочник
export async function getDataList(slug: string) {
  try {
    const dataList = await prisma.dataList.findUnique({
      where: { slug },
    });

    if (!dataList) {
      // Создаем справочник если его нет
      const name = getListNameBySlug(slug);
      const defaultItems = getDefaultItemsBySlug(slug);
      
      return await prisma.dataList.create({
        data: {
          slug,
          name,
          items: defaultItems,
        },
      });
    }

    return dataList;
  } catch (error) {
    console.error(`Error fetching data list ${slug}:`, error);
    return null;
  }
}

// Вспомогательная функция для безопасного преобразования
function convertJsonToStringArray(items: any): string[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  
  // Фильтруем только строки
  return items
    .filter(item => typeof item === 'string')
    .map(item => String(item));
}

// Получить элементы справочника в правильном формате
// В admin-references.ts, обновите функцию getDataListItems:
export async function getDataListItems(slug: string): Promise<string[]> {
  try {
    // Сначала получаем дефолтные значения
    const defaultItems = getDefaultItemsBySlug(slug);
    
    // Пытаемся найти в базе
    const dataList = await prisma.dataList.findUnique({
      where: { slug },
    });

    if (!dataList) {
      // Создаем запись с дефолтными значениями
      await prisma.dataList.create({
        data: {
          slug,
          name: getListNameBySlug(slug),
          items: defaultItems,
        },
      });
      return defaultItems;
    }

    // Если в базе есть данные, но они старые (мало элементов)
    // Например, для парадигм должно быть 17 элементов
    const currentItems = convertJsonToStringArray(dataList.items);
    
    if (slug === 'paradigms' && currentItems.length < 10) {
      console.log('⚠️ Обнаружены старые данные парадигм, обновляем...');
      // Обновляем запись с дефолтными значениями
      await prisma.dataList.update({
        where: { slug },
        data: { items: defaultItems },
      });
      return defaultItems;
    }

    return currentItems;
  } catch (error) {
    console.error(`Error fetching data list items ${slug}:`, error);
    return getDefaultItemsBySlug(slug); // Всегда возвращаем дефолты при ошибке
  }
}

// Обновить справочник
export async function updateDataList(slug: string, items: string[]) {
  try {
    await prisma.dataList.upsert({
      where: { slug },
      update: { items },
      create: {
        slug,
        name: getListNameBySlug(slug),
        items,
      },
    });

    revalidatePath('/admin/references');
    return { success: true };
  } catch (error) {
    console.error(`Error updating data list ${slug}:`, error);
    return { success: false, error: 'Ошибка обновления' };
  }
}

// Вспомогательные функции
function getListNameBySlug(slug: string): string {
  const names: Record<string, string> = {
    'work-formats': 'Форматы работы',
    'paradigms': 'Парадигмы',
    'certification-levels': 'Уровни сертификации',
  };
  return names[slug] || slug;
}

function getDefaultItemsBySlug(slug: string): string[] {
  const defaults: Record<string, string[]> = {
    'work-formats': ['Онлайн и оффлайн', 'Только онлайн', 'Только оффлайн', 'Переписка'],
    'paradigms': PARADIGM_OPTIONS.map(p => p.value), // Используем статические парадигмы
    'certification-levels': ['1', '2', '3'],
  };
  return defaults[slug] || [];
}