.PHONY: install run test help

install:
	cd backend && poetry install

run:
	cd backend && poetry run uvicorn main:app --reload

test:
	cd backend && poetry run pytest

help:
	@echo "Comandos disponiveis:"
	@echo "  make install  - instala as dependencias"
	@echo "  make run      - roda a aplicacao"
	@echo "  make test     - roda os testes"
	@echo "  make help     - mostra essa mensagem"