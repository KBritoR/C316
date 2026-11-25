class ProdutoNaoEncontradoError(Exception):
    def __init__(self, produto_id: int) -> None:
        self.produto_id = produto_id
        super().__init__(f"Produto {produto_id} não encontrado")


class NomeDuplicadoError(Exception):
    def __init__(self, nome: str) -> None:
        self.nome = nome
        super().__init__("Já existe um produto com esse nome")


class ProdutoComEstoqueError(Exception):
    def __init__(self, quantidade: int) -> None:
        self.quantidade = quantidade
        super().__init__(
            f"Não é possível excluir um produto com {quantidade} em estoque; "
            "registre a saída antes de excluir"
        )
