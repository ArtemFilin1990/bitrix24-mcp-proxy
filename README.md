Bitrix24 MCP Proxy for Vercel

API-proxy для выполнения REST-методов Bitrix24 через MCP-коннектор (ChatGPT Custom Actions).

Endpoints

GET /servers

Возвращает список MCP-серверов.

Response:

{
  "servers": [
    {
      "name": "bitrix24-mcp",
      "description": "MCP Proxy for Bitrix24",
      "url": "https://bitrix24-mcp-proxy.vercel.app/mcp"
    }
  ]
}

GET /mcp/ping

Проверка доступности MCP-сервера. Возвращает `{ "ok": true }`.

GET /mcp/list_tools

Возвращает список инструментов MCP в формате, ожидаемом ChatGPT.

Response:
{
  "tools": [
    "bitrix_get_deal",
    "bitrix_create_deal",
    "bitrix_update_deal",
    "bitrix_find_contact",
    "bitrix_add_deal_comment",
    "bitrix_trigger_automation"
  ]
}

POST /mcp/call_tool

Выполняет вызов инструмента Bitrix24.

Body:
{
  "tool": "bitrix_get_deal",
  "args": { "id": 1 }
}

или

{
  "tool": "bitrix_create_deal",
  "args": { "title": "New Deal", "fields": { "COMMENTS": "Комментарий" } }
}

или

{
  "tool": "bitrix_update_deal",
  "args": { "id": 123, "fields": { "STAGE_ID": "WON" } }
}

или

{
  "tool": "bitrix_find_contact",
  "args": { "phone": "+79990001122" }
}

или

{
  "tool": "bitrix_add_deal_comment",
  "args": { "id": 5012, "comment": "Позвонили клиенту" }
}

или

{
  "tool": "bitrix_trigger_automation",
  "args": { "code": "AUTO_STAGE", "entityType": "DEAL", "entityId": 5012 }
}

Response:
Возвращает поле `result` с оригинальным ответом Bitrix24 или ошибку с пояснением.

Ошибки приходят в формате:
{
  "error": {
    "message": "Parameter \"id\" must be a positive number",
    "code": "BAD_REQUEST"
  }
}

Требуется заголовок `Content-Type: application/json`.

Environment variables

Создайте файл `.env` на основе примера ниже.

```
BITRIX_WEBHOOK_URL=https://your-portal.bitrix24.ru/rest/1/token
MCP_PORT=3000
NODE_ENV=development
```

`BITRIX_WEBHOOK_URL` обязателен: это полный webhook URL для Bitrix24 (с ключом). Остальные переменные используются для локального запуска и не должны коммититься в репозиторий.

OpenAPI Specification

Файл:

openapi.json

Используется для ChatGPT Custom Actions.

Деплой на Vercel

1. Создать GitHub репозиторий.
2. Залить файлы проекта.
3. Развернуть через https://vercel.com/new.
4. Использовать URL:

https://PROJECT.vercel.app/servers

Структура проекта

/
├── api/
│   ├── mcp/
│   │   ├── bitrix.js
│   │   ├── call_tool.js
│   │   ├── errors.js
│   │   ├── list_tools.js
│   │   ├── ping.js
│   │   └── tools.js
│   └── servers.js
├── openapi.json
├── vercel.json
├── package.json
├── README.md

Защита (опционально)

При включенной Vercel Authentication использовать заголовок:

x-vercel-protection-bypass: YOUR_TOKEN
