# Controle de estoque para restaurantes

## Objetivo
Auxiliar no controle dos insumos de restaurantes, separando cada produto, e conseguindo adicionar e retirar do estoque, além do valor total em reais do estoque atual.

## Funcionalidades
- CRUD de produtos
- Entradas e saídas, com histórico
- Estoque mínimo, com alerta e o ajuste no painel
- Resumo (total, estoque baixo, valor)
- Filtros (nome, categoria, só estoque baixo)
- Regras: saída não deixa negativo, nome único sem diferenciar maiúsculas, não exclui produto com estoque, quantidade só muda por movimentação

## Tecnologias
- Backend: Python 3.14, FastAPI, Poetry, SQLAlchemy, Alembic, PostgreSQL 16, Pytest, Ruff
- Frontend: React, Vite, Tailwind, Biome, Vitest, Testing Library, Playwright
- Infraestrutura e CI: Docker Compose, GitHub Actions, Makefile

## Estrutura
Separei a estrutura do projeto:

Backend:
- `api` -> Recebe as requisições HTTP
- `schemas` -> Valida os dados que entram e saem
- `services` -> As regras de negócio
- `repositories` -> Conversa com o banco
- `models` -> As tabelas
- `database` -> A conexão
- `core` -> As configurações
- `alembic/` -> As migrations

Frontend:
- `components/` -> As partes da tela:
  - `ProdutoForm` -> formulário de cadastro e edição
  - `ProdutoList` -> lista de produtos, com os botões Movimentar, Editar e Excluir
  - `ProdutoFiltros` -> busca por nome, categoria e "só estoque baixo"
  - `ProdutoDetalhe` -> painel de entrada e saída, ajuste do estoque mínimo e histórico
  - `ResumoEstoque` -> os cartões do topo (total, estoque baixo e valor)
- `services/` -> Todas as chamadas à API (fetch), num lugar só. Também tratam os erros: API fora do ar ou mensagem de erro vinda da API.
- `App.jsx` -> Junta tudo, carrega os dados da API e mostra as mensagens de sucesso e de erro.
- `validation.js` -> Valida o formulário antes de enviar, com as mesmas regras do backend.

CI:
- Testes unitários
- Testes de integração
- Testes E2E

## Pré-requisitos
- Docker Desktop
- Python 3.14 e Poetry
- make
- Node.js 22

## Variáveis de ambiente
- `POSTGRES_USER` -> Nome do usuário do BD. Precisamos dele para acessar o banco.
- `POSTGRES_PASSWORD` -> A senha do usuário
- `POSTGRES_DB` -> Nome do banco que o PostgreSQL cria quando sobe pela primeira vez.
- `DB_PORT` -> A porta para acessarmos o banco.
- `API_PORT` -> Porta para acessarmos a API.
- `FRONTEND_PORT` -> Porta do frontend
- `CORS_ORIGINS` -> Quais sites podem chamar a API
- `VITE_API_URL` -> Endereço da API que o frontend utiliza.

## Como executar
- `make up-build`, `make ps` e `make down`
- Frontend em http://localhost:5173
- API em http://localhost:8000/docs

## Migrações
`make db-upgrade`, `make db-current` e `make db-migration msg="..."`. A API aplica as migrations sozinha ao subir.

## Testes e qualidade
- `make test` -> testes (Pytest)
- `make lint` / `make format` -> Ruff
- A CI roda lint, formatação e testes a cada push no backend
- `make frontend-test` (testes do frontend)
- `make e2e` (o Playwright testando tudo junto)
- `make check-all`, que roda tudo num comando só.
