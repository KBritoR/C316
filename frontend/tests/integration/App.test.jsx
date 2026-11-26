import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "../../src/App";
import { jsonResponse, produtoExemplo } from "../helpers";

// API falsa: responde como o backend (mesmas rotas e regras), guardando os dados em memoria.
function stubApi(produtosIniciais = []) {
  let produtos = produtosIniciais.map((p) => ({ ...p }));
  let movimentacoes = [];
  let proximoId = produtos.length + 1;

  const comStatus = (p) => ({ ...p, estoque_baixo: p.quantidade <= p.estoque_minimo });

  const fetchMock = vi.fn(async (endereco, options = {}) => {
    const url = new URL(endereco);
    const metodo = options.method ?? "GET";
    const corpo = options.body ? JSON.parse(options.body) : null;
    const [, recurso, idTexto, sub] = url.pathname.split("/");
    const id = Number(idTexto);
    const produto = produtos.find((p) => p.id === id);

    if (recurso === "estoque") {
      return jsonResponse({
        total_produtos: produtos.length,
        produtos_estoque_baixo: produtos.filter((p) => comStatus(p).estoque_baixo).length,
        valor_total_estoque: produtos.reduce((t, p) => t + p.quantidade * p.custo_unitario, 0),
      });
    }

    if (sub === "movimentacoes") {
      if (metodo === "GET") {
        return jsonResponse(movimentacoes.filter((m) => m.produto_id === id).reverse());
      }
      const saldo =
        corpo.tipo === "entrada"
          ? produto.quantidade + corpo.quantidade
          : produto.quantidade - corpo.quantidade;
      if (saldo < 0) {
        return jsonResponse(
          {
            detail: `Estoque insuficiente: saldo atual ${produto.quantidade}, saída solicitada ${corpo.quantidade}`,
          },
          409,
        );
      }
      produto.quantidade = saldo;
      const mov = {
        id: movimentacoes.length + 1,
        produto_id: id,
        ...corpo,
        saldo_apos: saldo,
        criado_em: "2026-11-25T12:00:00Z",
      };
      movimentacoes = [...movimentacoes, mov];
      return jsonResponse(mov, 201);
    }

    const nomeRepetido = (nome) =>
      produtos.some((p) => p.nome.toLowerCase() === nome.toLowerCase() && p.id !== id);

    if (metodo === "POST") {
      if (nomeRepetido(corpo.nome)) {
        return jsonResponse({ detail: "Já existe um produto com esse nome" }, 409);
      }
      const novo = {
        id: proximoId++,
        ...corpo,
        custo_unitario: Number(corpo.custo_unitario),
        quantidade: 0,
      };
      produtos = [...produtos, novo];
      return jsonResponse(comStatus(novo), 201);
    }
    if (metodo === "PUT" || metodo === "PATCH") {
      Object.assign(produto, corpo, {
        custo_unitario: Number(corpo.custo_unitario ?? produto.custo_unitario),
      });
      return jsonResponse(comStatus(produto));
    }
    if (metodo === "DELETE") {
      if (produto.quantidade > 0) {
        return jsonResponse(
          {
            detail: `Não é possível excluir um produto com ${produto.quantidade} em estoque; registre a saída antes de excluir`,
          },
          409,
        );
      }
      produtos = produtos.filter((p) => p.id !== id);
      return jsonResponse(null, 204);
    }
    if (idTexto) {
      return jsonResponse(comStatus(produto));
    }

    const busca = url.searchParams.get("busca");
    const baixo = url.searchParams.get("estoque_baixo");
    const lista = produtos
      .map(comStatus)
      .filter((p) => !busca || p.nome.toLowerCase().includes(busca.toLowerCase()))
      .filter((p) => !baixo || p.estoque_baixo);
    return jsonResponse(lista);
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function chamadas(fetchMock, metodo) {
  return fetchMock.mock.calls.filter(([, options]) => (options?.method ?? "GET") === metodo);
}

const ARROZ = produtoExemplo();
const FEIJAO = produtoExemplo({ id: 2, nome: "Feijão", quantidade: 2, estoque_minimo: 5 });

async function abrirApp(produtos = [ARROZ, FEIJAO]) {
  const fetchMock = stubApi(produtos);
  render(<App />);
  await waitFor(() => expect(screen.queryByText("Carregando produtos...")).not.toBeInTheDocument());
  return fetchMock;
}

describe("App", () => {
  it("mostra 'Carregando' e depois os produtos e o resumo vindos da API", async () => {
    stubApi([ARROZ, FEIJAO]);
    render(<App />);

    expect(screen.getByText("Carregando produtos...")).toBeInTheDocument();
    const lista = await screen.findByRole("list", { name: "Produtos" });
    expect(within(lista).getAllByRole("listitem")).toHaveLength(2);
    const resumo = screen.getByRole("region", { name: "Resumo do estoque" });
    expect(within(resumo).getByText("2")).toBeInTheDocument();
  });

  it("mostra o estado vazio quando não há produtos", async () => {
    stubApi([]);
    render(<App />);

    expect(await screen.findByText("Nenhum produto encontrado.")).toBeInTheDocument();
  });

  it("mostra erro de conexão e permite tentar novamente", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível conectar à API.");

    stubApi([ARROZ]);
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByText("Arroz")).toBeInTheDocument();
  });

  it("cadastra um produto (POST) e mostra a mensagem de sucesso", async () => {
    const user = userEvent.setup();
    const fetchMock = await abrirApp([]);

    await user.type(screen.getByLabelText("Nome"), "Alcatra");
    await user.type(screen.getByLabelText("Categoria"), "Carnes");
    await user.type(screen.getByLabelText("Custo unitário (R$)"), "45,90");
    await user.click(screen.getByRole("button", { name: "Cadastrar produto" }));

    expect(await screen.findByRole("status")).toHaveTextContent('Produto "Alcatra" cadastrado.');
    expect(await screen.findByText("Alcatra")).toBeInTheDocument();
    const [, options] = chamadas(fetchMock, "POST")[0];
    expect(JSON.parse(options.body)).toMatchObject({ nome: "Alcatra", custo_unitario: "45.90" });
  });

  it("mostra a mensagem do 409 ao cadastrar um nome repetido", async () => {
    const user = userEvent.setup();
    await abrirApp();

    await user.type(screen.getByLabelText("Nome"), "arroz");
    await user.type(screen.getByLabelText("Categoria"), "Grãos");
    await user.type(screen.getByLabelText("Custo unitário (R$)"), "6");
    await user.click(screen.getByRole("button", { name: "Cadastrar produto" }));

    expect(await screen.findByText("Já existe um produto com esse nome")).toBeInTheDocument();
  });

  it("edita um produto (PUT)", async () => {
    const user = userEvent.setup();
    const fetchMock = await abrirApp();

    await user.click(screen.getByRole("button", { name: "Editar Arroz" }));
    const nome = screen.getByLabelText("Nome");
    await user.clear(nome);
    await user.type(nome, "Arroz integral");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(await screen.findByRole("status")).toHaveTextContent("atualizado");
    expect(await screen.findByText("Arroz integral")).toBeInTheDocument();
    expect(chamadas(fetchMock, "PUT")[0][0]).toBe("http://localhost:8000/produtos/1");
  });

  it("exclui um produto zerado (DELETE) e mostra o 409 quando ainda tem estoque", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await abrirApp([ARROZ, produtoExemplo({ id: 2, nome: "Sal", quantidade: 0 })]);

    await user.click(screen.getByRole("button", { name: "Excluir Arroz" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não é possível excluir um produto com 10 em estoque",
    );

    await user.click(screen.getByRole("button", { name: "Excluir Sal" }));
    expect(await screen.findByRole("status")).toHaveTextContent('Produto "Sal" excluído.');
    expect(screen.queryByText("Sal")).not.toBeInTheDocument();
  });

  it("não exclui quando o usuário cancela a confirmação", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const fetchMock = await abrirApp();

    await user.click(screen.getByRole("button", { name: "Excluir Arroz" }));

    expect(chamadas(fetchMock, "DELETE")).toHaveLength(0);
  });

  it("envia os filtros para a API e mostra só o resultado", async () => {
    const user = userEvent.setup();
    const fetchMock = await abrirApp();

    await user.click(screen.getByLabelText("Só estoque baixo"));
    await user.click(screen.getByRole("button", { name: "Filtrar" }));

    expect(await screen.findByText("Feijão")).toBeInTheDocument();
    expect(screen.queryByText("Arroz")).not.toBeInTheDocument();
    const urls = chamadas(fetchMock, "GET").map(([url]) => url);
    expect(urls).toContain("http://localhost:8000/produtos?estoque_baixo=true");
  });

  it("registra uma entrada, atualiza o saldo e mostra no histórico", async () => {
    const user = userEvent.setup();
    await abrirApp();

    await user.click(screen.getByRole("button", { name: "Movimentar Feijão" }));
    const painel = await screen.findByRole("region", { name: "Movimentações de Feijão" });
    expect(await within(painel).findByText("Nenhuma movimentação registrada.")).toBeInTheDocument();

    await user.type(within(painel).getByLabelText(/Quantidade/), "8");
    await user.type(within(painel).getByLabelText(/Observação/), "compra semanal");
    await user.click(within(painel).getByRole("button", { name: "Registrar" }));

    expect(await screen.findByRole("status")).toHaveTextContent('Entrada de 8 kg em "Feijão".');
    expect(await within(painel).findByText(/Entrada de 8 kg/)).toBeInTheDocument();
    expect(within(painel).getByText("10 kg")).toBeInTheDocument();
  });

  it("mostra o 409 de estoque insuficiente numa saída maior que o saldo", async () => {
    const user = userEvent.setup();
    await abrirApp();

    await user.click(screen.getByRole("button", { name: "Movimentar Feijão" }));
    const painel = await screen.findByRole("region", { name: "Movimentações de Feijão" });
    await user.selectOptions(within(painel).getByLabelText("Tipo"), "saida");
    await user.type(within(painel).getByLabelText(/Quantidade/), "5");
    await user.click(within(painel).getByRole("button", { name: "Registrar" }));

    expect(
      await within(painel).findByText("Estoque insuficiente: saldo atual 2, saída solicitada 5"),
    ).toBeInTheDocument();
  });

  it("ajusta o estoque mínimo (PATCH)", async () => {
    const user = userEvent.setup();
    const fetchMock = await abrirApp();

    await user.click(screen.getByRole("button", { name: "Movimentar Arroz" }));
    const painel = await screen.findByRole("region", { name: "Movimentações de Arroz" });
    const minimo = within(painel).getByLabelText(/Estoque mínimo/);
    await user.clear(minimo);
    await user.type(minimo, "20");
    await user.click(within(painel).getByRole("button", { name: "Salvar mínimo" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Estoque mínimo de");
    const [, options] = chamadas(fetchMock, "PATCH")[0];
    expect(JSON.parse(options.body)).toEqual({ estoque_minimo: 20 });
  });
});
