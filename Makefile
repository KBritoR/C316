.PHONY: install run test help

BACKEND_DIR = backend
POETRY = poetry

install:
	cd $(BACKEND_DIR) && $(POETRY) install

run:
	cd $(BACKEND_DIR) && $(POETRY) run uvicorn main:app --reload

test:
	cd $(BACKEND_DIR) && $(POETRY) run pytest

help:
	@echo "Comandos disponiveis:"
	@echo "  make install  - instala as dependencias"
	@echo "  make run      - roda a aplicacao"
	@echo "  make test     - roda os testes"
	@echo "  make help     - mostra essa mensagem"