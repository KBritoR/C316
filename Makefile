.PHONY: install run test help docker-up docker-down docker-build docker-logs docker-restart

BACKEND_DIR = backend
POETRY = poetry

install:
	cd $(BACKEND_DIR) && $(POETRY) install

run:
	cd $(BACKEND_DIR) && $(POETRY) run uvicorn main:app --reload

test:
	cd $(BACKEND_DIR) && $(POETRY) run pytest

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
	@echo "  make test           - roda os testes"
	@echo "  make docker-build   - builda as imagens docker"
	@echo "  make docker-up      - sobe os containers em background"
	@echo "  make docker-down    - derruba os containers"
	@echo "  make docker-logs    - mostra os logs dos containers"
	@echo "  make docker-restart - reconstroi e reinicia os containers"