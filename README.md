# C316

Cadastro de serviços full-stack: frontend em React (Vite + Tailwind) consumindo uma API
FastAPI, com persistência em PostgreSQL (SQLAlchemy + Alembic), tudo rodando em três
contêineres via Docker Compose.

```
Navegador (React/Vite)  :5173
        │  HTTP (fetch) — origem diferente → exige CORS
        ▼
API FastAPI             :8000
        │  SQLAlchemy (host "db" na rede Docker)
        ▼
PostgreSQL              :5432
```

Detalhes de cada parte: [backend/README.md](backend/README.md) e
[frontend/README.md](frontend/README.md).

## Subindo a stack

```bash
make up-build    # sobe db, api e frontend e espera todos ficarem healthy
make ps          # status dos containers
make db-current  # revisao atual do banco (deve mostrar "(head)")
```

As migrations são aplicadas automaticamente quando o container da `api` inicia
(`alembic upgrade head`). Para aplicar manualmente: `make db-upgrade`.

- API: http://localhost:8000/docs
- Frontend: http://localhost:5173

Para derrubar: `make down`.

### Variáveis de ambiente

| Variável        | Padrão                                              | Uso                               |
| --------------- | --------------------------------------------------- | --------------------------------- |
| `API_PORT`      | `8000`                                              | porta publicada da API            |
| `FRONTEND_PORT` | `5173`                                              | porta publicada do frontend       |
| `DB_PORT`       | `5432`                                              | porta publicada do PostgreSQL     |
| `CORS_ORIGINS`  | `http://localhost:5173,http://127.0.0.1:5173`       | origens liberadas no CORS da API  |
| `VITE_API_URL`  | `http://localhost:8000`                             | URL da API usada pelo navegador   |

O CORS só libera as origens explícitas do frontend (nada de `*`).

## Comandos

| Comando                                       | Função                                                  |
| --------------------------------------------- | ------------------------------------------------------- |
| `make up-build` / `make down`                 | sobe / derruba db, api e frontend                       |
| `make db-upgrade`                             | aplica as migrations                                    |
| `make test`                                   | testes do backend (precisa do Postgres: `make db-up`)   |
| `make frontend-test`                          | Vitest (unitários e integração)                         |
| `make e2e`                                    | E2E full-stack em stack isolada                         |
| `make lint` / `make format`                   | Ruff                                                    |
| `make frontend-check` / `make frontend-build` | Biome / build do Vite                                   |
| `make check-all`                              | tudo acima (exige Docker)                               |

`make help` lista todos os comandos.

### E2E isolado

`make e2e` sobe uma stack **separada** da de desenvolvimento (projeto Compose `lab-e2e`,
portas `8001` para a API, `5174` para o frontend e `5433` para o banco, com volume próprio),
roda o Playwright contra ela e, ao final, derruba tudo com `down -v`. O banco de teste é
apagado e o de desenvolvimento nunca é tocado.

Para rodar o Playwright contra uma stack já no ar: `make frontend-test-e2e`
(variável `E2E_BASE_URL`, padrão `http://localhost:5173`).

## CI

- `.github/workflows/ci-backend.yml`: sobe um PostgreSQL de serviço, roda o Ruff, aplica as
  migrations e executa o Pytest em todo `push` e `pull_request`.
- `.github/workflows/ci-frontend.yml`: um job de lint/formatação (Biome) e um job de testes
  (Vitest, build e `make e2e`) que só executa depois que o lint passa.
