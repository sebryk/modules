# Backend

NestJS, Prisma и PostgreSQL. Требуется Bun 1.4.2 и настроенный `DATABASE_URL` в `.env`.

```bash
cd backend
bun install --frozen-lockfile
bun run prisma:generate
bun run start:dev
```

После установки запускайте `prisma:generate` явно: install-скрипты зависимостей отключены в `bunfig.toml`, чтобы чистая установка не падала на скрипте `argon2`.

Для сборки и запуска: `bun run build`, затем `bun run start`.

Проверки: `bun run lint` и `bun run test`. Миграции и заполнение базы: `bun run prisma:migrate:dev` и `bun run prisma:seed`.
