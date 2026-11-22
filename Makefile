.PHONY: install run up-build up down ps logs logs-api help

BACKEND_DIR = backend
POETRY = poetry

# ---------- Backend (local) ----------

install:
	cd $(BACKEND_DIR) && $(POETRY) install

run:
	cd $(BACKEND_DIR) && $(POETRY) run uvicorn app.main:app --reload

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

help:
	@echo "Comandos disponiveis:"
	@echo "  make install  - instala as dependencias do backend (Poetry)"
	@echo "  make run      - roda a API localmente em http://localhost:8000"
	@echo "  make up-build - builda as imagens e sobe db + api (espera ficarem healthy)"
	@echo "  make up       - sobe db + api sem rebuildar"
	@echo "  make down     - derruba os containers (os dados do banco ficam no volume)"
	@echo "  make ps       - mostra o status dos containers"
	@echo "  make logs     - acompanha os logs de todos os servicos"
	@echo "  make logs-api - acompanha os logs da API"
	@echo "  make help     - mostra esta mensagem"
