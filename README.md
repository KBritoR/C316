# C316

## Backend

API em FastAPI (cadastro de serviços), gerenciada com Poetry. Estrutura, endpoints,
exemplos de uso e comandos detalhados estão em [backend/README.md](backend/README.md).

### Começando rápido

```bash
make install   # instala as dependencias
make run       # roda a aplicacao localmente
make test      # roda os testes
```

### CI

O workflow em `.github/workflows/ci-backend.yml` instala as dependências com Poetry e
executa a suíte de testes com Pytest automaticamente em todo `push` e `pull_request`.
