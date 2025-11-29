# Bitrix24 MCP Proxy for Vercel

API-прокси для выполнения REST-методов Bitrix24 через MCP-коннектор (ChatGPT Custom Actions).

## Возможности
- MCP endpoints `/mcp/ping`, `/mcp/list_tools`, `/mcp/call_tool`.
- **60 MCP-инструментов** для полной автоматизации CRM Bitrix24.
- Валидация входных параметров для всех методов.
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
      "name": "bitrix_deal_get",
      "description": "Получить сделку Bitrix24 по идентификатору.",
      "parameters": {
        "id": { "type": "number", "description": "ID сделки" }
      }
    }
  ]
}
```

### POST /mcp/call_tool
Выполняет выбранный инструмент Bitrix24. Тело запроса должно быть `application/json`:

```json
{
  "tool": "bitrix_deal_get",
  "args": { "id": 1 }
}
```

Успешный ответ возвращает поле `result` без дополнительных обёрток:

```json
{ "result": { "ID": "1", "TITLE": "Demo" } }
```

Ошибки возвращаются в JSON-формате с корректным HTTP-статусом (400/415 для ошибок клиента, 5xx для внутренних ошибок).

---

## Поддерживаемые инструменты (60 шт.)

### 1. Сделки (crm.deal.*) — 10 методов

| Инструмент | Bitrix API | Описание |
|------------|------------|----------|
| `bitrix_deal_list` | `crm.deal.list` | Получить список сделок с фильтрацией |
| `bitrix_deal_get` | `crm.deal.get` | Получить сделку по ID |
| `bitrix_deal_add` | `crm.deal.add` | Создать новую сделку |
| `bitrix_deal_update` | `crm.deal.update` | Обновить сделку |
| `bitrix_deal_delete` | `crm.deal.delete` | Удалить сделку |
| `bitrix_deal_fields` | `crm.deal.fields` | Получить описание полей сделки |
| `bitrix_deal_category_list` | `crm.dealcategory.list` | Получить список воронок |
| `bitrix_deal_stage_list` | `crm.dealcategory.stage.list` | Получить стадии воронки |
| `bitrix_deal_userfield_list` | `crm.deal.userfield.list` | Получить пользовательские поля сделок |
| `bitrix_deal_userfield_add` | `crm.deal.userfield.add` | Добавить пользовательское поле |

**Примеры использования:**

```json
// Получить список сделок с фильтрацией
{ "tool": "bitrix_deal_list", "args": { "filter": { "STAGE_ID": "WON" }, "select": ["ID", "TITLE"] } }

// Создать сделку
{ "tool": "bitrix_deal_add", "args": { "fields": { "TITLE": "Новая сделка", "OPPORTUNITY": 50000 } } }
```

### 2. Лиды (crm.lead.*) — 8 методов

| Инструмент | Bitrix API | Описание |
|------------|------------|----------|
| `bitrix_lead_list` | `crm.lead.list` | Получить список лидов с фильтрацией |
| `bitrix_lead_get` | `crm.lead.get` | Получить лид по ID |
| `bitrix_lead_add` | `crm.lead.add` | Создать новый лид |
| `bitrix_lead_update` | `crm.lead.update` | Обновить лид |
| `bitrix_lead_delete` | `crm.lead.delete` | Удалить лид |
| `bitrix_lead_fields` | `crm.lead.fields` | Получить описание полей лида |
| `bitrix_lead_convert` | `crm.lead.convert` | Конвертировать лид в сделку/контакт/компанию |
| `bitrix_lead_userfield_list` | `crm.lead.userfield.list` | Получить пользовательские поля лидов |

**Примеры использования:**

```json
// Конвертировать лид
{ "tool": "bitrix_lead_convert", "args": { "id": 123, "createDeal": true, "createContact": true } }
```

### 3. Контакты (crm.contact.*) — 7 методов

| Инструмент | Bitrix API | Описание |
|------------|------------|----------|
| `bitrix_contact_list` | `crm.contact.list` | Получить список контактов |
| `bitrix_contact_get` | `crm.contact.get` | Получить контакт по ID |
| `bitrix_contact_add` | `crm.contact.add` | Создать новый контакт |
| `bitrix_contact_update` | `crm.contact.update` | Обновить контакт |
| `bitrix_contact_delete` | `crm.contact.delete` | Удалить контакт |
| `bitrix_contact_fields` | `crm.contact.fields` | Получить описание полей контакта |
| `bitrix_contact_search_by_phone` | `crm.duplicate.findbycomm` | Найти контакт по телефону |

**Примеры использования:**

```json
// Найти контакт по телефону
{ "tool": "bitrix_contact_search_by_phone", "args": { "phone": "+79001234567" } }

