import { request } from "./api";

export function obterResumo() {
  return request("/estoque/resumo", undefined, "Erro ao carregar o resumo do estoque.");
}
