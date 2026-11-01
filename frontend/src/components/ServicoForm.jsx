import { useState } from "react";
import { validarServico } from "../validation";

const ESTADO_INICIAL = { nome: "", url: "", ativo: true };

export default function ServicoForm({ onAdd }) {
  const [dados, setDados] = useState(ESTADO_INICIAL);
  const [erros, setErros] = useState({});

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setDados((atual) => ({ ...atual, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const novosErros = validarServico(dados);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) {
      return;
    }
    onAdd({ nome: dados.nome.trim(), url: dados.url.trim(), ativo: dados.ativo });
    setDados(ESTADO_INICIAL);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <h2 className="text-lg font-semibold text-slate-800">Novo serviço</h2>

      <div className="space-y-1">
        <label htmlFor="nome" className="block text-sm font-medium text-slate-700">
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          value={dados.nome}
          onChange={handleChange}
          placeholder="API Pagamentos"
          aria-invalid={Boolean(erros.nome)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        {erros.nome && (
          <p role="alert" className="text-sm text-red-600">
            {erros.nome}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="url" className="block text-sm font-medium text-slate-700">
          URL
        </label>
        <input
          id="url"
          name="url"
          type="url"
          value={dados.url}
          onChange={handleChange}
          placeholder="https://pagamentos.exemplo.com"
          aria-invalid={Boolean(erros.url)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        {erros.url && (
          <p role="alert" className="text-sm text-red-600">
            {erros.url}
          </p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          name="ativo"
          type="checkbox"
          checked={dados.ativo}
          onChange={handleChange}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600"
        />
        Ativo
      </label>

      <button
        type="submit"
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 sm:w-auto"
      >
        Cadastrar
      </button>
    </form>
  );
}
