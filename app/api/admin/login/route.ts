// app/api/auth/login/route.ts - УПРОЩЕННАЯ ВЕРСИЯ
import { NextResponse } from 'next/server';

// ВРЕМЕННО: Простая проверка без БД
function checkAdminCredentials(login: string, password: string): boolean {
  const adminLogin = process.env.ADMIN_LOGIN || "Gasan123";
  const adminPassword = process.env.ADMIN_PASSWORD || "1111";
  return login === adminLogin && password === adminPassword;
}

function createSessionToken(userId: number): string {
  return Buffer.from(`${userId}:${Date.now()}`).toString('base64');
}

export async function POST(request: Request) {
  try {
    // Пробуем получить тело запроса
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.log('Ошибка парсинга JSON:', jsonError);
      return NextResponse.json(
        { success: false, message: 'Неверный формат запроса' },
        { status: 400 }
      );
    }
    
    const { login, password } = body;
    
    console.log('🔐 Попытка входа:', { login, hasPassword: !!password });
    
    if (!login || !password) {
      return NextResponse.json(
        { success: false, message: 'Заполните логин и пароль' },
        { status: 400 }
      );
    }

    // Проверяем администратора
    const isAdmin = checkAdminCredentials(login, password);
    
    if (isAdmin) {
      console.log('✅ Вход как администратор');
      
      const sessionToken = createSessionToken(1);
      const response = NextResponse.json({
        success: true,
        message: 'Успешный вход как администратор',
        userType: 'admin',
      });

      response.cookies.set('admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      console.log('✅ Отправлен ответ для админа');
      return response;
    }
    
    // ВРЕМЕННО: Тестовый менеджер
    if (login === 'manager' && password === 'manager123') {
      console.log('✅ Вход как тестовый менеджер');
      
      const sessionToken = createSessionToken(2);
      const response = NextResponse.json({
        success: true,
        message: 'Успешный вход как менеджер',
        userType: 'manager',
      });

      response.cookies.set('manager_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });

      console.log('✅ Отправлен ответ для менеджера');
      return response;
    }
    
    console.log('❌ Неверные данные');
    return NextResponse.json(
      { success: false, message: 'Неверный логин или пароль' },
      { status: 401 }
    );
    
  } catch (error) {
    console.error('❌ Критическая ошибка API:', error);
    
    // Всегда возвращаем JSON, даже при ошибке
    return NextResponse.json(
      { 
        success: false, 
        message: 'Ошибка сервера',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Добавим GET метод для тестирования
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API входа работает',
    test: {
      admin: { login: 'Gasan123', password: '1111' },
      manager: { login: 'manager', password: 'manager123' }
    }
  });
}