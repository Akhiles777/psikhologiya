import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Дефолтные креды для админа из .env
const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'Gasan123';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || '1111';
const IS_PROD = process.env.NODE_ENV === 'production';

function normalizeRole(role: unknown): 'ADMIN' | 'MANAGER' {
  return String(role || 'MANAGER').toUpperCase() === 'ADMIN' ? 'ADMIN' : 'MANAGER';
}

function setSessionCookie(
  response: NextResponse,
  name: string,
  value: string,
  maxAgeSeconds: number
) {
  response.cookies.set(name, value, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: maxAgeSeconds,
    path: '/',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? body?.login ?? '').trim();
    const password = String(body?.password ?? '').trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Укажите email/логин и пароль' },
        { status: 400 }
      );
    }

    // Сначала проверяем дефолтного админа
    if (email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
      // Создаем сессию для дефолтного админа
      const sessionData = {
        id: 'admin-default',
        email: DEFAULT_ADMIN_EMAIL,
        name: 'Администратор',
        role: 'ADMIN',
        isActive: true,
        permissions: {
          psychologists: { view: true, edit: true },
          pages: { view: true, edit: true },
          listdate: { view: true, edit: true },
          managers: { view: true, edit: true },
        },
        isDefaultAdmin: true,
        createdAt: new Date().toISOString(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 часа
      };

      const response = NextResponse.json({
        user: {
          id: 'admin-default',
          email: DEFAULT_ADMIN_EMAIL,
          name: 'Администратор',
          role: 'ADMIN',
          permissions: sessionData.permissions,
          isDefaultAdmin: true,
        }
      });

      setSessionCookie(response, 'auth-session', JSON.stringify(sessionData), 60 * 60 * 24);

      return response;
    }

    // Если не дефолтный админ - ищем в базе менеджеров
    const manager = await prisma.manager.findUnique({
      where: { email },
    });

    if (!manager) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 401 }
      );
    }

    // Проверяем пароль
    const isValidPassword = await bcrypt.compare(password, manager.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Неверный пароль' },
        { status: 401 }
      );
    }

    // Проверяем что менеджер активен
    if (!manager.isActive) {
      return NextResponse.json(
        { error: 'Аккаунт деактивирован' },
        { status: 403 }
      );
    }

    const normalizedRole = normalizeRole(manager.role);

    // Создаем сессию
    const sessionData = {
      id: manager.id,
      email: manager.email,
      name: manager.name,
      role: normalizedRole,
      permissions: manager.permissions || {},
      isActive: manager.isActive,
      createdAt: new Date().toISOString(),
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 часа
    };

    const response = NextResponse.json({
      user: {
        id: manager.id,
        email: manager.email,
        name: manager.name,
        role: normalizedRole,
        permissions: manager.permissions || {},
        isActive: manager.isActive,
      }
    });

    setSessionCookie(response, 'auth-session', JSON.stringify(sessionData), 60 * 60 * 24);
    setSessionCookie(
      response,
      'manager_session',
      Buffer.from(`${manager.id}:${Date.now()}`).toString('base64'),
      60 * 60 * 24
    );

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
