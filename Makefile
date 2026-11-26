.PHONY: install run test test-unit test-integration lint format format-check \
	db-up db-upgrade db-downgrade db-migration db-current db-history \
	up-build up down ps logs logs-api \
	frontend-install frontend-dev frontend-lint frontend-format frontend-format-check \
	frontend-check frontend-test frontend-build help

BACKEND_DIR = backend
FRONTEND_DIR = frontend
POETRY = poetry
NPM = npm --prefix $(FRONTEND_DIR)

# ---------- Backend (local) ----------

install:
	cd $(BACKEND_DIR) && $(POETRY) install

run:
	cd $(BACKEND_DIR) && $(POETRY) run uvicorn app.main:app --reload

# Os testes de integracao precisam do PostgreSQL: o db-up garante que ele esteja de pe.
test: db-up
	cd $(BACKEND_DIR) && $(POETRY) run pytest -v

test-unit:
	cd $(BACKEND_DIR) && $(POETRY) run pytest -v tests/unit

test-integration: db-up
	cd $(BACKEND_DIR) && $(POETRY) run pytest -v tests/integration

lint:
	cd $(BACKEND_DIR) && $(POETRY) run ruff check .

format:
	cd $(BACKEND_DIR) && $(POETRY) run ruff format .

format-check:
	cd $(BACKEND_DIR) && $(POETRY) run ruff format --check .

# ---------- Banco de dados (Alembic) ----------

db-up:
	docker compose up -d --wait db

db-upgrade:
	cd $(BACKEND_DIR) && $(POETRY) run alembic upgrade head

db-downgrade:
	cd $(BACKEND_DIR) && $(POETRY) run alembic downgrade -1

db-migration:
	cd $(BACKEND_DIR) && $(POETRY) run alembic revision --autogenerate -m "$(msg)"

db-current:
	cd $(BACKEND_DIR) && $(POETRY) run alembic current

db-history:
	cd $(BACKEND_DIR) && $(POETRY) run alembic history

# ---------- Docker Compose (db + api) ----------

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
	@echo "  make up-build         - builda as imagens e sobe db + api (aplica as migrations)"
	@echo "  make up               - sobe db + api sem rebuildar"
	@echo "  make down             - derruba os containers (os dados ficam no volume)"
	@echo "  make ps               - mostra o status dos containers"
	@echo "  make logs             - acompanha os logs de todos os servicos"
	@echo "  make logs-api         - acompanha os logs da API"
	@echo "  make frontend-install - instala as dependencias do frontend (npm ci)"
	@echo "  make frontend-dev     - roda o frontend em http://localhost:5173 (Vite)"
	@echo "  make frontend-lint    - verifica o codigo do frontend com o Biome"
	@echo "  make frontend-format  - formata o codigo do frontend com o Biome"
	@echo "  make frontend-format-check - verifica a formatacao do frontend"
	@echo "  make frontend-check   - lint + verificacao de formatacao do frontend"
	@echo "  make frontend-test    - testes do frontend (Vitest + Testing Library)"
	@echo "  make frontend-build   - build de producao do frontend"
	@echo "  make help             - mostra esta mensagem"
