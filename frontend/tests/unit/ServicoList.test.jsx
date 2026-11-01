import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ServicoList from "../../src/components/ServicoList";

const SERVICOS = [
  { id: 1, nome: "API Pagamentos", url: "https://pagamentos.exemplo.com", ativo: true },
  { id: 2, nome: "API Legado", url: "https://legado.exemplo.com", ativo: false },
];

describe("ServicoList", () => {
  it("mostra o estado vazio quando não há serviços", () => {
    render(<ServicoList servicos={[]} onToggle={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText("Nenhum serviço cadastrado.")).toBeInTheDocument();
  });

  it("renderiza cada serviço com seu status", () => {
    render(<ServicoList servicos={SERVICOS} onToggle={vi.fn()} onRemove={vi.fn()} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("API Pagamentos")).toBeInTheDocument();
    expect(screen.getByText("Inativo")).toBeInTheDocument();
  });

  it("chama onToggle e onRemove com o id do serviço", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onRemove = vi.fn();
    render(<ServicoList servicos={SERVICOS} onToggle={onToggle} onRemove={onRemove} />);

    await user.click(screen.getByRole("button", { name: "Desativar API Pagamentos" }));
    await user.click(screen.getByRole("button", { name: "Remover API Legado" }));

    expect(onToggle).toHaveBeenCalledWith(1);
    expect(onRemove).toHaveBeenCalledWith(2);
  });
});
