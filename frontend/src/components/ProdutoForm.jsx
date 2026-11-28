import { useState } from "react";
import { produtoParaApi, UNIDADES, validarProduto } from "../validation";

const VAZIO = { nome: "", categoria: "", unidade: "kg", estoqueMinimo: "0", custoUnitario: "" };

function valoresIniciais(produto) {
  if (!produto) {
    return VAZIO;
  }
  return {
    nome: produto.nome,
    categoria: produto.categoria,
    unidade: produto.unidade,
    estoqueMinimo: String(produto.estoque_minimo),
    custoUnitario: String(produto.custo_unitario),
  };
}

const classeCampo =
  "w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200";

function Campo({ id, rotulo, erro, children }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {rotulo}
      </label>
      {children}
      {erro && (
        <p role="alert" className="text-sm text-red-600">
          {erro}
        </p>
      )}
    </div>
  );
}

export default function ProdutoForm({ produto, onSalvar, onCancelar }) {
  const [valores, setValores] = useState(() => valoresIniciais(produto));
  const [erros, setErros] = useState({});
  const [erroEnvio, setErroEnvio] = useState("");
  const [salvando, setSalvando] = useState(false);
  const editando = Boolean(produto);

  function alterar(event) {
    const { name, value } = event.target;
    setValores((atual) => ({ ...atual, [name]: value }));
  }

  async function enviar(event) {
    event.preventDefault();
    setErroEnvio("");
    const novosErros = validarProduto(valores);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) {
      return;
    }

    setSalvando(true);
    try {
      await onSalvar(produtoParaApi(valores));
      if (!editando) {
        setValores(VAZIO);
      }
    } catch (error) {
      setErroEnvio(error.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form
      onSubmit={enviar}
      noValidate
      aria-label={editando ? "Editar produto" : "Novo produto"}
      className="space-y-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
    >
      <h2 className="text-lg font-semibold text-slate-800">
        {editando ? `Editando: ${produto.nome}` : "Novo produto"}
      </h2>

      <Campo id="nome" rotulo="Nome" erro={erros.nome}>
        <input
          id="nome"
          name="nome"
          value={valores.nome}
          onChange={alterar}
          placeholder="Ex.: Arroz agulhinha"
          aria-invalid={Boolean(erros.nome)}
          className={classeCampo}
        />
      </Campo>

      <Campo id="categoria" rotulo="Categoria" erro={erros.categoria}>
        <input
          id="categoria"
          name="categoria"
          value={valores.categoria}
          onChange={alterar}
          placeholder="Ex.: Grãos, Carnes, Hortifruti"
          aria-invalid={Boolean(erros.categoria)}
          className={classeCampo}
        />
      </Campo>

      <div className="grid gap-4 sm:grid-cols-3">
        <Campo id="unidade" rotulo="Unidade" erro={erros.unidade}>
          <select
            id="unidade"
            name="unidade"
            value={valores.unidade}
            onChange={alterar}
            className={classeCampo}
          >
            {UNIDADES.map((u) => (
              <option key={u.valor} value={u.valor}>
                {u.rotulo}
              </option>
            ))}
          </select>
        </Campo>

        <Campo id="estoqueMinimo" rotulo="Estoque mínimo" erro={erros.estoqueMinimo}>
          <input
            id="estoqueMinimo"
            name="estoqueMinimo"
            inputMode="numeric"
            value={valores.estoqueMinimo}
            onChange={alterar}
            aria-invalid={Boolean(erros.estoqueMinimo)}
            className={classeCampo}
          />
        </Campo>

        <Campo id="custoUnitario" rotulo="Custo unitário (R$)" erro={erros.custoUnitario}>
          <input
            id="custoUnitario"
            name="custoUnitario"
            inputMode="decimal"
            value={valores.custoUnitario}
            onChange={alterar}
            placeholder="0,00"
            aria-invalid={Boolean(erros.custoUnitario)}
            className={classeCampo}
          />
        </Campo>
      </div>

      {erroEnvio && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {erroEnvio}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar produto"}
        </button>
        {editando && (
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
          >
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  );
}
