// Monta uma resposta no formato que o fetch devolve, para os testes com fetch mockado.
export function jsonResponse(dados, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => dados,
  };
}

export function produtoExemplo(sobrescrever = {}) {
  return {
    id: 1,
    nome: "Arroz",
    categoria: "Grãos",
    unidade: "kg",
    estoque_minimo: 5,
    custo_unitario: 6.5,
    quantidade: 10,
    estoque_baixo: false,
    ...sobrescrever,
  };
}
