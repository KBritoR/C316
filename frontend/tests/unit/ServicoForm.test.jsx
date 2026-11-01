import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ServicoForm from "../../src/components/ServicoForm";

describe("ServicoForm", () => {
  it("chama onAdd com os dados preenchidos e limpa o formulário", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<ServicoForm onAdd={onAdd} />);

    await user.type(screen.getByLabelText("Nome"), "  API Pagamentos  ");
    await user.type(screen.getByLabelText("URL"), "https://pagamentos.exemplo.com");
    await user.click(screen.getByRole("button", { name: "Cadastrar" }));

    expect(onAdd).toHaveBeenCalledWith({
      nome: "API Pagamentos",
      url: "https://pagamentos.exemplo.com",
      ativo: true,
    });
    expect(screen.getByLabelText("Nome")).toHaveValue("");
  });

  it("mostra erros e não chama onAdd quando os campos são inválidos", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<ServicoForm onAdd={onAdd} />);

    await user.type(screen.getByLabelText("URL"), "exemplo.com");
    await user.click(screen.getByRole("button", { name: "Cadastrar" }));

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByText("O nome é obrigatório.")).toBeInTheDocument();
    expect(screen.getByText("A URL deve começar com http:// ou https://.")).toBeInTheDocument();
  });
});
