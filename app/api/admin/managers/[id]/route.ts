import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma'; // Используйте относительный путь

export const dynamic = 'force-dynamic';

// GET: Получить менеджера по ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Распаковываем params
    const params = await context.params;
    const id = params.id;
    
    console.log('🔄 GET /api/admin/managers/[id] called with ID:', id);
    
    if (!id) {
      console.error('❌ ID is missing');
      return NextResponse.json(
        { error: 'ID менеджера не указан' },
        { status: 400 }
      );
    }

    console.log('🔍 Ищем менеджера с ID:', id);
    
    // Пробуем найти менеджера
    const manager = await prisma.manager.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('📊 Найден менеджер:', manager);

    if (!manager) {
      console.log('⚠️ Менеджер не найден в базе');
      return NextResponse.json(
        { error: 'Менеджер не найден' },
        { status: 404 }
      );
    }
    
    console.log('✅ Отправляем данные менеджера');
    return NextResponse.json(manager);
    
  } catch (error: any) {
    console.error('💥 Ошибка в API endpoint:', error);
    console.error('Stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Внутренняя ошибка сервера',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT: Обновить менеджера
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID менеджера не указан' },
        { status: 400 }
      );
    }

    const data = await request.json();
    
    // Проверяем, существует ли менеджер
    const existingManager = await prisma.manager.findUnique({
      where: { id },
    });

    if (!existingManager) {
      return NextResponse.json(
        { error: 'Менеджер не найден' },
        { status: 404 }
      );
    }

    // Подготовка данных для обновления
    const updateData: any = {
      name: data.name,
      email: data.email,
      role: data.role,
      isActive: data.isActive,
      permissions: data.permissions,
    };

    // Если указан новый пароль
    if (data.password) {
      const bcrypt = await import('bcryptjs');
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // Обновляем менеджера
    const updatedManager = await prisma.manager.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        permissions: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedManager);
  } catch (error: any) {
    console.error('Error updating manager:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении менеджера' },
      { status: 500 }
    );
  }
}

// DELETE: Полное удаление менеджера
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: 'ID менеджера не указан' },
        { status: 400 }
      );
    }
    // Полное удаление менеджера
    await prisma.manager.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Менеджер удалён' });
  } catch (error: any) {
    console.error('Error deleting manager:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении менеджера' },
      { status: 500 }
    );
  }
}