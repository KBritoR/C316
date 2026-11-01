# C316

## Backend

API em FastAPI (cadastro de serviços), com persistência em PostgreSQL via SQLAlchemy e
migrations com Alembic, gerenciada com Poetry. Estrutura, endpoints, exemplos de uso e
comandos detalhados estão em [backend/README.md](backend/README.md).

### Começando rápido

```bash
make docker-up   # sobe API + PostgreSQL via Docker Compose (aplica as migrations sozinho)
make test        # roda os testes (precisa do Postgres acessivel; ver backend/README.md)
```

Rodando o backend fora do Docker, veja em [backend/README.md](backend/README.md) como
subir só o banco e configurar o `DATABASE_URL`.

### CI

O workflow em `.github/workflows/ci-backend.yml` sobe um PostgreSQL de serviço, instala as
dependências com Poetry, roda o lint (`ruff`), aplica as migrations com Alembic e executa a
suíte de testes com Pytest automaticamente em todo `push` e `pull_request`.

## Frontend

Cadastro de serviços em React + Vite + Tailwind CSS, com Biome (lint/formatação), Vitest +
React Testing Library (unitários e integração) e Playwright (E2E). Ainda não consome a API:
os dados ficam em memória. Detalhes em [frontend/README.md](frontend/README.md).

### Começando rápido

```bash
make frontend-install   # npm ci
make frontend-dev       # http://localhost:5173
make frontend-check     # lint + formatacao
make frontend-test      # Vitest
make frontend-test-e2e  # Playwright
make check-all          # backend + frontend
```

### CI

O workflow em `.github/workflows/ci-frontend.yml` roda em pull requests que alterem
`frontend/**`, com um job de lint/formatação (Biome) e um job de testes (Vitest, build e
Playwright) que só executa depois que o lint passa.
