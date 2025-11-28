.PHONY: help install dev build lint test docker-build docker-run clean

# Default target
help:
	@echo "Bitrix24 MCP Proxy - Makefile Commands"
	@echo ""
	@echo "Usage:"
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Start development server"
	@echo "  make build        - Build TypeScript"
	@echo "  make lint         - Run linter"
	@echo "  make lint-fix     - Run linter with auto-fix"
	@echo "  make test         - Run tests"
	@echo "  make docker-build - Build Docker image"
	@echo "  make docker-run   - Run Docker container"
	@echo "  make clean        - Clean build artifacts"
	@echo ""

# Install dependencies
install:
	npm ci

# Development server
dev:
	npm run dev

# Build TypeScript
build:
	npm run build

# Lint code
lint:
	npm run lint

# Lint and fix
lint-fix:
	npm run lint:fix

# Run tests
test:
	npm test

# Build Docker image
docker-build:
	docker build -t bitrix24-mcp-proxy:latest .

# Run Docker container
docker-run:
	docker-compose up -d

# Stop Docker container
docker-stop:
	docker-compose down

# Clean build artifacts
clean:
	rm -rf dist coverage node_modules/.cache
