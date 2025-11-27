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

POST /mcp

Выполняет вызов метода Bitrix24 через прокси.

Body:

{
  "webhook": "https://example.bitrix24.ru/rest/1/KEY/",
  "method": "crm.deal.list",
  "params": {
    "select": ["ID", "TITLE"],
    "filter": { "STAGE_ID": "NEW" }
  }
}

Response:
Возвращает оригинальный ответ Bitrix24.

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
│   ├── mcp.js
│   └── servers.js
├── openapi.json
├── vercel.json
├── package.json
└── README.md

Защита (опционально)

При включенной Vercel Authentication использовать заголовок:

x-vercel-protection-bypass: YOUR_TOKEN
