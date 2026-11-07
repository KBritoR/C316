import { expect, test } from "@playwright/test";

// Sem mocks: navegador real -> React -> FastAPI -> PostgreSQL.
// Nomes únicos para o teste não depender de dados que já existam no banco.
function nomeUnico(prefixo) {
  return `${prefixo} ${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

async function cadastrar(page, nome, url) {
  await page.getByLabel("Nome").fill(nome);
  await page.getByLabel("URL").fill(url);
  await page.getByRole("button", { name: "Cadastrar" }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Carregando serviços...")).toBeHidden();
});

test("carrega a interface e a lista vinda da API", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Cadastro de Serviços" })).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("cadastra um serviço e ele persiste após recarregar a página", async ({ page }) => {
  const nome = nomeUnico("API Pagamentos");

  const respostaPost = page.waitForResponse(
    (r) => r.url().endsWith("/servicos") && r.request().method() === "POST",
  );
  await cadastrar(page, nome, "https://pagamentos.exemplo.com");
  expect((await respostaPost).status()).toBe(201);
  await expect(page.getByText(nome)).toBeVisible();

  await page.reload();

  await expect(page.getByText(nome)).toBeVisible();
});

test("mostra a mensagem do 409 ao cadastrar um nome repetido", async ({ page }) => {
  const nome = nomeUnico("API Duplicada");
  await cadastrar(page, nome, "https://duplicada.exemplo.com");
  await expect(page.getByText(nome)).toBeVisible();

  await cadastrar(page, nome, "https://outra.exemplo.com");

  await expect(page.getByText("Já existe um serviço com esse nome")).toBeVisible();
  await expect(page.getByText(nome)).toHaveCount(1);
});

test("desativa e remove um serviço, e as mudanças persistem", async ({ page }) => {
  const nome = nomeUnico("API Temporaria");
  await cadastrar(page, nome, "https://temp.exemplo.com");
  const item = page.getByRole("listitem").filter({ hasText: nome });
  await expect(item).toBeVisible();

  await page.getByRole("button", { name: `Desativar ${nome}` }).click();
  await expect(item.getByText("Inativo")).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("listitem").filter({ hasText: nome }).getByText("Inativo"),
  ).toBeVisible();

  await page.getByRole("button", { name: `Remover ${nome}` }).click();
  await expect(page.getByText(nome)).toHaveCount(0);

  await page.reload();
  await expect(page.getByText("Carregando serviços...")).toBeHidden();
  await expect(page.getByText(nome)).toHaveCount(0);
});

test("mostra erro de validação e não envia nome vazio para a API", async ({ page }) => {
  let enviouPost = false;
  page.on("request", (r) => {
    if (r.method() === "POST") enviouPost = true;
  });

  await page.getByLabel("URL").fill("https://exemplo.com");
  await page.getByRole("button", { name: "Cadastrar" }).click();

  await expect(page.getByText("O nome é obrigatório.")).toBeVisible();
  expect(enviouPost).toBe(false);
});
