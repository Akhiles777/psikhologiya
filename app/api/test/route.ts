// app/api/test/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "ok",
    message: "API работает",
    timestamp: new Date().toISOString(),
    uploadsPath: process.env.UPLOAD_DIR,
    nodeEnv: process.env.NODE_ENV
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "Нет файла" }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      message: "Файл получен успешно (тестовый endpoint)"
    });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка теста" }, { status: 500 });
  }
}