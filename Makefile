.PHONY: install lint test build clean docker-build docker-up docker-down

install:
	npm ci

lint:
	npm run lint

test:
	npm test -- --runInBand --coverage

build:
	npm run build

clean:
	rm -rf build coverage node_modules

docker-build:
	docker build -t bitrix24-mcp-proxy .

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down
