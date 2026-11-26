import { useState } from "react";

const SEM_FILTRO = { busca: "", categoria: "", estoqueBaixo: false };

export default function ProdutoFiltros({ onFiltrar }) {
  const [filtros, setFiltros] = useState(SEM_FILTRO);

  function alterar(event) {
    const { name, value, type, checked } = event.target;
    setFiltros((atual) => ({ ...atual, [name]: type === "checkbox" ? checked : value }));
  }

  function aplicar(event) {
    event.preventDefault();
    onFiltrar({
      busca: filtros.busca.trim(),
      categoria: filtros.categoria.trim(),
      estoqueBaixo: filtros.estoqueBaixo,
    });
  }

  function limpar() {
    setFiltros(SEM_FILTRO);
    onFiltrar(SEM_FILTRO);
  }

  return (
    <form
      onSubmit={aplicar}
      aria-label="Filtros"
      className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <div className="flex-1 space-y-1">
        <label htmlFor="busca" className="block text-sm font-medium text-slate-700">
          Buscar por nome
        </label>
        <input
          id="busca"
          name="busca"
          value={filtros.busca}
          onChange={alterar}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>
      <div className="flex-1 space-y-1">
        <label htmlFor="filtro-categoria" className="block text-sm font-medium text-slate-700">
          Filtrar por categoria
        </label>
        <input
          id="filtro-categoria"
          name="categoria"
          value={filtros.categoria}
          onChange={alterar}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700 sm:pb-2">
        <input
          type="checkbox"
          name="estoqueBaixo"
          checked={filtros.estoqueBaixo}
          onChange={alterar}
          className="h-4 w-4"
        />
        Só estoque baixo
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
        >
          Filtrar
        </button>
        <button
          type="button"
          onClick={limpar}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
        >
          Limpar
        </button>
      </div>
    </form>
  );
}
