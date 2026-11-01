# Frontend

Cadastro de serviços em React + Vite + Tailwind CSS, espelhando o recurso do backend
(`nome`, `url`, `ativo`). Nesta prática **não há chamadas ao backend**: os dados ficam em
memória (estado do React) e somem ao recarregar a página.

Pré-requisitos: Node.js 22 LTS ou superior e npm (`node --version`, `npm --version`).

## Estrutura

```
frontend/
├── src/
│   ├── components/
│   │   ├── ServicoForm.jsx   # formulario (nome, url, ativo) com mensagens de erro
│   │   └── ServicoList.jsx   # listagem, estado vazio, ativar/desativar e remover
│   ├── App.jsx               # guarda o estado dos servicos e o filtro por status
│   ├── validation.js         # regras de validacao (funcao pura)
│   ├── index.css             # importa o Tailwind
│   └── main.jsx
├── tests/
│   ├── setup.js              # configuracao do Vitest (jest-dom + cleanup)
│   ├── unit/                 # validation.js e componentes isolados
│   ├── integration/          # formulario + lista funcionando juntos no App
│   └── e2e/                  # Playwright, no navegador real
├── biome.json
├── playwright.config.js
└── vite.config.js            # Vite + Tailwind + Vitest
```

## Funcionalidades

- Cadastrar serviço com nome e URL (validação: nome obrigatório, URL começando com `http://` ou `https://`)
- Listar serviços, com estado vazio
- Filtrar por status (Todos / Ativos / Inativos)
- Ativar/desativar e remover serviços
- Layout responsivo com Tailwind

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
npm run test:e2e      # Playwright (sobe o Vite sozinho via webServer)
```

Na primeira vez, instale o navegador do Playwright: `npx playwright install chromium`.

Ou a partir da raiz, pelo Makefile: `make frontend-install`, `make frontend-dev`,
`make frontend-lint`, `make frontend-format`, `make frontend-check`, `make frontend-test`,
`make frontend-test-e2e`, `make frontend-build` e `make check-all`.

Assim como o Ruff no backend, a CI falha se o código não estiver formatado: rode
`npm run format` antes de commitar.

## Testes

| Tipo       | O que valida                                            | Ferramenta                |
| ---------- | ------------------------------------------------------- | ------------------------- |
| Unitário   | `validation.js`, `ServicoForm` e `ServicoList` isolados | Vitest + RTL (jsdom)      |
| Integração | formulário + lista + filtro funcionando juntos no `App` | Vitest + RTL + user-event |
| E2E        | fluxo completo no navegador real                        | Playwright (Chromium)     |

## CI

`.github/workflows/ci-frontend.yml` roda em pull requests (e pushes na `main`) que alterem
`frontend/**`, com dois jobs:

1. **lint**: Biome lint + verificação de formatação
2. **test** (depende do `lint`): Vitest, build de produção e Playwright E2E — o relatório do
   Playwright é publicado como artefato se algo falhar
