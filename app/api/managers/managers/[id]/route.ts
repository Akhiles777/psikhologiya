import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET: Получить менеджера по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'База данных недоступна' }, { status: 500 });
    }

    const { id } = await params;

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
      },
    });

    if (!manager) {
      return NextResponse.json({ error: 'Менеджер не найден' }, { status: 404 });
    }

    return NextResponse.json(manager);
  } catch (error) {
    console.error('Error fetching manager:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// PUT: Обновить менеджера
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'База данных недоступна' }, { status: 500 });
    }

    const { id } = await params;
    const data = await request.json();

    // Проверяем, существует ли менеджер
    const existingManager = await prisma.manager.findUnique({
      where: { id },
    });

    if (!existingManager) {
      return NextResponse.json({ error: 'Менеджер не найден' }, { status: 404 });
    }

    // Если нужно обновить email, проверяем, что он не занят другим менеджером
    if (data.email && data.email !== existingManager.email) {
      const emailExists = await prisma.manager.findFirst({
        where: {
          email: data.email,
          id: { not: id },
        },
      });

      if (emailExists) {
        return NextResponse.json({ error: 'Менеджер с таким email уже существует' }, { status: 400 });
      }
    }

    // Подготавливаем данные для обновления
    const updateData: any = {
      name: data.name,
      email: data.email,
      role: data.role,
      isActive: data.isActive,
      permissions: data.permissions,
    };

    // Если передан пароль, хешируем его
    if (data.password) {
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
        createdAt: true,
      },
    });

    return NextResponse.json(updatedManager);
  } catch (error) {
    console.error('Error updating manager:', error);
    return NextResponse.json({ error: 'Ошибка обновления менеджера' }, { status: 500 });
  }
}

// DELETE: Удалить менеджера
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'База данных недоступна' }, { status: 500 });
    }

    const { id } = await params;

    // Нельзя удалить себя
    // TODO: Добавить проверку текущего пользователя из сессии

    await prisma.manager.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting manager:', error);
    return NextResponse.json({ error: 'Ошибка удаления менеджера' }, { status: 500 });
  }
}