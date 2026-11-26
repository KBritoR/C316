// Mesmas regras do backend, so para dar retorno rapido na tela.
// O backend continua sendo quem decide (ele valida de novo).

export const UNIDADES = [
  { valor: "un", rotulo: "Unidade (un)" },
  { valor: "kg", rotulo: "Quilo (kg)" },
  { valor: "g", rotulo: "Grama (g)" },
  { valor: "l", rotulo: "Litro (l)" },
  { valor: "ml", rotulo: "Mililitro (ml)" },
  { valor: "cx", rotulo: "Caixa (cx)" },
];

function ehInteiroNaoNegativo(valor) {
  return /^\d+$/.test(String(valor).trim());
}

export function validarProduto({ nome, categoria, unidade, estoqueMinimo, custoUnitario }) {
  const erros = {};

  if (!nome?.trim()) {
    erros.nome = "O nome é obrigatório.";
  } else if (nome.trim().length > 100) {
    erros.nome = "O nome pode ter no máximo 100 caracteres.";
  }

  if (!categoria?.trim()) {
    erros.categoria = "A categoria é obrigatória.";
  } else if (categoria.trim().length > 50) {
    erros.categoria = "A categoria pode ter no máximo 50 caracteres.";
  }

  if (!UNIDADES.some((u) => u.valor === unidade)) {
    erros.unidade = "Escolha uma unidade de medida.";
  }

  if (!ehInteiroNaoNegativo(estoqueMinimo)) {
    erros.estoqueMinimo = "O estoque mínimo deve ser um número inteiro, zero ou maior.";
  }

  const custo = String(custoUnitario ?? "")
    .trim()
    .replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(custo)) {
    erros.custoUnitario = "Informe o custo com no máximo 2 casas decimais (ex.: 6,50).";
  }

  return erros;
}

export function validarMovimentacao({ quantidade, observacao }) {
  const erros = {};
  const texto = String(quantidade ?? "").trim();

  if (!/^\d+$/.test(texto) || Number(texto) <= 0) {
    erros.quantidade = "A quantidade deve ser um número inteiro maior que zero.";
  }

  if (observacao && observacao.length > 200) {
    erros.observacao = "A observação pode ter no máximo 200 caracteres.";
  }

  return erros;
}

// Converte os valores do formulario (texto) para o formato que a API espera.
export function produtoParaApi({ nome, categoria, unidade, estoqueMinimo, custoUnitario }) {
  return {
    nome: nome.trim(),
    categoria: categoria.trim(),
    unidade,
    estoque_minimo: Number(String(estoqueMinimo).trim()),
    custo_unitario: String(custoUnitario).trim().replace(",", "."),
  };
}
