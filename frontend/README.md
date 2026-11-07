# Frontend

Cadastro de serviços em React + Vite + Tailwind CSS, consumindo a API FastAPI do backend
(`nome`, `url`, `ativo`). Os dados ficam no PostgreSQL: recarregar a página traz a lista de
volta do banco.

Pré-requisitos: Node.js 22 LTS ou superior e npm (`node --version`, `npm --version`).

## Estrutura

```
frontend/
├── src/
│   ├── components/
│   │   ├── ServicoForm.jsx   # formulario; espera o onAdd, mostra "Salvando..." e o erro da API
│   │   └── ServicoList.jsx   # listagem, estado vazio, ativar/desativar e remover
│   ├── services/
│   │   └── servicos.js       # cliente HTTP: todas as chamadas fetch ficam aqui
│   ├── App.jsx               # carrega a lista da API (useEffect) e guarda o estado da interface
│   ├── validation.js         # regras de validacao (funcao pura)
│   ├── index.css             # importa o Tailwind
│   └── main.jsx
├── tests/
│   ├── setup.js              # configuracao do Vitest (jest-dom, cleanup, desfaz mocks)
│   ├── helpers.js            # jsonResponse() para montar respostas do fetch mockado
│   ├── unit/                 # validation.js, services/servicos.js e componentes isolados
│   ├── integration/          # App + formulario + lista com fetch mockado
│   └── e2e/                  # Playwright contra a stack completa (sem mocks)
├── Dockerfile
├── biome.json
├── playwright.config.js
└── vite.config.js            # Vite + Tailwind + Vitest
```

## Consumo da API

`src/services/servicos.js` concentra as chamadas (`listServicos`, `createServico`,
`updateServico`, `deleteServico`). A URL vem de `VITE_API_URL` (padrão
`http://localhost:8000`).

| Situação                | O que acontece                                                           |
| ----------------------- | ------------------------------------------------------------------------ |
| API inacessível         | `fetch` rejeita → erro "Não foi possível conectar à API."                |
| Resposta com erro (4xx) | usa o `detail` da API quando é texto (ex.: 409), senão a mensagem padrão |
| Sucesso                 | `response.json()` (ou `null` no `204` do DELETE)                         |

Na interface:

- **Carregamento:** "Carregando serviços..." até a primeira resposta.
- **Erro de listagem:** mensagem em `role="alert"`.
- **Cadastro:** o `ServicoForm` faz `await onAdd(...)`. Se der certo, limpa os campos; se der
  erro, mostra a mensagem (ex.: "Já existe um serviço com esse nome") e mantém os campos.
- As validações do formulário continuam: dado inválido nem chega à API.

## Comandos

A partir de `frontend/`:

```bash
npm ci                # instala as dependencias
npm run dev           # servidor de desenvolvimento (http://localhost:5173)
npm run lint          # biome lint
npm run format        # biome format --write
npm run format:check  # verifica a formatacao sem alterar arquivos
npm run check         # lint + formatacao + organizacao de imports
npm run test          # Vitest (unitarios + integracao)
npm run build         # build de producao
npm run test:e2e      # Playwright contra uma stack ja no ar (E2E_BASE_URL, padrao :5173)
```

Na primeira vez, instale o navegador do Playwright: `npx playwright install chromium`.

Pela raiz, use o Makefile (`make frontend-check`, `make frontend-test`, `make frontend-build`,
`make e2e`, `make check-all`, ...). Veja o [README da raiz](../README.md).

Assim como o Ruff no backend, a CI falha se o código não estiver formatado: rode
`npm run format` antes de commitar.

## Testes

| Tipo       | O que valida                                                           | Dependências   |
| ---------- | ---------------------------------------------------------------------- | -------------- |
| Unitário   | `validation.js`, `services/servicos.js`, `ServicoForm` e `ServicoList` | nenhuma        |
| Integração | `App` + formulário + lista, com `fetch` mockado                        | nenhuma        |
| E2E        | navegador real → React → FastAPI → PostgreSQL                          | stack completa |

Os testes com `fetch` mockado cobrem: carregando, lista vazia, serviços vindos da API, erro de
conexão, erro 409, envio do POST, PATCH e DELETE.

O E2E não usa mocks: cadastra um serviço, recarrega a página (`page.reload()`) e confirma que
ele continua lá. Os nomes são únicos (`Date.now()`), então o teste não depende de dados prévios.

## CI

`.github/workflows/ci-frontend.yml` roda em pull requests (e pushes na `main`) que alterem o
frontend, o backend, o compose ou o Makefile, com dois jobs:

1. **lint**: Biome lint + verificação de formatação
2. **test** (depende do `lint`): Vitest, build de produção e `make e2e` (stack completa isolada)
   — o relatório do Playwright é publicado como artefato se algo falhar
