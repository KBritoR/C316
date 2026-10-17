# Backend

API em FastAPI para o cadastro de serviços, com persistência em PostgreSQL via SQLAlchemy
e migrations com Alembic, gerenciada com Poetry.

## Estrutura

```
backend/
├── app/
│   ├── main.py                    # cria o FastAPI() e registra os routers
│   ├── core/
│   │   └── config.py              # le DATABASE_URL da variavel de ambiente
│   ├── database/
│   │   ├── base.py                # Base declarativa do SQLAlchemy
│   │   └── session.py             # engine, SessionLocal e a dependency get_db
│   ├── models/
│   │   └── servico.py             # modelo ORM (tabela `servicos`)
│   ├── schemas/
│   │   └── servico.py             # modelos Pydantic (entrada/saida da API)
│   ├── repositories/
│   │   └── servico_repository.py  # acesso aos dados via SQLAlchemy Session
│   ├── services/
│   │   └── servico_service.py     # regras de negocio, usa o repository
│   └── api/routes/
│       ├── health.py              # GET /health
│       └── servicos.py            # endpoints do cadastro de servicos
├── alembic/
│   └── versions/                  # migrations
├── alembic.ini
└── tests/
    ├── conftest.py                # fixture `client`, zera a tabela antes de cada teste
    ├── unit/                      # ServicoService com um repository falso em memoria, sem banco
    └── integration/                # endpoints via TestClient, contra o Postgres real
```

Fluxo de uma requisição: `HTTP -> Pydantic Schema -> Service -> Repository -> SQLAlchemy Model -> PostgreSQL`.
O schema Pydantic valida o que entra/sai da API; o modelo SQLAlchemy representa a tabela no
banco — são coisas diferentes de propósito, por isso ficam em módulos separados.

## PostgreSQL

A API precisa de um PostgreSQL rodando e acessível pela variável de ambiente `DATABASE_URL`.

Via Docker Compose (recomendado, já usa a rede do compose e o host `db`):

```bash
make docker-up      # ou: docker compose up -d --build
```

O container do backend aplica as migrations automaticamente antes de subir o servidor.

Rodando o backend fora do Docker (ex.: `make run`), suba só o banco e use `localhost`:

```bash
docker compose up -d db
```

O valor padrão de `DATABASE_URL` em `app/core/config.py` já aponta para
`postgresql+psycopg://postgres:postgres@localhost:5432/appdb`, que é o que a porta publicada
pelo `docker-compose.yml` espera. Para outro ambiente, defina a variável antes de rodar:

```bash
export DATABASE_URL="postgresql+psycopg://usuario:senha@host:5432/banco"
```

Dentro da rede do Compose, a API **não** deve usar `localhost` — é o `docker-compose.yml`
quem já injeta a URL correta (com o host `db`) no container do backend.

## Migrations (Alembic)

```bash
make db-upgrade                   # aplica as migrations pendentes
make db-migration msg="..."       # gera uma nova migration (autogenerate)
make db-current                   # mostra a revisao atual do banco
```

Depois de criar ou alterar um modelo em `app/models/`, gere a migration e **revise o arquivo
gerado antes de aplicar**:

```bash
make db-migration msg="create servicos table"
make db-upgrade
```

## Recurso: Serviço

| Campo  | Tipo   | Observações                                  |
|--------|--------|-----------------------------------------------|
| id     | int    | gerado pelo banco, não é enviado pelo cliente |
| nome   | string | obrigatório, não pode ser vazio               |
| url    | string | obrigatório, precisa começar com `http://` ou `https://` |
| ativo  | bool   | opcional na criação (padrão `true`)           |

Dados inválidos retornam `422`. Um serviço inexistente retorna `404`.

## Endpoints

| Método | Rota              | Descrição                                           |
|--------|-------------------|-------------------------------------------------------|
| GET    | `/health`         | Health check                                          |
| POST   | `/servicos`       | Cria um serviço                                       |
| GET    | `/servicos`       | Lista serviços; aceita `?ativo=true` ou `?ativo=false` como query parameter |
| GET    | `/servicos/{id}`  | Busca um serviço pelo id (path parameter)             |
| PUT    | `/servicos/{id}`  | Substitui o serviço: exige todos os campos editáveis (`nome`, `url`, `ativo`) |
| PATCH  | `/servicos/{id}`  | Atualiza só os campos enviados; rejeita valores `null` explícitos |
| DELETE | `/servicos/{id}`  | Remove o serviço                                      |

### Exemplos

Criar um serviço:

```bash
curl -X POST http://localhost:8000/servicos \
  -H "Content-Type: application/json" \
  -d '{"nome": "API Pagamentos", "url": "https://pagamentos.exemplo.com", "ativo": true}'
```

Listar só os ativos:

```bash
curl "http://localhost:8000/servicos?ativo=true"
```

Atualizar parcialmente (PATCH) só o campo `ativo`:

```bash
curl -X PATCH http://localhost:8000/servicos/1 \
  -H "Content-Type: application/json" \
  -d '{"ativo": false}'
```

Validar que os dados persistem: crie um serviço, reinicie o container do backend
(`docker compose restart backend`) e confirme que `GET /servicos` ainda retorna o registro.

## Comandos

```bash
make install             # instala as dependencias com Poetry
make run                 # roda a aplicacao localmente (uvicorn --reload)
make test                # roda toda a suite de testes
make test-unit           # roda so os testes unitarios (tests/unit, sem banco)
make test-integration    # roda so os testes de integracao (tests/integration, contra o Postgres)
make test-cov            # roda os testes com relatorio de cobertura
make lint                # roda o ruff
make db-upgrade          # aplica as migrations pendentes
make db-migration msg="descricao"  # gera uma nova migration
make db-current           # mostra a revisao atual do banco
```

Ou diretamente com Poetry, sem o Makefile:

```bash
cd backend
poetry install
poetry run pytest -v                    # tudo
poetry run pytest -v tests/unit         # so unitarios, sem banco
poetry run pytest -v tests/integration  # so integracao, precisa do Postgres rodando
poetry run ruff check .                 # lint
poetry run alembic upgrade head         # aplica migrations
```

Os testes de integração (e a aplicação em si) esperam um PostgreSQL acessível via
`DATABASE_URL` com as migrations já aplicadas — suba o banco com `docker compose up -d db`
e rode `make db-upgrade` antes de `make test`/`make test-integration`.
