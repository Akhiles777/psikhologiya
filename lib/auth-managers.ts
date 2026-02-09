// /lib/auth-managers.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from './db';
import bcrypt from 'bcryptjs';

// ВАЖНО: Используем другое имя куки, чтобы не конфликтовать с основной админкой
export const MANAGER_COOKIE_NAME = "manager_session";
// Для совместимости, но не используем для менеджеров
export const ADMIN_COOKIE_NAME = "admin_session"; 

export function getManagerSessionSecret(): string {
  return process.env.MANAGER_SESSION_SECRET || "dev_manager_session_change_me";
}

// Проверка логина менеджера
export async function checkManagerCredentials(login: string, password: string): Promise<boolean> {
  try {
    if (!prisma) {
      console.error("Prisma client is not initialized");
      return false;
    }
    
    const manager = await prisma.manager.findUnique({
      where: { 
        login: login
      }
    });
    
    if (!manager) return false;
    
    // Проверяем статус менеджера
    if (manager.status !== 'active') {
      return false;
    }
    
    // Проверяем пароль
    const isValid = await bcrypt.compare(password, manager.password);
    return isValid;
  } catch (error) {
    console.error("Ошибка проверки менеджера:", error);
    return false;
  }
}

// Получение данных менеджера по логину
export async function getManagerByLogin(login: string) {
  try {
    if (!prisma) {
      console.error("Prisma client is not initialized");
      return null;
    }
    
    return await prisma.manager.findUnique({
      where: { 
        login: login
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        login: true,
        role: true,
        permissions: true,
        status: true,
        createdAt: true,
        lastLogin: true
      }
    });
  } catch (error) {
    console.error("Ошибка получения менеджера:", error);
    return null;
  }
}

// Проверка сессии менеджера - УПРОЩЕННАЯ ВЕРСИЯ
export function isManagerSessionValid(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  
  try {
    // Декодируем токен и проверяем что он валидный
    const decoded = Buffer.from(cookieValue, 'base64').toString();
    const [managerId, timestamp] = decoded.split(':');
    
    if (!managerId || !timestamp) return false;
    
    // Проверяем что токен не старше 24 часов
    const tokenTime = parseInt(timestamp);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 часа
    
    return (now - tokenTime) < maxAge;
  } catch (error) {
    return false;
  }
}

// Создание сессии менеджера - ДЛЯ API
export function createManagerSessionToken(managerId: number): string {
  return Buffer.from(`${managerId}:${Date.now()}`).toString('base64');
}

// Выход менеджера
export async function managerLogout() {
  'use server';
  
  try {
    const cookieStore = await cookies();
    await cookieStore.delete(MANAGER_COOKIE_NAME);
    // Не используем redirect здесь - пусть клиент сам редиректит
  } catch (error) {
    console.error('Ошибка при выходе:', error);
  }
}

// Проверка авторизации менеджера
export async function getCurrentManager() {
  try {
    const cookieStore = await cookies();
    // ВАЖНО: Проверяем КУКУ МЕНЕДЖЕРА
    const sessionCookie = await cookieStore.get(MANAGER_COOKIE_NAME);
    
    if (!sessionCookie?.value) {
      return null;
    }
    
    // Проверяем валидность сессии
    if (!isManagerSessionValid(sessionCookie.value)) {
      return null;
    }
    
    // Декодируем session token
    const decoded = Buffer.from(sessionCookie.value, 'base64').toString();
    const [managerId] = decoded.split(':');
    
    if (!managerId) {
      return null;
    }
    
    return await getManagerById(parseInt(managerId));
  } catch (error) {
    console.error('Ошибка получения текущего менеджера:', error);
    return null;
  }
}

// Получение менеджера по ID
export async function getManagerById(id: number) {
  try {
    if (!prisma) {
      console.error("Prisma client is not initialized");
      return null;
    }
    
    return await prisma.manager.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        login: true,
        role: true,
        permissions: true,
        status: true,
        createdAt: true,
        lastLogin: true
      }
    });
  } catch (error) {
    console.error("Ошибка получения менеджера по ID:", error);
    return null;
  }
}

// Проверка доступа менеджера - БЕЗ РЕДИРЕКТА!
export async function requireManager(): Promise<any | null> {
  const manager = await getCurrentManager();
  
  if (!manager) {
    // ВОЗВРАЩАЕМ null вместо редиректа
    // Редирект будет на клиенте через useRouter
    return null;
  }
  
  return manager;
}

// Проверка разрешений менеджера
export function hasPermission(manager: any, section: string, action: 'view' | 'edit' | 'delete' = 'view'): boolean {
  if (!manager?.permissions) return false;
  
  try {
    const permissions = typeof manager.permissions === 'string' 
      ? JSON.parse(manager.permissions) 
      : manager.permissions;
    
    if (!permissions[section]) return false;
    return permissions[section][action] === true;
  } catch (error) {
    console.error('Ошибка проверки разрешений:', error);
    return false;
  }
}

// Хелпер для проверки роли
export function hasRole(manager: any, role: string): boolean {
  return manager?.role === role;
}

// Получение ID менеджера из сессии (без запроса к БД) - ВНИМАНИЕ: эта функция ДОЛЖНА быть async!
export async function getManagerIdFromSession(): Promise<number | null> {
  try {
    const cookieStore = await cookies(); // ДОБАВЬТЕ await здесь!
    const sessionCookie = await cookieStore.get(MANAGER_COOKIE_NAME);
    
    if (!sessionCookie?.value) {
      return null;
    }
    
    const decoded = Buffer.from(sessionCookie.value, 'base64').toString();
    const [managerId] = decoded.split(':');
    
    return managerId ? parseInt(managerId) : null;
  } catch (error) {
    return null;
  }
}

// Альтернативная функция без async для серверных компонентов
export function getManagerIdFromCookie(cookieStore: any): number | null {
  try {
    const sessionCookie = cookieStore.get(MANAGER_COOKIE_NAME);
    
    if (!sessionCookie?.value) {
      return null;
    }
    
    const decoded = Buffer.from(sessionCookie.value, 'base64').toString();
    const [managerId] = decoded.split(':');
    
    return managerId ? parseInt(managerId) : null;
  } catch (error) {
    return null;
  }
}