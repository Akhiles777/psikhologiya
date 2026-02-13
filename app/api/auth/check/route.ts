import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('auth-session');
    if (!sessionCookie) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    const sessionData = JSON.parse(sessionCookie.value);
    // Получаем актуальные данные менеджера
    const manager = await prisma.manager.findUnique({
      where: { id: sessionData.id },
    });
    if (!manager) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    // Проверяем срок действия (опционально)
    if (sessionData.expires && new Date(sessionData.expires) < new Date()) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    // Возвращаем только актуальные права и роль из базы
    return NextResponse.json({
      user: {
        id: manager.id,
        email: manager.email,
        name: manager.name,
        role: manager.role,
        permissions: manager.permissions || {},
        isActive: manager.isActive,
      }
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}