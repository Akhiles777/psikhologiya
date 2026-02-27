"use server";

import { prisma } from "@/lib/db";

   
                                                                       
                                                                    
   
export async function getPageBySlug(slug: string) {
  if (!prisma) return null;
  try {
    const page = await prisma.page.findUnique({
      where: { slug, isPublished: true },
      select: { title: true, template: true, content: true, showHeader: true, showFooter: true },
    });
    return page;
  } catch {
    return null;
  }
}
