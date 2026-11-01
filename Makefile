.PHONY: dev test test-backend test-web e2e storybook lint build clean

dev:
	docker-compose up --build

test: test-backend test-web

test-backend:
	cd backend && ./gradlew test

test-web:
	cd web && npm test -- --run

e2e:
	cd web && npx playwright test

storybook:
	cd web && npm run storybook

lint:
	cd backend && ./gradlew detektMain
	cd web && npm run lint && npm run typecheck

build:
	cd backend && ./gradlew bootJar
	docker build -t founderbridge-backend ./backend
	docker build -t founderbridge-web ./web

clean:
	cd backend && ./gradlew clean
	cd web && rm -rf .next node_modules/.cache
