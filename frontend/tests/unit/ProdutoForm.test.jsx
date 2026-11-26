import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ProdutoForm from "../../src/components/ProdutoForm";
import { produtoExemplo } from "../helpers";

async function preencher(user, { nome, categoria, estoqueMinimo, custo }) {
  await user.type(screen.getByLabelText("Nome"), nome);
  await user.type(screen.getByLabelText("Categoria"), categoria);
  await user.clear(screen.getByLabelText("Estoque mínimo"));
  await user.type(screen.getByLabelText("Estoque mínimo"), estoqueMinimo);
  await user.type(screen.getByLabelText("Custo unitário (R$)"), custo);
}

describe("ProdutoForm", () => {
  it("envia os dados no formato da API e limpa o formulário", async () => {
    const user = userEvent.setup();
    const onSalvar = vi.fn().mockResolvedValue(undefined);
    render(<ProdutoForm onSalvar={onSalvar} />);

    await preencher(user, { nome: "Arroz", categoria: "Grãos", estoqueMinimo: "5", custo: "6,50" });
    await user.click(screen.getByRole("button", { name: "Cadastrar produto" }));

    expect(onSalvar).toHaveBeenCalledWith({
      nome: "Arroz",
      categoria: "Grãos",
      unidade: "kg",
      estoque_minimo: 5,
      custo_unitario: "6.50",
    });
    expect(screen.getByLabelText("Nome")).toHaveValue("");
  });

  it("mostra os erros de validação e não envia", async () => {
    const user = userEvent.setup();
    const onSalvar = vi.fn();
    render(<ProdutoForm onSalvar={onSalvar} />);

    await user.click(screen.getByRole("button", { name: "Cadastrar produto" }));

    expect(onSalvar).not.toHaveBeenCalled();
    expect(screen.getByText("O nome é obrigatório.")).toBeInTheDocument();
    expect(screen.getByText("A categoria é obrigatória.")).toBeInTheDocument();
  });

  it("mostra o erro vindo da API e mantém o que foi digitado", async () => {
    const user = userEvent.setup();
    const onSalvar = vi.fn().mockRejectedValue(new Error("Já existe um produto com esse nome"));
    render(<ProdutoForm onSalvar={onSalvar} />);

    await preencher(user, { nome: "Arroz", categoria: "Grãos", estoqueMinimo: "5", custo: "6" });
    await user.click(screen.getByRole("button", { name: "Cadastrar produto" }));

    expect(await screen.findByText("Já existe um produto com esse nome")).toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toHaveValue("Arroz");
  });

  it("no modo edição vem preenchido e permite cancelar", async () => {
    const user = userEvent.setup();
    const onCancelar = vi.fn();
    render(<ProdutoForm produto={produtoExemplo()} onSalvar={vi.fn()} onCancelar={onCancelar} />);

    expect(screen.getByLabelText("Nome")).toHaveValue("Arroz");
    expect(screen.getByLabelText("Custo unitário (R$)")).toHaveValue("6.5");

    await user.click(screen.getByRole("button", { name: "Cancelar edição" }));
    expect(onCancelar).toHaveBeenCalled();
  });

  it("desabilita o botão enquanto salva", async () => {
    const user = userEvent.setup();
    let concluir;
    const onSalvar = vi.fn(
      () =>
        new Promise((resolve) => {
          concluir = resolve;
        }),
    );
    render(<ProdutoForm onSalvar={onSalvar} />);

    await preencher(user, { nome: "Arroz", categoria: "Grãos", estoqueMinimo: "5", custo: "6" });
    await user.click(screen.getByRole("button", { name: "Cadastrar produto" }));

    expect(screen.getByRole("button", { name: "Salvando..." })).toBeDisabled();
    concluir();
    expect(await screen.findByRole("button", { name: "Cadastrar produto" })).toBeEnabled();
  });
});
