import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ProdutoList from "../../src/components/ProdutoList";
import ResumoEstoque from "../../src/components/ResumoEstoque";
import { produtoExemplo } from "../helpers";

const PRODUTOS = [
  produtoExemplo(),
  produtoExemplo({ id: 2, nome: "Feijão", quantidade: 2, estoque_baixo: true }),
];

function renderLista(acoes = {}) {
  const props = { onSelecionar: vi.fn(), onEditar: vi.fn(), onExcluir: vi.fn(), ...acoes };
  render(<ProdutoList produtos={PRODUTOS} selecionadoId={null} {...props} />);
  return props;
}

describe("ProdutoList", () => {
  it("mostra o estado vazio", () => {
    render(<ProdutoList produtos={[]} />);

    expect(screen.getByText("Nenhum produto encontrado.")).toBeInTheDocument();
  });

  it("lista os produtos e destaca o estoque baixo só onde precisa", () => {
    renderLista();

    const [arroz, feijao] = screen.getAllByRole("listitem");
    expect(within(arroz).getByText("Arroz")).toBeInTheDocument();
    expect(within(arroz).queryByText("Estoque baixo")).not.toBeInTheDocument();
    expect(within(feijao).getByText("Estoque baixo")).toBeInTheDocument();
  });

  it("chama a ação certa com o produto certo", async () => {
    const user = userEvent.setup();
    const { onSelecionar, onEditar, onExcluir } = renderLista();

    await user.click(screen.getByRole("button", { name: "Movimentar Arroz" }));
    await user.click(screen.getByRole("button", { name: "Editar Feijão" }));
    await user.click(screen.getByRole("button", { name: "Excluir Arroz" }));

    expect(onSelecionar).toHaveBeenCalledWith(PRODUTOS[0]);
    expect(onEditar).toHaveBeenCalledWith(PRODUTOS[1]);
    expect(onExcluir).toHaveBeenCalledWith(PRODUTOS[0]);
  });
});

describe("ResumoEstoque", () => {
  it("mostra os totais e o valor em reais", () => {
    render(
      <ResumoEstoque
        resumo={{ total_produtos: 3, produtos_estoque_baixo: 1, valor_total_estoque: 1234.5 }}
      />,
    );

    const resumo = screen.getByRole("region", { name: "Resumo do estoque" });
    expect(within(resumo).getByText("3")).toBeInTheDocument();
    expect(within(resumo).getByText("1")).toBeInTheDocument();
    expect(within(resumo).getByText(/R\$\s?1\.234,50/)).toBeInTheDocument();
  });
});