// Создать контакт
{ "tool": "bitrix_contact_add", "args": { "fields": { "NAME": "Иван", "LAST_NAME": "Петров" } } }
```

### 4. Компании (crm.company.*) — 6 методов

| Инструмент | Bitrix API | Описание |
|------------|------------|----------|
| `bitrix_company_list` | `crm.company.list` | Получить список компаний |
| `bitrix_company_get` | `crm.company.get` | Получить компанию по ID |
| `bitrix_company_add` | `crm.company.add` | Создать новую компанию |
| `bitrix_company_update` | `crm.company.update` | Обновить компанию |
| `bitrix_company_delete` | `crm.company.delete` | Удалить компанию |
| `bitrix_company_fields` | `crm.company.fields` | Получить описание полей компании |

### 5. Универсальный CRM API / Смарт-процессы (crm.item.*) — 8 методов

| Инструмент | Bitrix API | Описание |
|------------|------------|----------|
| `bitrix_item_list` | `crm.item.list` | Получить элементы смарт-процесса |
| `bitrix_item_get` | `crm.item.get` | Получить элемент по ID |
| `bitrix_item_add` | `crm.item.add` | Создать элемент смарт-процесса |
| `bitrix_item_update` | `crm.item.update` | Обновить элемент |
| `bitrix_item_delete` | `crm.item.delete` | Удалить элемент |
| `bitrix_item_fields` | `crm.item.fields` | Получить поля смарт-процесса |
| `bitrix_item_type_list` | `crm.type.list` | Получить список смарт-процессов |
| `bitrix_item_type_get` | `crm.type.get` | Получить смарт-процесс по ID |

**Примеры использования:**

```json
// Получить элементы смарт-процесса
{ "tool": "bitrix_item_list", "args": { "entityTypeId": 128, "filter": { "stageId": "D128_1:NEW" } } }
```

### 6. Активности (crm.activity.*) — 6 методов

| Инструмент | Bitrix API | Описание |
|------------|------------|----------|
| `bitrix_activity_list` | `crm.activity.list` | Получить список активностей |
| `bitrix_activity_get` | `crm.activity.get` | Получить активность по ID |
| `bitrix_activity_add` | `crm.activity.add` | Создать активность (звонок, встреча, задача) |
| `bitrix_activity_update` | `crm.activity.update` | Обновить активность |
| `bitrix_activity_delete` | `crm.activity.delete` | Удалить активность |
| `bitrix_activity_fields` | `crm.activity.fields` | Получить описание полей активности |

### 7. Задачи (tasks.task.*) — 5 методов

| Инструмент | Bitrix API | Описание |
|------------|------------|----------|
| `bitrix_task_list` | `tasks.task.list` | Получить список задач |
| `bitrix_task_get` | `tasks.task.get` | Получить задачу по ID |
| `bitrix_task_add` | `tasks.task.add` | Создать новую задачу |
| `bitrix_task_update` | `tasks.task.update` | Обновить задачу |
| `bitrix_task_close` | `tasks.task.complete` | Завершить задачу |

**Примеры использования:**

```json
// Создать задачу
{ "tool": "bitrix_task_add", "args": { "fields": { "TITLE": "Позвонить клиенту", "RESPONSIBLE_ID": 1 } } }
```

### 8. Пользователи (user.*) — 4 метода

| Инструмент | Bitrix API | Описание |
|------------|------------|----------|
| `bitrix_user_list` | `user.get` | Получить список пользователей |
| `bitrix_user_get` | `user.get` | Получить пользователя по ID |
| `bitrix_user_search` | `user.search` | Поиск пользователей |
| `bitrix_user_current` | `user.current` | Получить текущего пользователя |

### 9. Прочие методы — 6 инструментов

| Инструмент | Bitrix API | Описание |
|------------|------------|----------|
| `bitrix_timeline_comment_add` | `crm.timeline.comment.add` | Добавить комментарий в timeline |
| `bitrix_batch` | `batch` | Выполнить пакет запросов |
| `bitrix_telephony_call_list` | `voximplant.statistic.get` | Получить список звонков |
| `bitrix_im_message_add` | `im.message.add` | Отправить сообщение в чат |
| `bitrix_crm_status_list` | `crm.status.list` | Получить справочники CRM |
| `bitrix_webhook_status` | `app.info` | Проверить статус webhook |

**Примеры использования:**

```json
// Добавить комментарий к сделке
{ "tool": "bitrix_timeline_comment_add", "args": { "entityType": "deal", "entityId": 123, "comment": "Клиент перезвонит завтра" } }

// Пакетный запрос
{ "tool": "bitrix_batch", "args": { "cmd": { "deal": "crm.deal.get?id=1", "contact": "crm.contact.get?id=2" } } }

// Отправить сообщение в чат
{ "tool": "bitrix_im_message_add", "args": { "dialogId": "chat123", "message": "Привет!" } }
```

---

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
