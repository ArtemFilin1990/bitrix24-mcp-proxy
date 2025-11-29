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
    {
      "name": "bitrix_get_deal",
      "description": "Получить сделку Bitrix24 по идентификатору.",
      "parameters": {
        "id": { "type": "number", "description": "Числовой ID сделки Bitrix24." }
      }
    },
    {
      "name": "bitrix_create_deal",
      "description": "Создать новую сделку Bitrix24 с обязательным заголовком и дополнительными полями.",
      "parameters": {
        "title": { "type": "string", "description": "Название сделки." },
        "fields": {
          "type": "object",
          "description": "Дополнительные поля сделки (например, COMMENTS, OPPORTUNITY).",
          "additionalProperties": true
        }
      }
    }
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

Response:
Возвращает поле `result` с оригинальным ответом Bitrix24 или ошибку с пояснением.

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
