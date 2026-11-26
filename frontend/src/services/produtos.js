import { json, request } from "./api";

export function listarProdutos({ busca, categoria, estoqueBaixo } = {}) {
  const parametros = new URLSearchParams();
  if (busca) parametros.set("busca", busca);
  if (categoria) parametros.set("categoria", categoria);
  if (estoqueBaixo) parametros.set("estoque_baixo", "true");
  const consulta = parametros.toString();
  return request(
    `/produtos${consulta ? `?${consulta}` : ""}`,
    undefined,
    "Erro ao carregar os produtos.",
  );
}

export function obterProduto(id) {
  return request(`/produtos/${id}`, undefined, "Erro ao carregar o produto.");
}

export function criarProduto(dados) {
  return request("/produtos", json("POST", dados), "Erro ao cadastrar o produto.");
}

export function atualizarProduto(id, dados) {
  return request(`/produtos/${id}`, json("PUT", dados), "Erro ao salvar o produto.");
}

export function atualizarParcialmente(id, alteracoes) {
  return request(`/produtos/${id}`, json("PATCH", alteracoes), "Erro ao atualizar o produto.");
}

export function excluirProduto(id) {
  return request(`/produtos/${id}`, { method: "DELETE" }, "Erro ao excluir o produto.");
}

export function listarMovimentacoes(id) {
  return request(`/produtos/${id}/movimentacoes`, undefined, "Erro ao carregar o histórico.");
}

export function registrarMovimentacao(id, dados) {
  return request(
    `/produtos/${id}/movimentacoes`,
    json("POST", dados),
    "Erro ao registrar a movimentação.",
  );
}
