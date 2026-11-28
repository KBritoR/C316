import { describe, expect, it } from "vitest";
import { produtoParaApi, validarMovimentacao, validarProduto } from "../../src/validation";

const VALIDO = {
  nome: "Arroz",
  categoria: "Grãos",
  unidade: "kg",
  estoqueMinimo: "5",
  custoUnitario: "6,50",
};

describe("validarProduto", () => {
  it("aceita um produto válido", () => {
    expect(validarProduto(VALIDO)).toEqual({});
  });

  it.each([
    ["nome", "   ", "O nome é obrigatório."],
    ["categoria", "", "A categoria é obrigatória."],
    ["unidade", "tonelada", "Escolha uma unidade de medida."],
  ])("rejeita %s inválido", (campo, valor, mensagem) => {
    expect(validarProduto({ ...VALIDO, [campo]: valor })[campo]).toBe(mensagem);
  });

  it.each(["-1", "2.5", "abc", ""])("rejeita estoque mínimo %j", (estoqueMinimo) => {
    expect(validarProduto({ ...VALIDO, estoqueMinimo }).estoqueMinimo).toBeDefined();
  });

  it.each(["6,50", "6.5", "10", "0"])("aceita custo %j", (custoUnitario) => {
    expect(validarProduto({ ...VALIDO, custoUnitario }).custoUnitario).toBeUndefined();
  });

  it.each(["-1", "6,505", "abc", ""])("rejeita custo %j", (custoUnitario) => {
    expect(validarProduto({ ...VALIDO, custoUnitario }).custoUnitario).toBeDefined();
  });
});

describe("validarMovimentacao", () => {
  it("aceita quantidade inteira positiva", () => {
    expect(validarMovimentacao({ quantidade: "3", observacao: "" })).toEqual({});
  });

  it.each(["0", "-2", "1.5", ""])("rejeita quantidade %j", (quantidade) => {
    expect(validarMovimentacao({ quantidade }).quantidade).toBeDefined();
  });

  it("rejeita observação com mais de 200 caracteres", () => {
    expect(validarMovimentacao({ quantidade: "1", observacao: "x".repeat(201) }).observacao).toBe(
      "A observação pode ter no máximo 200 caracteres.",
    );
  });
});

describe("produtoParaApi", () => {
  it("converte os campos do formulário para o formato da API", () => {
    expect(produtoParaApi({ ...VALIDO, nome: "  Arroz  " })).toEqual({
      nome: "Arroz",
      categoria: "Grãos",
      unidade: "kg",
      estoque_minimo: 5,
      custo_unitario: "6.50",
    });
  });
});
