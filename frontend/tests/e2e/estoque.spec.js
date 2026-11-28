import { expect, test } from "@playwright/test";

// Sem mocks: navegador real -> React -> FastAPI -> PostgreSQL.
// Nomes unicos para o teste nao depender dos dados que ja existem no banco.
function nomeUnico(prefixo) {
  return `${prefixo} ${Date.now()}`;
}

async function abrir(page) {
  await page.goto("/");
  await expect(page.getByText("Carregando produtos...")).toBeHidden();
}

async function cadastrarProduto(
  page,
  nome,
  { categoria = "Grãos", minimo = "5", custo = "6,50" } = {},
) {
  const formulario = page.getByRole("form", { name: "Novo produto" });
  await formulario.getByLabel("Nome", { exact: true }).fill(nome);
  await formulario.getByLabel("Categoria", { exact: true }).fill(categoria);
  await formulario.getByLabel("Estoque mínimo", { exact: true }).fill(minimo);
  await formulario.getByLabel("Custo unitário (R$)").fill(custo);
  await formulario.getByRole("button", { name: "Cadastrar produto" }).click();
  await expect(page.getByRole("status")).toContainText(`Produto "${nome}" cadastrado.`);
}

function itemDaLista(page, nome) {
  return page
    .getByRole("list", { name: "Produtos" })
    .getByRole("listitem")
    .filter({ hasText: nome });
}

async function movimentar(page, nome, tipo, quantidade) {
  await itemDaLista(page, nome)
    .getByRole("button", { name: `Movimentar ${nome}` })
    .click();
  const painel = page.getByRole("region", { name: `Movimentações de ${nome}` });
  await painel.getByLabel("Tipo").selectOption(tipo);
  await painel.getByLabel(/Quantidade/).fill(String(quantidade));
  await painel.getByRole("button", { name: "Registrar" }).click();
  return painel;
}

test("cadastra um produto, registra entrada e os dados continuam após recarregar a página", async ({
  page,
}) => {
  const nome = nomeUnico("Arroz E2E");
  await abrir(page);

  await cadastrarProduto(page, nome);
  await expect(itemDaLista(page, nome)).toContainText("Estoque baixo");

  const painel = await movimentar(page, nome, "entrada", 12);
  await expect(page.getByRole("status")).toContainText(`Entrada de 12 kg em "${nome}".`);
  await expect(painel.getByText(/Entrada de 12 kg/)).toBeVisible();

  await page.reload();
  await expect(page.getByText("Carregando produtos...")).toBeHidden();

  const item = itemDaLista(page, nome);
  await expect(item).toContainText("12 kg");
  await expect(item).not.toContainText("Estoque baixo");
});

test("mostra o erro da API ao tentar tirar mais do que tem em estoque", async ({ page }) => {
  const nome = nomeUnico("Feijão E2E");
  await abrir(page);
  await cadastrarProduto(page, nome);
  await movimentar(page, nome, "entrada", 3);

  const painel = await movimentar(page, nome, "saida", 10);

  await expect(painel.getByRole("alert")).toContainText(
    "Estoque insuficiente: saldo atual 3, saída solicitada 10",
  );
  await expect(itemDaLista(page, nome)).toContainText("3 kg");
});

test("não deixa cadastrar dois produtos com o mesmo nome", async ({ page }) => {
  const nome = nomeUnico("Sal E2E");
  await abrir(page);
  await cadastrarProduto(page, nome);

  const formulario = page.getByRole("form", { name: "Novo produto" });
  await formulario.getByLabel("Nome", { exact: true }).fill(nome.toUpperCase());
  await formulario.getByLabel("Categoria", { exact: true }).fill("Temperos");
  await formulario.getByLabel("Custo unitário (R$)").fill("2");
  await formulario.getByRole("button", { name: "Cadastrar produto" }).click();

  await expect(formulario.getByRole("alert")).toContainText("Já existe um produto com esse nome");
});

test("edita e exclui um produto, e a exclusão persiste", async ({ page }) => {
  const nome = nomeUnico("Óleo E2E");
  const novoNome = `${nome} de soja`;
  await abrir(page);
  await cadastrarProduto(page, nome);

  await itemDaLista(page, nome)
    .getByRole("button", { name: `Editar ${nome}` })
    .click();
  const edicao = page.getByRole("form", { name: "Editar produto" });
  await edicao.getByLabel("Nome", { exact: true }).fill(novoNome);
  await edicao.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.getByRole("status")).toContainText(`Produto "${novoNome}" atualizado.`);

  page.once("dialog", (dialogo) => dialogo.accept());
  await itemDaLista(page, novoNome)
    .getByRole("button", { name: `Excluir ${novoNome}` })
    .click();
  await expect(page.getByRole("status")).toContainText(`Produto "${novoNome}" excluído.`);

  await page.reload();
  await expect(page.getByText("Carregando produtos...")).toBeHidden();
  await expect(itemDaLista(page, novoNome)).toHaveCount(0);
});
