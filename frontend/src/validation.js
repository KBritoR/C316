export function validarServico({ nome, url }) {
  const erros = {};

  if (!nome?.trim()) {
    erros.nome = "O nome é obrigatório.";
  }

  const urlLimpa = url ? url.trim() : "";
  if (!urlLimpa) {
    erros.url = "A URL é obrigatória.";
  } else if (!urlLimpa.startsWith("http://") && !urlLimpa.startsWith("https://")) {
    erros.url = "A URL deve começar com http:// ou https://.";
  }

  return erros;
}
