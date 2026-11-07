export default function ServicoList({ servicos, onToggle, onRemove }) {
  if (servicos.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
        Nenhum serviço cadastrado.
      </p>
    );
  }

  return (
    <ul aria-label="Serviços cadastrados" className="space-y-3">
      {servicos.map((servico) => (
        <li
          key={servico.id}
          className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-800">{servico.nome}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  servico.ativo ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                }`}
              >
                {servico.ativo ? "Ativo" : "Inativo"}
              </span>
            </div>
            <span className="block truncate text-sm text-slate-500">{servico.url}</span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onToggle(servico.id)}
              aria-label={`${servico.ativo ? "Desativar" : "Ativar"} ${servico.nome}`}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              {servico.ativo ? "Desativar" : "Ativar"}
            </button>
            <button
              type="button"
              onClick={() => onRemove(servico.id)}
              aria-label={`Remover ${servico.nome}`}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
            >
              Remover
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
