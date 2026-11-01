import { useState } from "react";
import ServicoForm from "./components/ServicoForm";
import ServicoList from "./components/ServicoList";

const FILTROS = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "ativos", rotulo: "Ativos" },
  { valor: "inativos", rotulo: "Inativos" },
];

export default function App() {
  const [servicos, setServicos] = useState([]);
  const [proximoId, setProximoId] = useState(1);
  const [filtro, setFiltro] = useState("todos");

  function adicionarServico(servico) {
    setServicos((atuais) => [...atuais, { id: proximoId, ...servico }]);
    setProximoId((id) => id + 1);
  }

  function alternarAtivo(id) {
    setServicos((atuais) => atuais.map((s) => (s.id === id ? { ...s, ativo: !s.ativo } : s)));
  }

  function removerServico(id) {
    setServicos((atuais) => atuais.filter((s) => s.id !== id));
  }

  const visiveis = servicos.filter((s) => {
    if (filtro === "ativos") return s.ativo;
    if (filtro === "inativos") return !s.ativo;
    return true;
  });

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Cadastro de Serviços</h1>
          <p className="mt-1 text-slate-600">
            Os dados ficam só em memória e somem ao recarregar a página.
          </p>
        </header>

        <ServicoForm onAdd={adicionarServico} />

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Serviços <span className="text-slate-500">({servicos.length})</span>
            </h2>
            <fieldset className="flex gap-2">
              <legend className="sr-only">Filtrar por status</legend>
              {FILTROS.map(({ valor, rotulo }) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setFiltro(valor)}
                  aria-pressed={filtro === valor}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    filtro === valor
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {rotulo}
                </button>
              ))}
            </fieldset>
          </div>

          <ServicoList servicos={visiveis} onToggle={alternarAtivo} onRemove={removerServico} />
        </section>
      </div>
    </main>
  );
}
