import { describe, expect, it } from "vitest";
import { validarServico } from "../../src/validation";

describe("validarServico", () => {
  it("aceita nome e URL válidos", () => {
    expect(
      validarServico({ nome: "API Pagamentos", url: "https://pagamentos.exemplo.com" }),
    ).toEqual({});
  });

  it.each(["", "   "])("rejeita nome vazio (%j)", (nome) => {
    expect(validarServico({ nome, url: "https://exemplo.com" }).nome).toBe("O nome é obrigatório.");
  });

  it("rejeita URL vazia", () => {
    expect(validarServico({ nome: "API", url: "" }).url).toBe("A URL é obrigatória.");
  });

  it.each(["ftp://exemplo.com", "exemplo.com", "www.exemplo.com"])(
    "rejeita URL sem http/https (%s)",
    (url) => {
      expect(validarServico({ nome: "API", url }).url).toBe(
        "A URL deve começar com http:// ou https://.",
      );
    },
  );
});
