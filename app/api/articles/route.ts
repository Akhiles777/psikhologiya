import { NextResponse } from "next/server";
import { getArticles } from "@/lib/articles";

export async function GET() {
  try {
    console.log("[API] GET /api/articles - start");
    const articles = await getArticles({});
    console.log(`[API] GET /api/articles - success, count:`, articles?.length || 0);
    
    // Всегда возвращаем массив, даже если articles undefined
    return NextResponse.json({ 
      success: true, 
      articles: articles || [] 
    });
  } catch (error) {
    console.error("[API] GET /api/articles - error:", error);
    // Возвращаем пустой массив при ошибке
    return NextResponse.json({ 
      success: false, 
      articles: [],
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("[API] POST /api/articles - data:", JSON.stringify(data, null, 2));
    
    const { createArticle } = await import("@/lib/articles");
    const article = await createArticle(data);
    
    return NextResponse.json({ success: true, article });
  } catch (error: any) {
    console.error("[API] POST /api/articles - error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create article" },
      { status: 400 }
    );
  }
}