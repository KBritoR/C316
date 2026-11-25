## Tema e objetivo
Controle de estoque para restaurantes.

## Funcionalidades
Foi implementado um CRUD completo dos produtos, o sistema contem entrada, saidas, alerta de estoque baixo, resumo do estoque e filtro por produtos.


## Tecnologias
Python 3.14, FastAPI, Poetry, PostgreSQL 16, SQLAlchemy, Alembic, Docker e Compose, Pytest, Ruff, GitHub Actions e Makefile.

## Estrutura 
Separei a rstrutura do projeto em  backend/app (api, schemas, services, repositories, models, database, core)
api -> Recebe as requisições HTTP
schemas -> Valida os dados que entram e saem
services -> As regras de negócio
repositories -> Conversa com o banco
models -> As tabelas
database -> A conexão
core -> As configurações
alembic/ -> As migrations
tests/ -> Os testes

## Pré-requisitos
ocker Desktop
Python 3.14 e Poetry 
make


## Variáveis de ambiente
POSTGRES_USER -> Nome do usuario do BD. Precisamos dele para acessar o banco.
POSTGRES_PASSWORD -> A senha do usuario
POSTGRES_DB -> Nome do bando que o PostgreSQL crie quando sobe a primeira vez.
DB_PORT -> A porta para acessarmos o banco.
API_PORT -> Porta para acessarmos a API.

## Como executar
make up-build -> sobe o banco e a API
Make ps -> status dos containers
make down -> derruba os containers


## Testes e qualidade
make test -> testes (Pytest)
make lint / make format -> Ruff
A CI roda lint, formatação e testes a cada push no backend



