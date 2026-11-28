import { useCallback, useEffect, useState } from "react";
import { formatarDataHora } from "../formatacao";
import { listarMovimentacoes } from "../services/produtos";
import { validarMovimentacao } from "../validation";

const MOVIMENTACAO_VAZIA = { tipo: "entrada", quantidade: "", observacao: "" };

const classeCampo = "w-full rounded-lg border border-slate-300 px-3 py-2";

export default function ProdutoDetalhe({ produto, onMovimentar, onAjustarMinimo, onFechar }) {
  const [movimentacao, setMovimentacao] = useState(MOVIMENTACAO_VAZIA);
  const [erros, setErros] = useState({});
  const [erroMovimentacao, setErroMovimentacao] = useState("");
  const [registrando, setRegistrando] = useState(false);

  const [minimo, setMinimo] = useState(String(produto.estoque_minimo));
  const [erroMinimo, setErroMinimo] = useState("");

  const [historico, setHistorico] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(true);
  const [erroHistorico, setErroHistorico] = useState("");

  const carregarHistorico = useCallback(async () => {
    setCarregandoHistorico(true);
    setErroHistorico("");
    try {
      setHistorico(await listarMovimentacoes(produto.id));
    } catch (error) {
      setErroHistorico(error.message);
    } finally {
      setCarregandoHistorico(false);
    }
  }, [produto.id]);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  function alterarMovimentacao(event) {
    const { name, value } = event.target;
    setMovimentacao((atual) => ({ ...atual, [name]: value }));
  }

  async function registrar(event) {
    event.preventDefault();
    setErroMovimentacao("");
    const novosErros = validarMovimentacao(movimentacao);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) {
      return;
    }

    setRegistrando(true);
    try {
      await onMovimentar(produto, {
        tipo: movimentacao.tipo,
        quantidade: Number(movimentacao.quantidade),
        observacao: movimentacao.observacao.trim() || null,
      });
      setMovimentacao(MOVIMENTACAO_VAZIA);
      await carregarHistorico();
    } catch (error) {
      setErroMovimentacao(error.message);
    } finally {
      setRegistrando(false);
    }
  }

  async function salvarMinimo(event) {
    event.preventDefault();
    setErroMinimo("");
    if (!/^\d+$/.test(minimo.trim())) {
      setErroMinimo("O estoque mínimo deve ser um número inteiro, zero ou maior.");
      return;
    }
    try {
      await onAjustarMinimo(produto, Number(minimo.trim()));
    } catch (error) {
      setErroMinimo(error.message);
    }
  }

  return (
    <section
      aria-label={`Movimentações de ${produto.nome}`}
      className="space-y-5 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{produto.nome}</h2>
          <p className="text-sm text-slate-600">
            Saldo atual:{" "}
            <strong>
              {produto.quantidade} {produto.unidade}
            </strong>
          </p>
        </div>
        <button
          type="button"
          onClick={onFechar}
          className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
        >
          Fechar
        </button>
      </div>

      <form
        onSubmit={registrar}
        noValidate
        aria-label="Registrar movimentação"
        className="space-y-3"
      >
        <h3 className="font-medium text-slate-800">Registrar entrada ou saída</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="tipo" className="block text-sm font-medium text-slate-700">
              Tipo
            </label>
            <select
              id="tipo"
              name="tipo"
              value={movimentacao.tipo}
              onChange={alterarMovimentacao}
              className={classeCampo}
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="quantidade" className="block text-sm font-medium text-slate-700">
              Quantidade ({produto.unidade})
            </label>
            <input
              id="quantidade"
              name="quantidade"
              inputMode="numeric"
              value={movimentacao.quantidade}
              onChange={alterarMovimentacao}
              aria-invalid={Boolean(erros.quantidade)}
              className={classeCampo}
            />
          </div>
        </div>
        {erros.quantidade && (
          <p role="alert" className="text-sm text-red-600">
            {erros.quantidade}
          </p>
        )}
        <div className="space-y-1">
          <label htmlFor="observacao" className="block text-sm font-medium text-slate-700">
            Observação (opcional)
          </label>
          <input
            id="observacao"
            name="observacao"
            value={movimentacao.observacao}
            onChange={alterarMovimentacao}
            placeholder="Ex.: compra do fornecedor, uso no almoço"
            className={classeCampo}
          />
        </div>
        {erros.observacao && (
          <p role="alert" className="text-sm text-red-600">
            {erros.observacao}
          </p>
        )}
        {erroMovimentacao && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {erroMovimentacao}
          </p>
        )}
        <button
          type="submit"
          disabled={registrando}
          className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {registrando ? "Registrando..." : "Registrar"}
        </button>
      </form>

      <form onSubmit={salvarMinimo} aria-label="Ajustar estoque mínimo" className="space-y-1">
        <label htmlFor="ajuste-minimo" className="block text-sm font-medium text-slate-700">
          Estoque mínimo ({produto.unidade})
        </label>
        <div className="flex gap-2">
          <input
            id="ajuste-minimo"
            inputMode="numeric"
            value={minimo}
            onChange={(event) => setMinimo(event.target.value)}
            className={classeCampo}
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Salvar mínimo
          </button>
        </div>
        {erroMinimo && (
          <p role="alert" className="text-sm text-red-600">
            {erroMinimo}
          </p>
        )}
      </form>

      <div className="space-y-2">
        <h3 className="font-medium text-slate-800">Histórico</h3>
        {carregandoHistorico && <p className="text-sm text-slate-500">Carregando histórico...</p>}
        {erroHistorico && (
          <p role="alert" className="text-sm text-red-600">
            {erroHistorico}
          </p>
        )}
        {!carregandoHistorico && !erroHistorico && historico.length === 0 && (
          <p className="text-sm text-slate-500">Nenhuma movimentação registrada.</p>
        )}
        {historico.length > 0 && (
          <ul aria-label="Histórico de movimentações" className="divide-y divide-slate-100">
            {historico.map((m) => (
              <li key={m.id} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
                <span className={m.tipo === "entrada" ? "text-emerald-700" : "text-red-700"}>
                  {m.tipo === "entrada" ? "Entrada" : "Saída"} de {m.quantidade} {produto.unidade}
                  {m.observacao && <span className="text-slate-500"> · {m.observacao}</span>}
                </span>
                <span className="text-slate-500">
                  saldo {m.saldo_apos} · {formatarDataHora(m.criado_em)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
