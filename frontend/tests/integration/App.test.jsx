import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "../../src/App";
import { jsonResponse } from "../helpers";

const PAGAMENTOS = {
  id: 1,
  nome: "API Pagamentos",
  url: "https://pagamentos.exemplo.com",
  ativo: true,
};
const LEGADO = { id: 2, nome: "API Legado", url: "https://legado.exemplo.com", ativo: false };

function stubApi(servicosIniciais = []) {
  let servicos = [...servicosIniciais];
  let proximoId = servicos.length + 1;

  const fetchMock = vi.fn(async (url, options = {}) => {
    const metodo = options.method ?? "GET";
    const id = Number(url.split("/servicos/")[1]);

    if (metodo === "POST") {
      const dados = JSON.parse(options.body);
      if (servicos.some((s) => s.nome === dados.nome)) {
        return jsonResponse({ detail: "Já existe um serviço com esse nome" }, 409);
      }
      const criado = { id: proximoId++, ...dados };
      servicos = [...servicos, criado];
      return jsonResponse(criado, 201);
    }
    if (metodo === "PATCH") {
      const atualizado = { ...servicos.find((s) => s.id === id), ...JSON.parse(options.body) };
      servicos = servicos.map((s) => (s.id === id ? atualizado : s));
      return jsonResponse(atualizado);
    }
    if (metodo === "DELETE") {
      servicos = servicos.filter((s) => s.id !== id);
      return jsonResponse(null, 204);
    }
    return jsonResponse(servicos);
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function cadastrar(user, nome, url) {
  await user.type(screen.getByLabelText("Nome"), nome);
  await user.type(screen.getByLabelText("URL"), url);
  await user.click(screen.getByRole("button", { name: "Cadastrar" }));
}

describe("App (formulário + lista + API mockada)", () => {
  it("mostra 'Carregando' até a API responder e depois a lista", async () => {
    let responder;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise((resolve) => {
            responder = resolve;
          }),
      ),
    );
    render(<App />);

    expect(screen.getByText("Carregando serviços...")).toBeInTheDocument();

    responder(jsonResponse([PAGAMENTOS]));

    expect(await screen.findByText("API Pagamentos")).toBeInTheDocument();
    expect(screen.queryByText("Carregando serviços...")).not.toBeInTheDocument();
  });

  it("mostra o estado vazio quando a API não tem serviços", async () => {
    stubApi([]);
    render(<App />);

    expect(await screen.findByText("Nenhum serviço cadastrado.")).toBeInTheDocument();
  });

  it("mostra os serviços vindos da API", async () => {
    stubApi([PAGAMENTOS, LEGADO]);
    render(<App />);

    const lista = await screen.findByRole("list", { name: "Serviços cadastrados" });
    expect(within(lista).getAllByRole("listitem")).toHaveLength(2);
    expect(within(lista).getByText("API Legado")).toBeInTheDocument();
  });

  it("mostra erro quando não consegue conectar à API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível conectar à API.");
  });

  it("cadastra enviando POST e adiciona o serviço criado na lista", async () => {
    const user = userEvent.setup();
    const fetchMock = stubApi([]);
    render(<App />);
    await screen.findByText("Nenhum serviço cadastrado.");

    await cadastrar(user, "API Pagamentos", "https://pagamentos.exemplo.com");

    const lista = await screen.findByRole("list", { name: "Serviços cadastrados" });
    expect(within(lista).getByText("API Pagamentos")).toBeInTheDocument();
    const [, options] = fetchMock.mock.calls.find(([, opts]) => opts?.method === "POST");
    expect(JSON.parse(options.body)).toEqual({
      nome: "API Pagamentos",
      url: "https://pagamentos.exemplo.com",
      ativo: true,
    });
  });

  it("mostra a mensagem do 409 ao cadastrar nome repetido", async () => {
    const user = userEvent.setup();
    stubApi([PAGAMENTOS]);
    render(<App />);
    await screen.findByText("API Pagamentos");

    await cadastrar(user, "API Pagamentos", "https://outra.exemplo.com");

    expect(await screen.findByText("Já existe um serviço com esse nome")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("não chama a API quando o formulário é inválido", async () => {
    const user = userEvent.setup();
    const fetchMock = stubApi([]);
    render(<App />);
    await screen.findByText("Nenhum serviço cadastrado.");

    await cadastrar(user, "API", "exemplo.com");

    expect(screen.getByText("A URL deve começar com http:// ou https://.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("filtra por status e alterna ativo enviando PATCH", async () => {
    const user = userEvent.setup();
    const fetchMock = stubApi([PAGAMENTOS, LEGADO]);
    render(<App />);
    await screen.findByText("API Pagamentos");

    await user.click(screen.getByRole("button", { name: "Ativos" }));
    expect(screen.queryByText("API Legado")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Desativar API Pagamentos" }));

    expect(await screen.findByText("Nenhum serviço cadastrado.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/servicos/1",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ ativo: false }) }),
    );
  });

  it("remove um serviço enviando DELETE", async () => {
    const user = userEvent.setup();
    const fetchMock = stubApi([PAGAMENTOS]);
    render(<App />);
    await screen.findByText("API Pagamentos");

    await user.click(screen.getByRole("button", { name: "Remover API Pagamentos" }));

    expect(await screen.findByText("Nenhum serviço cadastrado.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/servicos/1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
