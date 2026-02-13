import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('auth-session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Нет сессии' }, { status: 401 });
    }
    const sessionData = JSON.parse(sessionCookie.value);
    // Получаем актуальные данные менеджера
    const manager = await prisma.manager.findUnique({
      where: { id: sessionData.id },
    });
    if (!manager) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 401 });
    }
    // Обновляем cookie с актуальными правами и ролью
    const newSessionData = {
      ...sessionData,
      role: manager.role,
      permissions: manager.permissions || {},
      isActive: manager.isActive,
    };
    const response = NextResponse.json({ success: true });
    response.cookies.set('auth-session', JSON.stringify(newSessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 часа
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json({ error: 'Ошибка обновления сессии' }, { status: 500 });
  }
}
