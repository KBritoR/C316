.PHONY: install run test test-unit test-integration lint format format-check \
	db-up db-upgrade db-downgrade db-migration db-current db-history \
	up-build up down ps logs logs-api logs-frontend \
	frontend-install frontend-dev frontend-lint frontend-format frontend-format-check \
	frontend-check frontend-test frontend-build frontend-test-e2e e2e check-all help

BACKEND_DIR = backend
FRONTEND_DIR = frontend
POETRY = poetry
# "python -m" em vez dos executaveis do Poetry: funciona igual em qualquer sistema
# e evita bloqueio do Windows (Device Guard) aos .exe gerados no ambiente virtual.
PY = $(POETRY) run python -m
NPM = npm --prefix $(FRONTEND_DIR)

# Stack isolada do E2E: outro projeto Compose, outras portas e volume proprio,
# para o teste nunca mexer no banco de desenvolvimento.
E2E_PROJETO = estoque-e2e
E2E_API_PORT = 8001
E2E_FRONTEND_PORT = 5174
E2E_DB_PORT = 5433
E2E_COMPOSE = API_PORT=$(E2E_API_PORT) FRONTEND_PORT=$(E2E_FRONTEND_PORT) DB_PORT=$(E2E_DB_PORT) \
	CORS_ORIGINS=http://localhost:$(E2E_FRONTEND_PORT) VITE_API_URL=http://localhost:$(E2E_API_PORT) \
	docker compose -p $(E2E_PROJETO)

# ---------- Backend (local) ----------

install:
	cd $(BACKEND_DIR) && $(POETRY) install

run:
	cd $(BACKEND_DIR) && $(PY) uvicorn app.main:app --reload

# Os testes de integracao precisam do PostgreSQL: o db-up garante que ele esteja de pe.
test: db-up
	cd $(BACKEND_DIR) && $(PY) pytest -v

test-unit:
	cd $(BACKEND_DIR) && $(PY) pytest -v tests/unit

test-integration: db-up
	cd $(BACKEND_DIR) && $(PY) pytest -v tests/integration

lint:
	cd $(BACKEND_DIR) && $(PY) ruff check .

format:
	cd $(BACKEND_DIR) && $(PY) ruff format .

format-check:
	cd $(BACKEND_DIR) && $(PY) ruff format --check .

# ---------- Banco de dados (Alembic) ----------

db-up:
	docker compose up -d --wait db

db-upgrade:
	cd $(BACKEND_DIR) && $(PY) alembic upgrade head

db-downgrade:
	cd $(BACKEND_DIR) && $(PY) alembic downgrade -1

db-migration:
	cd $(BACKEND_DIR) && $(PY) alembic revision --autogenerate -m "$(msg)"

db-current:
	cd $(BACKEND_DIR) && $(PY) alembic current

db-history:
	cd $(BACKEND_DIR) && $(PY) alembic history

# ---------- Docker Compose (db + api + frontend) ----------

up-build:
	docker compose up -d --build --wait

up:
	docker compose up -d --wait

down:
	docker compose down

ps:
	docker compose ps

logs:
	docker compose logs -f

logs-api:
	docker compose logs -f api

logs-frontend:
	docker compose logs -f frontend

# ---------- Frontend (React + Vite) ----------

frontend-install:
	$(NPM) ci

frontend-dev:
	$(NPM) run dev

frontend-lint:
	$(NPM) run lint

frontend-format:
	$(NPM) run format

frontend-format-check:
	$(NPM) run format:check

frontend-check:
	$(NPM) run lint && $(NPM) run format:check

frontend-test:
	$(NPM) run test

frontend-build:
	$(NPM) run build

# Playwright contra uma stack que ja esta no ar (padrao: http://localhost:5173).
frontend-test-e2e:
	$(NPM) run test:e2e

# ---------- Testes de ponta a ponta e verificacao completa ----------

# Sobe a stack isolada (a API aplica as migrations ao iniciar), roda o Playwright
# e sempre derruba tudo com -v no final, mesmo se algum teste falhar.
e2e:
	$(E2E_COMPOSE) up -d --build --wait && \
	E2E_BASE_URL=http://localhost:$(E2E_FRONTEND_PORT) $(NPM) run test:e2e; \
	status=$$?; $(E2E_COMPOSE) down -v; exit $$status

# Tudo num comando so: backend (Ruff + Pytest) + frontend (Biome + Vitest + build) + E2E.
check-all: lint format-check test frontend-check frontend-test frontend-build e2e

help:
	@echo "Comandos disponiveis:"
	@echo "  make install          - instala as dependencias do backend (Poetry)"
	@echo "  make run              - roda a API localmente em http://localhost:8000"
	@echo "  make test             - sobe o banco e roda todos os testes do backend"
	@echo "  make test-unit        - roda so os testes unitarios (nao precisa de banco)"
	@echo "  make test-integration - sobe o banco e roda so os testes de integracao"
	@echo "  make lint             - verifica o codigo com o Ruff"
	@echo "  make format           - formata o codigo com o Ruff"
	@echo "  make format-check     - verifica a formatacao sem alterar arquivos"
	@echo "  make db-up            - sobe so o PostgreSQL"
	@echo "  make db-upgrade       - aplica as migrations pendentes"
	@echo "  make db-downgrade     - desfaz a ultima migration"
	@echo "  make db-migration msg=\"descricao\" - gera uma migration a partir dos models"
	@echo "  make db-current       - mostra a revisao atual do banco"
	@echo "  make db-history       - mostra o historico de migrations"
	@echo "  make up-build         - builda e sobe db + api + frontend (aplica as migrations)"
	@echo "  make up               - sobe db + api + frontend sem rebuildar"
	@echo "  make down             - derruba os containers (os dados ficam no volume)"
	@echo "  make ps               - mostra o status dos containers"
	@echo "  make logs             - acompanha os logs de todos os servicos"
	@echo "  make logs-api         - acompanha os logs da API"
	@echo "  make logs-frontend    - acompanha os logs do frontend"
	@echo "  make frontend-install - instala as dependencias do frontend (npm ci)"
	@echo "  make frontend-dev     - roda o frontend em http://localhost:5173 (Vite)"
	@echo "  make frontend-lint    - verifica o codigo do frontend com o Biome"
	@echo "  make frontend-format  - formata o codigo do frontend com o Biome"
	@echo "  make frontend-format-check - verifica a formatacao do frontend"
	@echo "  make frontend-check   - lint + verificacao de formatacao do frontend"
	@echo "  make frontend-test    - testes do frontend (Vitest + Testing Library)"
	@echo "  make frontend-build   - build de producao do frontend"
	@echo "  make frontend-test-e2e - Playwright contra a aplicacao ja no ar (make up-build)"
	@echo "  make e2e              - sobe uma stack isolada, roda o Playwright e derruba tudo"
	@echo "  make check-all        - roda tudo: lint, formatacao, testes, build e E2E"
	@echo "  make help             - mostra esta mensagem"
