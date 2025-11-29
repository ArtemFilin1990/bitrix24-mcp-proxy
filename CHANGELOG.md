# Changelog

Все заметные изменения в этом проекте будут задокументированы в этом файле.

## [Unreleased]
### Added
- Полные описания MCP-инструментов в эндпоинте `list_tools` и строгие типы параметров.
- Dockerfile с многостадийной сборкой и docker-compose для локальной разработки.
- Makefile с командами для сборки, тестов и контейнеризации.
- Базовые файлы проекта: `.editorconfig`, `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `CODEOWNERS`.
- CI/CD workflows для lint/test/build, аудита зависимостей, CodeQL и релизов.
- Конфигурация Dependabot.

### Changed
- Шаблон `.env.example` и README с актуальными инструкциями по окружению и контейнеризации.
- OpenAPI-описание `list_tools` с полными определениями инструментов.
