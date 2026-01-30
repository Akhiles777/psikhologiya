# Давай вместе (psikhologiya)

Каталог психологов: подбор по парадигме, цене, городу и уровню сертификации.

## Стек

- **Next.js** (App Router)
- **Tailwind CSS** — дизайн (primary #5858E2, accent #A7FF5A)
- **Prisma** + **PostgreSQL** — база данных

## Быстрый старт

### 1. Установка

```bash
npm install
```

### 2. База данных

В `.env` укажи:

```
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

Или подними PostgreSQL через Docker:

```bash
docker compose up -d
```

### 3. Синхронизация схемы БД и запуск

Если видишь ошибку **«The column psychologists.workFormat does not exist»** — схема БД не совпадает с Prisma. Выполни:

```bash
npx prisma generate
npx prisma db push
```

Либо применить миграции:

```bash
npx prisma migrate deploy
```

Затем:

```bash
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000).

Без `DATABASE_URL` сайт тоже запустится: каталог будет пустым, страницы психологов — 404.

## Скрипты

| Команда | Описание |
|--------|----------|
| `npm run dev` | Запуск dev-сервера |
| `npm run build` | Сборка |
| `npm run start` | Production-сервер |
| `npx prisma db push` | Применить схему к БД |
| `npx prisma migrate deploy` | Применить миграции |

## Маршруты

- **Главная** — `/`
- **Каталог психологов** — `/psy-list`
- **Профиль психолога** — `/psy-list/[slug]`
- **Библиотека / Статьи** — `/lib`, `/lib/articles`
- **Для психологов** — `/connect`
- **Контакты** — `/contacts`
- **Админ-панель** — `/admin` (психологи, страницы сайта)
- **Страницы из БД** — `/s/[slug]`

## Деплой

1. Собери: `docker build -t davay-vmeste .`
2. Запусти с переменной `DATABASE_URL` и портом 3000
3. Либо `npm run build` и `npm run start` (нужен Node и PostgreSQL)
