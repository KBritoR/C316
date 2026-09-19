# C316

## Backend

API em FastAPI gerenciada com Poetry.

### Instalar dependencias

```bash
make install
```

### Rodar a aplicacao

```bash
make run
```

### Rodar os testes

```bash
make test
```

Isso executa `poetry run pytest -v` dentro de `backend/`, descobrindo automaticamente os
testes em `backend/tests`.

Para rodar com relatorio de cobertura:

```bash
make test-cov
```

Tambem e possivel rodar direto com Poetry, sem o Makefile:

```bash
cd backend
poetry install
poetry run pytest -v
```

### CI

O workflow em `.github/workflows/ci-backend.yml` instala as dependencias com Poetry e
executa a suite de testes com Pytest automaticamente em todo `push` e `pull_request`.
