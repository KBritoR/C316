const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const dataHora = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function formatarMoeda(valor) {
  return moeda.format(Number(valor));
}

export function formatarDataHora(iso) {
  return dataHora.format(new Date(iso));
}
