import { describe, expect, it, vi } from "vitest";
import { ERRO_CONEXAO } from "../../src/services/api";
import { obterResumo } from "../../src/services/estoque";
import {
  atualizarParcialmente,
  atualizarProduto,
  criarProduto,
  excluirProduto,
  listarMovimentacoes,
  listarProdutos,
  obterProduto,
  registrarMovimentacao,
} from "../../src/services/produtos";
import { jsonResponse, produtoExemplo } from "../helpers";

function mockFetch(resposta) {
  const fetchMock = vi.fn().mockResolvedValue(resposta);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("services de produtos", () => {
  it("listarProdutos sem filtros faz GET em /produtos", async () => {
    const fetchMock = mockFetch(jsonResponse([produtoExemplo()]));

    await expect(listarProdutos()).resolves.toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/produtos", undefined);
  });

  it("listarProdutos envia os filtros como query parameters", async () => {
    const fetchMock = mockFetch(jsonResponse([]));

    await listarProdutos({ busca: "arroz", categoria: "Grãos", estoqueBaixo: true });

    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe("/produtos");
    expect(url.searchParams.get("busca")).toBe("arroz");
    expect(url.searchParams.get("categoria")).toBe("Grãos");
    expect(url.searchParams.get("estoque_baixo")).toBe("true");
  });

  it.each([
    ["obterProduto", () => obterProduto(7), "GET", "/produtos/7"],
    ["criarProduto", () => criarProduto({ nome: "A" }), "POST", "/produtos"],
    ["atualizarProduto", () => atualizarProduto(7, { nome: "A" }), "PUT", "/produtos/7"],
    [
      "atualizarParcialmente",
      () => atualizarParcialmente(7, { estoque_minimo: 2 }),
      "PATCH",
      "/produtos/7",
    ],
    ["excluirProduto", () => excluirProduto(7), "DELETE", "/produtos/7"],
    ["listarMovimentacoes", () => listarMovimentacoes(7), "GET", "/produtos/7/movimentacoes"],
    [
      "registrarMovimentacao",
      () => registrarMovimentacao(7, { tipo: "entrada", quantidade: 1 }),
      "POST",
      "/produtos/7/movimentacoes",
    ],
    ["obterResumo", () => obterResumo(), "GET", "/estoque/resumo"],
  ])("%s usa %s em %s", async (_nome, chamar, metodo, caminho) => {
    const fetchMock = mockFetch(jsonResponse({}, metodo === "DELETE" ? 204 : 200));

    await chamar();

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`http://localhost:8000${caminho}`);
    expect(options?.method ?? "GET").toBe(metodo);
  });

  it("envia o corpo em JSON com o Content-Type correto", async () => {
    const fetchMock = mockFetch(jsonResponse(produtoExemplo(), 201));

    await criarProduto({ nome: "Arroz", estoque_minimo: 5 });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(options.body)).toEqual({ nome: "Arroz", estoque_minimo: 5 });
  });

  it("devolve null no 204 do DELETE", async () => {
    mockFetch(jsonResponse(null, 204));

    await expect(excluirProduto(1)).resolves.toBeNull();
  });

  it("lança erro de conexão quando a API está fora do ar", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(listarProdutos()).rejects.toThrow(ERRO_CONEXAO);
  });

  it("usa a mensagem da API quando o erro traz um texto (ex.: 409)", async () => {
    mockFetch(jsonResponse({ detail: "Já existe um produto com esse nome" }, 409));

    await expect(criarProduto({})).rejects.toThrow("Já existe um produto com esse nome");
  });

  it("usa a mensagem padrão quando o erro é uma lista de validação (422)", async () => {
    mockFetch(jsonResponse({ detail: [{ msg: "invalido" }] }, 422));

    await expect(criarProduto({})).rejects.toThrow("Erro ao cadastrar o produto.");
  });
});
