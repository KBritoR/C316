import { formatarMoeda } from "../formatacao";

function Cartao({ titulo, valor, destaque = false }) {
  return (
    <div
      className={`rounded-xl p-4 shadow-sm ring-1 ${
        destaque ? "bg-amber-50 ring-amber-200" : "bg-white ring-slate-200"
      }`}
    >
      <p className="text-sm text-slate-500">{titulo}</p>
      <p
        className={`mt-1 text-2xl font-semibold ${destaque ? "text-amber-700" : "text-slate-900"}`}
      >
        {valor}
      </p>
    </div>
  );
}

export default function ResumoEstoque({ resumo }) {
  if (!resumo) {
    return null;
  }

  return (
    <section aria-label="Resumo do estoque" className="grid gap-4 sm:grid-cols-3">
      <Cartao titulo="Produtos cadastrados" valor={resumo.total_produtos} />
      <Cartao
        titulo="Com estoque baixo"
        valor={resumo.produtos_estoque_baixo}
        destaque={resumo.produtos_estoque_baixo > 0}
      />
      <Cartao titulo="Valor em estoque" valor={formatarMoeda(resumo.valor_total_estoque)} />
    </section>
  );
}
