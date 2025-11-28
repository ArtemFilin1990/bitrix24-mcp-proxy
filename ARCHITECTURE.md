# Архитектура проекта

## 1. Назначение
Node.js + TypeScript сервер, предоставляющий MCP-endpoint для ChatGPT и интеграцию с Bitrix24.

## 2. Основные директории
- `src/server.ts` — MCP сервер
- `src/bitrix/` — Bitrix24 API client
- `src/tools/` — инструменты, которые вызываются через MCP
- `src/utils/` — вспомогательные функции
- `build/` — компилированный код

## 3. MCP API
Сервер предоставляет:
- `/mcp/list_tools`
- `/mcp/call_tool`
- `/mcp/ping`

Формат — JSON-RPC.

## 4. Bitrix24 API
REST client вызывает методы:
- `crm.deal.get/add/update`
- `crm.contact.get`
- `crm.company.get`
