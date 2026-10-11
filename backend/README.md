# Backend

API em FastAPI para o cadastro de serviços, gerenciada com Poetry.

## Estrutura

```
backend/
├── main.py                        # cria o FastAPI() e registra os routers
├── schemas.py                     # modelos Pydantic (validacao de entrada/saida)
├── services.py                    # regras de negocio e armazenamento (ServicoStore)
├── routers/
│   ├── health.py                  # GET /health
│   └── servicos.py                # endpoints do cadastro de servicos
└── tests/
    ├── conftest.py                # fixture `client` (TestClient com estado zerado)
    ├── unit/                      # testa schemas/services isolados, sem HTTP
    └── integration/                # testa os endpoints via TestClient
```

O armazenamento é em memória (`ServicoStore`), só para manter o foco desta prática na
organização do projeto e na API. Os registros são perdidos ao reiniciar a aplicação; o
PostgreSQL do `docker-compose.yml` ainda não é usado pelo cadastro.

## Recurso: Serviço

| Campo  | Tipo   | Observações                                  |
|--------|--------|-----------------------------------------------|
| id     | int    | gerado pelo backend, não é enviado pelo cliente |
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

## Comandos

```bash
make install            # instala as dependencias com Poetry
make run                # roda a aplicacao localmente (uvicorn --reload)
make test                # roda toda a suite de testes
make test-unit           # roda so os testes unitarios (tests/unit)
make test-integration    # roda so os testes de integracao (tests/integration)
make test-cov            # roda os testes com relatorio de cobertura
```

Ou diretamente com Poetry, sem o Makefile:

```bash
cd backend
poetry install
poetry run pytest -v                 # tudo
poetry run pytest -v tests/unit      # so unitarios
poetry run pytest -v tests/integration  # so integracao
```
