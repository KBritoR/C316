import { formatarMoeda } from "../formatacao";

export default function ProdutoList({
  produtos,
  selecionadoId,
  onSelecionar,
  onEditar,
  onExcluir,
}) {
  if (produtos.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
        Nenhum produto encontrado.
      </p>
    );
  }

  return (
    <ul aria-label="Produtos" className="space-y-3">
      {produtos.map((produto) => (
        <li
          key={produto.id}
          className={`rounded-xl bg-white p-4 shadow-sm ring-1 ${
            produto.id === selecionadoId ? "ring-2 ring-emerald-500" : "ring-slate-200"
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-900">{produto.nome}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {produto.categoria}
                </span>
                {produto.estoque_baixo && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    Estoque baixo
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Em estoque:{" "}
                <strong>
                  {produto.quantidade} {produto.unidade}
                </strong>{" "}
                · mínimo {produto.estoque_minimo} {produto.unidade} ·{" "}
                {formatarMoeda(produto.custo_unitario)}/{produto.unidade}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onSelecionar(produto)}
                aria-label={`Movimentar ${produto.nome}`}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
              >
                Movimentar
              </button>
              <button
                type="button"
                onClick={() => onEditar(produto)}
                aria-label={`Editar ${produto.nome}`}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onExcluir(produto)}
                aria-label={`Excluir ${produto.nome}`}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                Excluir
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
