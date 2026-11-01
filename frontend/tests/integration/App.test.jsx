import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../../src/App";

async function cadastrar(user, nome, url, { inativo = false } = {}) {
  await user.type(screen.getByLabelText("Nome"), nome);
  await user.type(screen.getByLabelText("URL"), url);
  if (inativo) {
    await user.click(screen.getByLabelText("Ativo"));
  }
  await user.click(screen.getByRole("button", { name: "Cadastrar" }));
}

describe("App (formulário + lista)", () => {
  it("cadastra um serviço e ele aparece na lista", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText("Nenhum serviço cadastrado.")).toBeInTheDocument();

    await cadastrar(user, "API Pagamentos", "https://pagamentos.exemplo.com");

    const lista = screen.getByRole("list", { name: "Serviços cadastrados" });
    expect(within(lista).getByText("API Pagamentos")).toBeInTheDocument();
    expect(screen.queryByText("Nenhum serviço cadastrado.")).not.toBeInTheDocument();
  });

  it("não adiciona serviço inválido na lista", async () => {
    const user = userEvent.setup();
    render(<App />);

    await cadastrar(user, "API", "exemplo.com");

    expect(screen.getByText("A URL deve começar com http:// ou https://.")).toBeInTheDocument();
    expect(screen.getByText("Nenhum serviço cadastrado.")).toBeInTheDocument();
  });

  it("filtra por status e alterna ativo/inativo", async () => {
    const user = userEvent.setup();
    render(<App />);

    await cadastrar(user, "API Pagamentos", "https://pagamentos.exemplo.com");
    await cadastrar(user, "API Legado", "https://legado.exemplo.com", { inativo: true });

    await user.click(screen.getByRole("button", { name: "Ativos" }));
    expect(screen.getByText("API Pagamentos")).toBeInTheDocument();
    expect(screen.queryByText("API Legado")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Desativar API Pagamentos" }));
    expect(screen.getByText("Nenhum serviço cadastrado.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Inativos" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("remove um serviço da lista", async () => {
    const user = userEvent.setup();
    render(<App />);

    await cadastrar(user, "API Pagamentos", "https://pagamentos.exemplo.com");
    await user.click(screen.getByRole("button", { name: "Remover API Pagamentos" }));

    expect(screen.getByText("Nenhum serviço cadastrado.")).toBeInTheDocument();
  });
});
