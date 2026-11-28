import { useCallback, useEffect, useState } from "react";
import ProdutoDetalhe from "./components/ProdutoDetalhe";
import ProdutoFiltros from "./components/ProdutoFiltros";
import ProdutoForm from "./components/ProdutoForm";
import ProdutoList from "./components/ProdutoList";
import ResumoEstoque from "./components/ResumoEstoque";
import { obterResumo } from "./services/estoque";
import {
  atualizarParcialmente,
  atualizarProduto,
  criarProduto,
  excluirProduto,
  listarProdutos,
  obterProduto,
  registrarMovimentacao,
} from "./services/produtos";

export default function App() {
  const [produtos, setProdutos] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [filtros, setFiltros] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState("");
  const [aviso, setAviso] = useState(null);
  const [editando, setEditando] = useState(null);
  const [selecionadoId, setSelecionadoId] = useState(null);

  const carregar = useCallback(async (filtrosAtuais) => {
    setCarregando(true);
    setErroCarregamento("");
    try {
      const [lista, novoResumo] = await Promise.all([listarProdutos(filtrosAtuais), obterResumo()]);
      setProdutos(lista);
      setResumo(novoResumo);
    } catch (error) {
      setErroCarregamento(error.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar(filtros);
  }, [carregar, filtros]);

  function mostrarSucesso(texto) {
    setAviso({ tipo: "sucesso", texto });
  }

  async function salvarProduto(dados) {
    setAviso(null);
    if (editando) {
      await atualizarProduto(editando.id, dados);
      setEditando(null);
      mostrarSucesso(`Produto "${dados.nome}" atualizado.`);
    } else {
      await criarProduto(dados);
      mostrarSucesso(`Produto "${dados.nome}" cadastrado.`);
    }
    await carregar(filtros);
  }

  async function excluir(produto) {
    setAviso(null);
    if (!window.confirm(`Excluir o produto "${produto.nome}"?`)) {
      return;
    }
    try {
      await excluirProduto(produto.id);
      if (selecionadoId === produto.id) setSelecionadoId(null);
      if (editando?.id === produto.id) setEditando(null);
      mostrarSucesso(`Produto "${produto.nome}" excluído.`);
      await carregar(filtros);
    } catch (error) {
      setAviso({ tipo: "erro", texto: error.message });
    }
  }

  // Depois de uma alteracao, busca o produto atualizado e o resumo na API.
  async function atualizarNaTela(id) {
    const [atualizado, novoResumo] = await Promise.all([obterProduto(id), obterResumo()]);
    setProdutos((atuais) => atuais.map((p) => (p.id === id ? atualizado : p)));
    setResumo(novoResumo);
  }

  async function movimentar(produto, dados) {
    setAviso(null);
    await registrarMovimentacao(produto.id, dados);
    const tipo = dados.tipo === "entrada" ? "Entrada" : "Saída";
    mostrarSucesso(`${tipo} de ${dados.quantidade} ${produto.unidade} em "${produto.nome}".`);
    await atualizarNaTela(produto.id);
  }

  async function ajustarMinimo(produto, estoqueMinimo) {
    setAviso(null);
    await atualizarParcialmente(produto.id, { estoque_minimo: estoqueMinimo });
    mostrarSucesso(`Estoque mínimo de "${produto.nome}" atualizado.`);
    await atualizarNaTela(produto.id);
  }

  const selecionado = produtos.find((p) => p.id === selecionadoId);

  function renderLista() {
    if (carregando && produtos.length === 0) {
      return <p className="text-slate-500">Carregando produtos...</p>;
    }
    if (erroCarregamento) {
      return (
        <div role="alert" className="space-y-2 rounded-xl bg-red-50 p-4 text-red-700">
          <p>{erroCarregamento}</p>
          <button
            type="button"
            onClick={() => carregar(filtros)}
            className="rounded-lg border border-red-300 px-3 py-1 text-sm hover:bg-red-100"
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return (
      <ProdutoList
        produtos={produtos}
        selecionadoId={selecionadoId}
        onSelecionar={(produto) => setSelecionadoId(produto.id)}
        onEditar={(produto) => setEditando(produto)}
        onExcluir={excluir}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Controle de Estoque</h1>
          <p className="text-slate-600">Matérias-primas do restaurante</p>
        </header>

        <ResumoEstoque resumo={resumo} />

        {aviso && (
          <div
            role={aviso.tipo === "erro" ? "alert" : "status"}
            className={`flex items-start justify-between gap-3 rounded-xl p-4 ${
              aviso.tipo === "erro" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"
            }`}
          >
            <p>{aviso.texto}</p>
            <button
              type="button"
              onClick={() => setAviso(null)}
              aria-label="Fechar aviso"
              className="text-sm underline"
            >
              Fechar
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            <ProdutoForm
              key={editando?.id ?? "novo"}
              produto={editando}
              onSalvar={salvarProduto}
              onCancelar={() => setEditando(null)}
            />
            {selecionado && (
              <ProdutoDetalhe
                key={selecionado.id}
                produto={selecionado}
                onMovimentar={movimentar}
                onAjustarMinimo={ajustarMinimo}
                onFechar={() => setSelecionadoId(null)}
              />
            )}
          </div>

          <section aria-label="Lista de produtos" className="space-y-4 lg:col-span-3">
            <ProdutoFiltros onFiltrar={setFiltros} />
            {renderLista()}
          </section>
        </div>
      </div>
    </main>
  );
}
