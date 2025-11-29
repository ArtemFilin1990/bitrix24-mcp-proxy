# Bitrix24 MCP Proxy for Vercel

API-прокси для выполнения REST-методов Bitrix24 через MCP-коннектор (ChatGPT Custom Actions).

## Возможности
- MCP endpoints `/mcp/ping`, `/mcp/list_tools`, `/mcp/call_tool`.
- **54+ инструментов** для работы с CRM Bitrix24: сделки, лиды, контакты, компании, задачи, активности, пользователи.
- Валидация входных параметров для всех Bitrix24 методов.
- Rate limiting (2 запроса/сек) для соблюдения лимитов API Bitrix24.
- Модульная архитектура для легкого расширения.
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

## Доступные инструменты

### Сделки (Deals)
| Инструмент | Описание |
|------------|----------|
| `bitrix_get_deal` | Получить сделку по ID |
| `bitrix_create_deal` | Создать новую сделку |
| `bitrix_update_deal` | Обновить сделку |
| `bitrix_search_deals` | Поиск сделок по фильтру |
| `bitrix_list_deals` | Список сделок с полной фильтрацией и пагинацией |
| `bitrix_get_deal_categories` | Получить список воронок продаж |
| `bitrix_get_deal_stages` | Получить стадии сделок для воронки |
| `bitrix_filter_deals_by_pipeline` | Фильтрация сделок по воронке |
| `bitrix_filter_deals_by_budget` | Фильтрация сделок по бюджету |
| `bitrix_filter_deals_by_status` | Фильтрация сделок по статусу |
| `bitrix_get_latest_deals` | Получить последние сделки |
| `bitrix_get_deal_fields` | Получить поля сделки |

### Лиды (Leads)
| Инструмент | Описание |
|------------|----------|
| `bitrix_get_lead` | Получить лид по ID |
| `bitrix_create_lead` | Создать новый лид |
| `bitrix_update_lead` | Обновить лид |
| `bitrix_list_leads` | Список лидов с фильтрацией |
| `bitrix_search_leads` | Поиск лидов по фильтру |
| `bitrix_get_lead_statuses` | Получить статусы лидов |
| `bitrix_get_latest_leads` | Получить последние лиды |
| `bitrix_get_leads_from_date_range` | Лиды за указанный период |
| `bitrix_get_lead_fields` | Получить поля лида |

### Контакты (Contacts)
| Инструмент | Описание |
|------------|----------|
| `bitrix_get_contact` | Получить контакт по ID |
| `bitrix_find_contact` | Найти контакт по телефону/email |
| `bitrix_create_contact` | Создать новый контакт |
| `bitrix_update_contact` | Обновить контакт |
| `bitrix_list_contacts` | Список контактов с фильтрацией |
| `bitrix_search_contacts` | Поиск контактов по имени/телефону/email |
| `bitrix_get_contact_fields` | Получить поля контакта |

### Компании (Companies)
| Инструмент | Описание |
|------------|----------|
| `bitrix_get_company` | Получить компанию по ID |
| `bitrix_create_company` | Создать новую компанию |
| `bitrix_update_company` | Обновить компанию |
| `bitrix_list_companies` | Список компаний с фильтрацией |
| `bitrix_search_companies` | Поиск компаний |
| `bitrix_get_latest_companies` | Получить последние компании |
| `bitrix_get_company_fields` | Получить поля компании |

### Задачи (Tasks)
| Инструмент | Описание |
|------------|----------|
| `bitrix_create_task` | Создать задачу |
| `bitrix_get_task` | Получить задачу по ID |
| `bitrix_update_task` | Обновить задачу |
| `bitrix_list_tasks` | Список задач с фильтрацией |
| `bitrix_get_task_comments` | Получить комментарии к задаче |
| `bitrix_add_task_comment` | Добавить комментарий к задаче |
| `bitrix_get_task_checklist` | Получить чеклист задачи |

### Активности (Activities)
| Инструмент | Описание |
|------------|----------|
| `bitrix_create_activity` | Создать активность (звонок, встреча и т.д.) |
| `bitrix_get_activity` | Получить активность по ID |
| `bitrix_list_activities` | Список активностей |
| `bitrix_update_activity` | Обновить активность |
| `bitrix_complete_activity` | Завершить активность |

### Пользователи (Users)
| Инструмент | Описание |
|------------|----------|
| `bitrix_list_users` | Список пользователей |
| `bitrix_get_user` | Получить пользователя по ID |
| `bitrix_get_current_user` | Получить текущего пользователя |
| `bitrix_get_user_activity` | Получить активности пользователя за период |

### Timeline и комментарии
| Инструмент | Описание |
|------------|----------|
| `bitrix_add_comment` | Добавить комментарий к сущности |
| `bitrix_get_timeline` | Получить таймлайн сущности |
| `bitrix_add_timeline_comment` | Добавить комментарий в таймлайн (расширенная версия) |

### Статусы и поля CRM
| Инструмент | Описание |
|------------|----------|
| `bitrix_get_status_list` | Получить список статусов CRM |

### Телефония
| Инструмент | Описание |
|------------|----------|
| `bitrix_get_call_statistics` | Статистика звонков за период |

### Файлы
| Инструмент | Описание |
|------------|----------|
| `bitrix_get_file` | Получить информацию о файле |
| `bitrix_upload_file` | Загрузить файл на диск |

### Диагностика и утилиты
| Инструмент | Описание |
|------------|----------|
| `bitrix_validate_webhook` | Проверка подключения webhook |
| `bitrix_diagnose_permissions` | Диагностика прав доступа |
| `bitrix_check_crm_settings` | Проверка настроек CRM |
| `bitrix_get_crm_summary` | Сводная информация о CRM |

## Архитектура

Инструменты организованы в модульную структуру:

```
src/mcp/tools/
├── index.ts       # Главный экспорт всех инструментов
├── types.ts       # TypeScript интерфейсы
├── helpers.ts     # Вспомогательные функции валидации
├── deals.ts       # Инструменты для сделок
├── leads.ts       # Инструменты для лидов
├── contacts.ts    # Инструменты для контактов
├── companies.ts   # Инструменты для компаний
├── tasks.ts       # Инструменты для задач
├── activities.ts  # Инструменты для активностей
├── users.ts       # Инструменты для пользователей
└── utils.ts       # Утилиты и диагностика
```

## Пример использования с ChatGPT

Запрос пользователя:
> Найди клиента +79995553311, создай сделку на 50 000 и добавь комментарий "Готовы начать"

GPT вызывает:
1. `bitrix_find_contact` → находит контакт
2. `bitrix_create_deal` → создаёт сделку
3. `bitrix_add_comment` → добавляет комментарий

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
