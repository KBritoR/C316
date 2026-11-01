import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("carrega a interface com o estado vazio", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Cadastro de Serviços" })).toBeVisible();
  await expect(page.getByText("Nenhum serviço cadastrado.")).toBeVisible();
});

test("cadastra, desativa e remove um serviço", async ({ page }) => {
  await page.getByLabel("Nome").fill("API Pagamentos");
  await page.getByLabel("URL").fill("https://pagamentos.exemplo.com");
  await page.getByRole("button", { name: "Cadastrar" }).click();

  const lista = page.getByRole("list", { name: "Serviços cadastrados" });
  await expect(lista.getByText("API Pagamentos")).toBeVisible();
  await expect(lista.getByText("Ativo", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Desativar API Pagamentos" }).click();
  await expect(lista.getByText("Inativo")).toBeVisible();

  await page.getByRole("button", { name: "Remover API Pagamentos" }).click();
  await expect(page.getByText("Nenhum serviço cadastrado.")).toBeVisible();
});

test("mostra erro de validação ao enviar nome vazio", async ({ page }) => {
  await page.getByLabel("URL").fill("https://exemplo.com");
  await page.getByRole("button", { name: "Cadastrar" }).click();

  await expect(page.getByText("O nome é obrigatório.")).toBeVisible();
  await expect(page.getByText("Nenhum serviço cadastrado.")).toBeVisible();
});

test("os dados não persistem ao recarregar a página", async ({ page }) => {
  await page.getByLabel("Nome").fill("API Temporaria");
  await page.getByLabel("URL").fill("https://temp.exemplo.com");
  await page.getByRole("button", { name: "Cadastrar" }).click();
  await expect(page.getByText("API Temporaria")).toBeVisible();

  await page.reload();

  await expect(page.getByText("Nenhum serviço cadastrado.")).toBeVisible();
});
