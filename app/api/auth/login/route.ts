import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Дефолтные креды для админа из .env
const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'Gasan123';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || '1111';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

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

      response.cookies.set('auth-session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 часа
        path: '/',
      });

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

    // Создаем сессию
    const sessionData = {
      id: manager.id,
      email: manager.email,
      name: manager.name,
      role: manager.role,
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
        role: manager.role,
        permissions: manager.permissions || {},
        isActive: manager.isActive,
      }
    });

    response.cookies.set('auth-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 часа
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}