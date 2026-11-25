## Tema e objetivo
Controle de estoque para restaurantes.

## Funcionalidades
Já implementadas:
Regra de saldo: entrada soma, saída subtrai e a saída não pode deixar o estoque negativo
Alerta de estoque baixo

Planejadas:
Cadastro, edição, consulta e exclusão de produtos
Registro de entradas e saídas
Resumo do estoque

## Tecnologias
Python 3.14, FastAPI, Poetry
PostgreSQL 16
Docker e Docker Compose
Pytest e Ruff
GitHub Actions
Makefile

## Pré-requisitos
ocker Desktop
Python 3.14 e Poetry 
make

## Variáveis de ambiente
Copiar o `.env.example` para `.env`.

## Como executar
make up-build → sobe o banco e a API
Make ps → status dos containers
make down → derruba os containers


## Testes e qualidade
make test → testes (Pytest)
make lint / make format → Ruff
A CI roda lint, formatação e testes a cada push no backend


