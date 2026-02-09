import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('auth-session');
    
    if (!sessionCookie) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const sessionData = JSON.parse(sessionCookie.value);
    
    // Проверяем срок действия
    if (sessionData.expires && new Date(sessionData.expires) < new Date()) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ 
      user: {
        id: sessionData.id,
        email: sessionData.email,
        name: sessionData.name,
        role: sessionData.role,
        permissions: sessionData.permissions || {},
        isActive: sessionData.isActive,
      }
    });
    
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}