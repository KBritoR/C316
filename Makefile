.PHONY: install run help

BACKEND_DIR = backend
POETRY = poetry

install:
	cd $(BACKEND_DIR) && $(POETRY) install

run:
	cd $(BACKEND_DIR) && $(POETRY) run uvicorn app.main:app --reload

help:
	@echo "Comandos disponiveis:"
	@echo "  make install - instala as dependencias do backend (Poetry)"
	@echo "  make run     - roda a API localmente em http://localhost:8000"
	@echo "  make help    - mostra esta mensagem"
