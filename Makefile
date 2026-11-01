.PHONY: install run test test-unit test-integration test-cov lint db-upgrade db-migration db-current help docker-up docker-down docker-build docker-logs docker-restart \
	frontend-install frontend-dev frontend-lint frontend-format frontend-check frontend-test frontend-test-e2e frontend-build check-all

BACKEND_DIR = backend
FRONTEND_DIR = frontend
POETRY = poetry
NPM = npm --prefix $(FRONTEND_DIR)

install:
	cd $(BACKEND_DIR) && $(POETRY) install

run:
	cd $(BACKEND_DIR) && $(POETRY) run uvicorn app.main:app --reload

test:
	cd $(BACKEND_DIR) && $(POETRY) run pytest -v

test-unit:
	cd $(BACKEND_DIR) && $(POETRY) run pytest -v tests/unit

test-integration:
	cd $(BACKEND_DIR) && $(POETRY) run pytest -v tests/integration

test-cov:
	cd $(BACKEND_DIR) && $(POETRY) run pytest -v --cov=. --cov-report=term-missing

lint:
	cd $(BACKEND_DIR) && $(POETRY) run ruff check .

db-upgrade:
	cd $(BACKEND_DIR) && $(POETRY) run alembic upgrade head

db-migration:
	cd $(BACKEND_DIR) && $(POETRY) run alembic revision --autogenerate -m "$(msg)"

db-current:
	cd $(BACKEND_DIR) && $(POETRY) run alembic current

frontend-install:
	$(NPM) ci

frontend-dev:
	$(NPM) run dev

frontend-lint:
	$(NPM) run lint

frontend-format:
	$(NPM) run format

frontend-check:
	$(NPM) run lint && $(NPM) run format:check

frontend-test:
	$(NPM) run test

frontend-test-e2e:
	$(NPM) run test:e2e

frontend-build:
	$(NPM) run build

check-all: lint test frontend-check frontend-test frontend-build frontend-test-e2e

docker-build:
	docker compose build

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

docker-restart:
	docker compose down && docker compose up -d --build

help:
	@echo "Comandos disponiveis:"
	@echo "  make install        - instala as dependencias"
	@echo "  make run            - roda a aplicacao localmente"
	@echo "  make test           - roda todos os testes"
	@echo "  make test-unit      - roda somente os testes unitarios"
	@echo "  make test-integration - roda somente os testes de integracao"
	@echo "  make test-cov       - roda os testes com relatorio de cobertura"
	@echo "  make lint           - roda o ruff"
	@echo "  make db-upgrade     - aplica as migrations pendentes"
	@echo "  make db-migration msg=\"...\" - gera uma nova migration (autogenerate)"
	@echo "  make db-current     - mostra a revisao atual do banco"
	@echo "  make frontend-install  - instala as dependencias do frontend (npm ci)"
	@echo "  make frontend-dev      - servidor de desenvolvimento (Vite)"
	@echo "  make frontend-lint     - biome lint"
	@echo "  make frontend-format   - biome format --write"
	@echo "  make frontend-check    - lint + formatacao sem alterar arquivos"
	@echo "  make frontend-test     - testes unitarios e de integracao (Vitest)"
	@echo "  make frontend-test-e2e - testes E2E (Playwright)"
	@echo "  make frontend-build    - build de producao"
	@echo "  make check-all         - backend (Ruff + Pytest) + frontend (Biome, Vitest, build, E2E)"
	@echo "  make docker-build   - builda as imagens docker"
	@echo "  make docker-up      - sobe os containers em background"
	@echo "  make docker-down    - derruba os containers"
	@echo "  make docker-logs    - mostra os logs dos containers"
	@echo "  make docker-restart - reconstroi e reinicia os containers"