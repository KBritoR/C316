.PHONY: install run test test-unit test-integration test-cov lint format db-up db-upgrade db-migration db-current \
	up-build down ps logs-api docker-up docker-down docker-build docker-logs docker-restart \
	frontend-install frontend-dev frontend-lint frontend-format frontend-check frontend-test frontend-test-e2e frontend-build \
	e2e check-all help

BACKEND_DIR = backend
FRONTEND_DIR = frontend
POETRY = poetry
NPM = npm --prefix $(FRONTEND_DIR)

# Stack isolada do E2E: outro projeto Compose, outras portas e volume proprio,
# para nao mexer no banco de desenvolvimento.
E2E_PROJECT = lab-e2e
E2E_API_PORT = 8001
E2E_FRONTEND_PORT = 5174
E2E_DB_PORT = 5433
E2E_COMPOSE = API_PORT=$(E2E_API_PORT) FRONTEND_PORT=$(E2E_FRONTEND_PORT) DB_PORT=$(E2E_DB_PORT) \
	docker compose -p $(E2E_PROJECT)

# ---------- Backend ----------

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

format:
	cd $(BACKEND_DIR) && $(POETRY) run ruff format .

db-up:
	docker compose up -d --wait db

db-upgrade:
	cd $(BACKEND_DIR) && $(POETRY) run alembic upgrade head

db-migration:
	cd $(BACKEND_DIR) && $(POETRY) run alembic revision --autogenerate -m "$(msg)"

db-current:
	cd $(BACKEND_DIR) && $(POETRY) run alembic current

# ---------- Docker (db + api + frontend) ----------

up-build:
	docker compose up -d --build --wait --remove-orphans

down:
	docker compose down

ps:
	docker compose ps

logs-api:
	docker compose logs -f api

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

# ---------- Frontend ----------

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

# ---------- Full-stack ----------

# Sobe a stack isolada (as migrations rodam no start da api), roda o Playwright
# e sempre derruba tudo com -v no final, mesmo se os testes falharem.
e2e:
	$(E2E_COMPOSE) up -d --build --wait && \
	E2E_BASE_URL=http://localhost:$(E2E_FRONTEND_PORT) $(NPM) run test:e2e; \
	status=$$?; $(E2E_COMPOSE) down -v; exit $$status

check-all: lint db-up db-upgrade test frontend-check frontend-test frontend-build e2e

help:
	@echo "Comandos disponiveis:"
	@echo "  make install           - instala as dependencias do backend"
	@echo "  make run               - roda a api localmente"
	@echo "  make test              - testes do backend (precisa do Postgres: make db-up)"
	@echo "  make test-unit         - so os testes unitarios do backend"
	@echo "  make test-integration  - so os testes de integracao do backend"
	@echo "  make test-cov          - testes do backend com cobertura"
	@echo "  make lint              - ruff check"
	@echo "  make format            - ruff format"
	@echo "  make db-up             - sobe so o Postgres"
	@echo "  make db-upgrade        - aplica as migrations pendentes"
	@echo "  make db-migration msg=\"...\" - gera uma nova migration (autogenerate)"
	@echo "  make db-current        - mostra a revisao atual do banco"
	@echo "  make up-build          - sobe db, api e frontend (espera todos ficarem healthy)"
	@echo "  make down              - derruba db, api e frontend"
	@echo "  make ps                - status dos containers"
	@echo "  make logs-api          - logs da api"
	@echo "  make frontend-install  - npm ci"
	@echo "  make frontend-dev      - servidor de desenvolvimento (Vite)"
	@echo "  make frontend-lint     - biome lint"
	@echo "  make frontend-format   - biome format --write"
	@echo "  make frontend-check    - lint + formatacao sem alterar arquivos"
	@echo "  make frontend-test     - Vitest (unitarios e integracao)"
	@echo "  make frontend-test-e2e - Playwright contra uma stack ja no ar (E2E_BASE_URL)"
	@echo "  make frontend-build    - build de producao"
	@echo "  make e2e               - E2E full-stack em stack isolada (lab-e2e), derruba tudo no final"
	@echo "  make check-all         - backend (Ruff + Pytest) + frontend (Biome, Vitest, build) + e2e"
