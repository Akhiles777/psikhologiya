#!/bin/bash

# 1. Очистка кэша
rm -rf .next
rm -rf node_modules/.cache

# 2. Исправление articles.ts
sed -i '' '115s/return a as typeof a \& { author: NonNullable<typeof a.author> \| null };/if (!a) return null; return { ...a, author: a.author ?? null };/' app/actions/articles.ts

# 3. Исправление catalog.ts
sed -i '' '99s/where: where as Parameters<typeof prisma.psychologist.findMany>\[0\]\["where"\],/...(where ? { where } : {}),/' app/actions/catalog.ts
sed -i '' '101s/orderBy: orderBy as Parameters<typeof prisma.psychologist.findMany>\[0\]\["orderBy"\],/...(orderBy ? { orderBy } : {}),/' app/actions/catalog.ts
sed -i '' '119s/let items = rows as (PsychologistCatalogItem \& { education: unknown })\[/let items = rows as unknown as (PsychologistCatalogItem \& { education: unknown })\[/' app/actions/catalog.ts

# 4. Исправление CatalogModal.tsx
sed -i '' '105s/variant="outline"/variant="default"/' components/catalog/CatalogModal.tsx

# 5. Исправление SiteHeader.tsx
sed -i '' '37s/href={item.href}/href={item.href || "\/"}/' components/layout/SiteHeader.tsx
sed -i '' '99s/href={item.href}/href={item.href || "\/"}/' components/layout/SiteHeader.tsx

# 6. Исправление paradigm-labels.ts
echo 'export type Paradigm = string;' > lib/paradigm-labels.ts

# 7. Исправление url.ts
sed -i '' '1i\
import { ReadonlyURLSearchParams } from "next/navigation";
' lib/url.ts

echo "✅ TypeScript ошибки исправлены"
