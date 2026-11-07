export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const SERVICOS_URL = `${API_URL}/servicos`;

export const ERRO_CONEXAO = "Não foi possível conectar à API.";

async function request(url, options, mensagemPadrao) {
  let response;
  try {
    response = await fetch(url, options);
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
    throw new Error(typeof detalhe === "string" ? detalhe : mensagemPadrao);
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
}

function jsonOptions(method, body) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export function listServicos() {
  return request(SERVICOS_URL, undefined, "Erro ao carregar os serviços.");
}

export function createServico({ nome, url, ativo }) {
  return request(
    SERVICOS_URL,
    jsonOptions("POST", { nome, url, ativo }),
    "Erro ao cadastrar o serviço.",
  );
}

export function updateServico(id, alteracoes) {
  return request(
    `${SERVICOS_URL}/${id}`,
    jsonOptions("PATCH", alteracoes),
    "Erro ao atualizar o serviço.",
  );
}

export function deleteServico(id) {
  return request(`${SERVICOS_URL}/${id}`, { method: "DELETE" }, "Erro ao remover o serviço.");
}
