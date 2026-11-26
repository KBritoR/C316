export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const ERRO_CONEXAO = "Não foi possível conectar à API.";

// Trata os tres cenarios de uma chamada: API fora do ar, resposta de erro e sucesso.
export async function request(caminho, options, mensagemPadrao) {
  let response;
  try {
    response = await fetch(`${API_URL}${caminho}`, options);
  } catch {
    throw new Error(ERRO_CONEXAO);
  }

  if (!response.ok) {
    let detalhe;
    try {
      detalhe = (await response.json()).detail;
    } catch {
      detalhe = undefined;
    }
    // 404/409 trazem um texto em "detail"; o 422 traz uma lista de erros de validacao.
    throw new Error(typeof detalhe === "string" ? detalhe : mensagemPadrao);
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export function json(method, corpo) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  };
}
