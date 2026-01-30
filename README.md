# Давай вместе

Каталог психологов: подбор по парадигме, цене, городу и уровню сертификации.

## Стек

- **Next.js** (App Router)
- **Tailwind CSS** — дизайн-система (primary #5858E2, accent #A7FF5A)
- **Prisma** + **PostgreSQL** — база данных

## Быстрый старт

### 1. Установка

```bash
npm install
```

### 2. База данных

**Вариант А: Docker (PostgreSQL 16)**

```bash
docker compose up -d
```

В `.env` укажи:

```
DATABASE_URL="postgresql://davay:davay_secret@localhost:5432/davay_vmeste?schema=public"
```

**Вариант Б: свой PostgreSQL**

Создай базу и в `.env` укажи свой `DATABASE_URL` (см. `.env.example`).

### 3. Миграции и запуск

```bash
npx prisma generate
npx prisma db push
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000).

Без `DATABASE_URL` сайт тоже запустится: каталог будет пустым, страницы психологов — 404.

## Скрипты

| Команда | Описание |
|--------|----------|
| `npm run dev` | Запуск dev-сервера (перед этим вызывается `prisma generate`) |
| `npm run build` | Сборка (prisma generate + next build) |
| `npm run start` | Запуск production-сервера |
| `npx prisma db push` | Применить схему к БД без миграций |
| `npx prisma migrate dev` | Создать и применить миграцию |

## Структура

- **Главная** (`/`) — лендинг, CTA в каталог
- **Каталог** (`/catalog`) — фильтры, карточки, «Показать ещё»
- **Психолог** (`/psychologist/[slug]`) — анкета: фото, био, образование, контакты
- **Статические страницы** (`/s/[slug]`) — лендинги из БД (StaticPage.blocks → Block Renderer: Hero, Features, CatalogPreview)

## Деплой на VPS

1. Собери образ: `docker build -t davay-vmeste .`
2. Запусти с переменной `DATABASE_URL` и портом 3000
3. Либо используй `npm run build` и `npm run start` (нужен Node и PostgreSQL)

## Дизайн

- Primary: #5858E2 (кнопки, акценты)
- Accent: #A7FF5A (бейджи Level 1–3, CTA)
- Neutral: #BFBFBF (второстепенный текст)
- Фон: #F8F7F4 (слоновая кость)
- Стеклянные карточки (glassmorphism), скругление 1rem
