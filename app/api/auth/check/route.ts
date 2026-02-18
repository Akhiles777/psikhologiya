import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('auth-session');
    if (!sessionCookie) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    let sessionData: Record<string, unknown>;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Проверяем срок действия сессии
    const expires = typeof sessionData.expires === 'string' ? sessionData.expires : '';
    if (expires && new Date(expires) < new Date()) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Дефолтный администратор (без записи в таблице managers)
    if (sessionData.isDefaultAdmin === true || sessionData.id === 'admin-default') {
      return NextResponse.json({
        user: {
          id: 'admin-default',
          email: String(sessionData.email || ''),
          name: String(sessionData.name || 'Администратор'),
          role: 'ADMIN',
          permissions: sessionData.permissions || {
            psychologists: { view: true, edit: true, delete: true },
            pages: { view: true, edit: true, delete: true },
            listdate: { view: true, edit: true, delete: true },
            managers: { view: true, edit: true, delete: true },
          },
          isActive: true,
        },
      });
    }

    const managerId = typeof sessionData.id === 'string' ? sessionData.id : '';
    if (!managerId) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Получаем актуальные данные менеджера
    const manager = await prisma.manager.findUnique({
      where: { id: managerId },
    });
    if (!manager) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: manager.id,
        email: manager.email,
        name: manager.name,
        role: manager.role,
        permissions: manager.permissions || {},
        isActive: manager.isActive,
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
