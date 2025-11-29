# Bitrix24 MCP Proxy for Vercel

API-прокси для выполнения REST-методов Bitrix24 через MCP-коннектор (ChatGPT Custom Actions).

## Возможности
- MCP endpoints `/mcp/ping`, `/mcp/list_tools`, `/mcp/call_tool`.
- Валидация входных параметров для Bitrix24 методов сделок и контактов.
- Готовые Docker/Compose манифесты и Makefile для быстрой разработки.
- CI/CD: lint → test → build, аудит зависимостей, CodeQL и автоматический релиз по тегу.

## Переменные окружения
Создайте файл `.env` на основе `.env.example` и задайте значения:

- `BITRIX_WEBHOOK_URL` — полный URL вебхука Bitrix24 (например, `https://<portal>.bitrix24.ru/rest/<user>/<token>/`).
- `BITRIX_CLIENT_ID`, `BITRIX_CLIENT_SECRET`, `BITRIX_PORTAL_DOMAIN` — опциональные параметры OAuth, если не используете вебхуки.
- `MCP_PORT` — порт локального MCP-сервера (по умолчанию `3000`).
- `NODE_ENV` — окружение выполнения (`development`/`production`).

Секреты не должны попадать в репозиторий; используйте `.env.example` как шаблон.

## Endpoints

### GET /mcp/ping
Проверка доступности MCP-сервера. Возвращает строго `{ "ok": true }`.

### GET /mcp/list_tools
Возвращает список доступных MCP-инструментов с описаниями и схемой параметров:

```json
{
  "tools": [
    {
      "name": "bitrix_get_deal",
      "description": "Получить сделку Bitrix24 по идентификатору.",
      "parameters": {
        "id": { "type": "number", "description": "Числовой ID сделки Bitrix24." }
      }
    }
  ]
}
```

### POST /mcp/call_tool
Выполняет выбранный инструмент Bitrix24. Тело запроса должно быть `application/json`:

```json
{
  "tool": "bitrix_get_deal",
  "args": { "id": 1 }
}
```

Успешный ответ возвращает поле `result` без дополнительных обёрток:

```json
{ "result": { "ID": "1", "TITLE": "Demo" } }
```

Ошибки возвращаются в JSON-формате с корректным HTTP-статусом (400/415 для ошибок клиента, 5xx для внутренних ошибок).

### Поддерживаемые инструменты
- **bitrix_get_deal** — получить сделку по ID (`id: number`).
- **bitrix_create_deal** — создать сделку (`title: string`, `fields?: object`).
- **bitrix_update_deal** — обновить сделку (`id: number`, `fields: object`).
- **bitrix_find_contact** — найти контакт по телефону или email (`phone?: string`, `email?: string`).
- **bitrix_create_contact** — создать контакт (`firstName: string`, `lastName?: string`, `phone?: string`, `email?: string`).
- **bitrix_update_contact** — обновить контакт (`id: number`, `fields: object`).

## Запуск локально

```bash
npm install
npm run dev
```

MCP-сервер будет доступен по адресу `http://localhost:${MCP_PORT}/mcp`.

## Docker и Docker Compose

Собрать продакшн-образ:

```bash
make docker-build
```

Запустить в режиме разработки с hot-reload:

```bash
make docker-up
```

Остановить контейнеры:

```bash
make docker-down
```

## Тестирование и форматирование

```bash
npm run lint
npm test -- --runInBand --coverage
npm run build
```

Husky pre-commit запускает линт и тесты перед коммитом, чтобы предотвратить попадание неформатированного или нерабочего кода.

## CI/CD
- `.github/workflows/ci.yml` — линт, тесты с покрытием и сборка на push/PR.
- `.github/workflows/security.yml` — `npm audit`, CodeQL и генерация SBOM по расписанию.
- `.github/workflows/release.yml` — автоматический релиз по тегам `v*.*.*`.
- `.github/dependabot.yml` — обновление npm и GitHub Actions зависимостей раз в неделю.

## Деплой на Vercel

- Перед деплоем задайте переменные окружения (минимум `BITRIX_WEBHOOK_URL`).
- Vercel маршрутизирует запросы согласно `vercel.json` на функции в `api/mcp/*`.
