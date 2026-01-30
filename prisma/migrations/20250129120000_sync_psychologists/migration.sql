-- Добавляем колонку workFormat, если её нет (схема Prisma могла обновиться раньше БД)
ALTER TABLE "psychologists" ADD COLUMN IF NOT EXISTS "workFormat" TEXT NOT NULL DEFAULT 'Онлайн и оффлайн';
