# Bitrix24 MCP Proxy for Vercel

API-прокси для выполнения REST-методов Bitrix24 через MCP-коннектор (ChatGPT Custom Actions).

## Возможности
- MCP endpoints `/mcp/ping`, `/mcp/list_tools`, `/mcp/call_tool`.
- **60 MCP-инструментов** для работы с Bitrix24 CRM.
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

## Доступные инструменты (60)

### Сделки — 10 инструментов
| Инструмент | Описание |
|------------|----------|
| `bitrix_deal_list` | Получить список сделок с фильтрацией, сортировкой и выборкой полей |
| `bitrix_deal_get` | Получить сделку по ID |
| `bitrix_deal_add` | Создать новую сделку |
| `bitrix_deal_update` | Обновить сделку |
| `bitrix_deal_delete` | Удалить сделку |
| `bitrix_deal_fields` | Получить описание полей сделки |
| `bitrix_deal_category_list` | Получить список воронок (направлений) |
| `bitrix_deal_stage_list` | Получить стадии воронки |
| `bitrix_deal_userfield_list` | Получить пользовательские поля |
| `bitrix_deal_userfield_add` | Добавить пользовательское поле |

### Лиды — 8 инструментов
| Инструмент | Описание |
|------------|----------|
| `bitrix_lead_list` | Получить список лидов |
| `bitrix_lead_get` | Получить лид по ID |
| `bitrix_lead_add` | Создать новый лид |
| `bitrix_lead_update` | Обновить лид |
| `bitrix_lead_delete` | Удалить лид |
| `bitrix_lead_fields` | Получить описание полей лида |
| `bitrix_lead_convert` | Конвертировать лид в сделку/контакт/компанию |
| `bitrix_lead_userfield_list` | Получить пользовательские поля |

### Контакты — 7 инструментов
| Инструмент | Описание |
|------------|----------|
| `bitrix_contact_list` | Получить список контактов |
| `bitrix_contact_get` | Получить контакт по ID |
| `bitrix_contact_add` | Создать новый контакт |
| `bitrix_contact_update` | Обновить контакт |
| `bitrix_contact_delete` | Удалить контакт |
| `bitrix_contact_fields` | Получить описание полей контакта |
| `bitrix_contact_search_by_phone` | Найти контакт по номеру телефона |

### Компании — 6 инструментов
| Инструмент | Описание |
|------------|----------|
| `bitrix_company_list` | Получить список компаний |
| `bitrix_company_get` | Получить компанию по ID |
| `bitrix_company_add` | Создать новую компанию |
| `bitrix_company_update` | Обновить компанию |
| `bitrix_company_delete` | Удалить компанию |
| `bitrix_company_fields` | Получить описание полей компании |

### Смарт-процессы (Items) — 8 инструментов
| Инструмент | Описание |
|------------|----------|
| `bitrix_item_list` | Получить элементы смарт-процесса |
| `bitrix_item_get` | Получить элемент по ID |
| `bitrix_item_add` | Создать элемент |
| `bitrix_item_update` | Обновить элемент |
| `bitrix_item_delete` | Удалить элемент |
| `bitrix_item_fields` | Получить поля смарт-процесса |
| `bitrix_item_type_list` | Получить список смарт-процессов |
| `bitrix_item_type_get` | Получить смарт-процесс по ID |

### Активности — 6 инструментов
| Инструмент | Описание |
|------------|----------|
| `bitrix_activity_list` | Получить список активностей |
| `bitrix_activity_get` | Получить активность по ID |
| `bitrix_activity_add` | Создать активность |
| `bitrix_activity_update` | Обновить активность |
| `bitrix_activity_delete` | Удалить активность |
| `bitrix_activity_fields` | Получить описание полей активности |

### Задачи — 5 инструментов
| Инструмент | Описание |
|------------|----------|
| `bitrix_task_list` | Получить список задач |
| `bitrix_task_get` | Получить задачу по ID |
| `bitrix_task_add` | Создать новую задачу |
| `bitrix_task_update` | Обновить задачу |
| `bitrix_task_close` | Завершить задачу |

### Пользователи — 4 инструмента
| Инструмент | Описание |
|------------|----------|
| `bitrix_user_list` | Получить список пользователей |
| `bitrix_user_get` | Получить пользователя по ID |
| `bitrix_user_search` | Поиск пользователей |
| `bitrix_user_current` | Получить текущего пользователя |

### Дополнительные — 6 инструментов
| Инструмент | Описание |
|------------|----------|
| `bitrix_timeline_comment_add` | Добавить комментарий в timeline |
| `bitrix_batch` | Выполнить пакетный запрос (до 50 команд) |
| `bitrix_telephony_call_list` | Получить статистику звонков |
| `bitrix_im_message_add` | Отправить сообщение в чат |
| `bitrix_crm_status_list` | Получить справочники CRM |
| `bitrix_webhook_status` | Проверить статус webhook |

## Пример использования с ChatGPT

Запрос пользователя:
> Найди клиента +79995553311, создай сделку на 50 000 и добавь комментарий "Готовы начать"

GPT вызывает:
1. `bitrix_contact_search_by_phone` → находит контакт
2. `bitrix_deal_add` → создаёт сделку
3. `bitrix_timeline_comment_add` → добавляет комментарий

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
