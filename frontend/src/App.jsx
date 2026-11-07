import { useEffect, useState } from "react";
import ServicoForm from "./components/ServicoForm";
import ServicoList from "./components/ServicoList";
import { createServico, deleteServico, listServicos, updateServico } from "./services/servicos";

const FILTROS = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "ativos", rotulo: "Ativos" },
  { valor: "inativos", rotulo: "Inativos" },
];

export default function App() {
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState("");
  const [erroAcao, setErroAcao] = useState("");
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    listServicos()
      .then(setServicos)
      .catch((error) => setErroCarregamento(error.message))
      .finally(() => setCarregando(false));
  }, []);

  async function adicionarServico(dados) {
    const criado = await createServico(dados);
    setServicos((atuais) => [...atuais, criado]);
  }

  async function alternarAtivo(id) {
    const servico = servicos.find((s) => s.id === id);
    setErroAcao("");
    try {
      const atualizado = await updateServico(id, { ativo: !servico.ativo });
      setServicos((atuais) => atuais.map((s) => (s.id === id ? atualizado : s)));
    } catch (error) {
      setErroAcao(error.message);
    }
  }

  async function removerServico(id) {
    setErroAcao("");
    try {
      await deleteServico(id);
      setServicos((atuais) => atuais.filter((s) => s.id !== id));
    } catch (error) {
      setErroAcao(error.message);
    }
  }

  const visiveis = servicos.filter((s) => {
    if (filtro === "ativos") return s.ativo;
    if (filtro === "inativos") return !s.ativo;
    return true;
  });

  function renderLista() {
    if (carregando) {
      return <p className="text-slate-500">Carregando serviços...</p>;
    }
    if (erroCarregamento) {
      return (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
          {erroCarregamento}
        </p>
      );
    }
    return <ServicoList servicos={visiveis} onToggle={alternarAtivo} onRemove={removerServico} />;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Cadastro de Serviços</h1>
          <p className="mt-1 text-slate-600">
            Os serviços são salvos na API e persistem no PostgreSQL.
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

          {erroAcao && (
            <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
              {erroAcao}
            </p>
          )}

          {renderLista()}
        </section>
      </div>
    </main>
  );
}
