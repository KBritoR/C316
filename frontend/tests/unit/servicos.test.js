import { describe, expect, it, vi } from "vitest";
import {
  createServico,
  deleteServico,
  ERRO_CONEXAO,
  listServicos,
  updateServico,
} from "../../src/services/servicos";
import { jsonResponse } from "../helpers";

const SERVICO = {
  id: 1,
  nome: "API Pagamentos",
  url: "https://pagamentos.exemplo.com",
  ativo: true,
};

describe("services/servicos", () => {
  it("listServicos faz GET em /servicos e devolve o JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([SERVICO]));
    vi.stubGlobal("fetch", fetchMock);

    await expect(listServicos()).resolves.toEqual([SERVICO]);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/servicos", undefined);
  });

  it("createServico faz POST com o corpo em JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(SERVICO, 201));
    vi.stubGlobal("fetch", fetchMock);

    await createServico({
      nome: "API Pagamentos",
      url: "https://pagamentos.exemplo.com",
      ativo: true,
    });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:8000/servicos");
    expect(options.method).toBe("POST");
    expect(options.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(options.body)).toEqual({
      nome: "API Pagamentos",
      url: "https://pagamentos.exemplo.com",
      ativo: true,
    });
  });

  it("updateServico faz PATCH no id e deleteServico faz DELETE", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ ...SERVICO, ativo: false }))
      .mockResolvedValueOnce(jsonResponse(null, 204));
    vi.stubGlobal("fetch", fetchMock);

    await expect(updateServico(1, { ativo: false })).resolves.toMatchObject({ ativo: false });
    await expect(deleteServico(1)).resolves.toBeNull();

    expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:8000/servicos/1");
    expect(fetchMock.mock.calls[0][1].method).toBe("PATCH");
    expect(fetchMock.mock.calls[1][1].method).toBe("DELETE");
  });

  it("lança erro de conexão quando a API está inacessível", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(listServicos()).rejects.toThrow(ERRO_CONEXAO);
  });

  it("usa o detail da API quando a resposta é um erro com texto", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(jsonResponse({ detail: "Já existe um serviço com esse nome" }, 409)),
    );

    await expect(
      createServico({ nome: "API", url: "https://exemplo.com", ativo: true }),
    ).rejects.toThrow("Já existe um serviço com esse nome");
  });

  it("usa a mensagem padrão quando o detail não é texto (ex.: 422)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ detail: [{ msg: "invalido" }] }, 422)),
    );

    await expect(
      createServico({ nome: "API", url: "https://exemplo.com", ativo: true }),
    ).rejects.toThrow("Erro ao cadastrar o serviço.");
  });
});
