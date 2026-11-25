"""Repositorios em memoria usados so nos testes unitarios do service.

Implementam a mesma interface dos repositorios com SQLAlchemy, para testar
as regras de negocio sem precisar de PostgreSQL.
"""

from datetime import UTC, datetime

from app.models.estoque import Movimentacao, Produto


class BancoMemoria:
    def __init__(self) -> None:
        self.produtos: dict[int, Produto] = {}
        self.movimentacoes: dict[int, Movimentacao] = {}
        self._proximo_id_produto = 1
        self._proximo_id_movimentacao = 1

    def novo_id_produto(self) -> int:
        novo_id = self._proximo_id_produto
        self._proximo_id_produto += 1
        return novo_id

    def novo_id_movimentacao(self) -> int:
        novo_id = self._proximo_id_movimentacao
        self._proximo_id_movimentacao += 1
        return novo_id


class ProdutoRepositoryFake:
    def __init__(self, banco: BancoMemoria) -> None:
        self.banco = banco

    def listar(self, categoria: str | None = None, busca: str | None = None) -> list[Produto]:
        produtos = list(self.banco.produtos.values())
        if categoria:
            produtos = [p for p in produtos if p.categoria.lower() == categoria.lower()]
        if busca:
            produtos = [p for p in produtos if busca.lower() in p.nome.lower()]
        return sorted(produtos, key=lambda p: p.nome.lower())

    def obter(self, produto_id: int) -> Produto | None:
        return self.banco.produtos.get(produto_id)

    def obter_para_atualizar(self, produto_id: int) -> Produto | None:
        return self.obter(produto_id)

    def obter_por_nome(self, nome: str) -> Produto | None:
        return next(
            (p for p in self.banco.produtos.values() if p.nome.lower() == nome.lower()), None
        )

    def criar(self, dados: dict) -> Produto:
        produto = Produto(id=self.banco.novo_id_produto(), quantidade=0, **dados)
        self.banco.produtos[produto.id] = produto
        return produto

    def atualizar(self, produto: Produto, dados: dict) -> Produto:
        for campo, valor in dados.items():
            setattr(produto, campo, valor)
        return produto

    def excluir(self, produto: Produto) -> None:
        del self.banco.produtos[produto.id]
        self.banco.movimentacoes = {
            id_: m for id_, m in self.banco.movimentacoes.items() if m.produto_id != produto.id
        }


class MovimentacaoRepositoryFake:
    def __init__(self, banco: BancoMemoria) -> None:
        self.banco = banco

    def registrar(
        self, produto: Produto, tipo: str, quantidade: int, saldo_apos: int, observacao: str | None
    ) -> Movimentacao:
        movimentacao = Movimentacao(
            id=self.banco.novo_id_movimentacao(),
            produto_id=produto.id,
            tipo=tipo,
            quantidade=quantidade,
            saldo_apos=saldo_apos,
            observacao=observacao,
            criado_em=datetime.now(UTC),
        )
        produto.quantidade = saldo_apos
        self.banco.movimentacoes[movimentacao.id] = movimentacao
        return movimentacao

    def listar_por_produto(self, produto_id: int) -> list[Movimentacao]:
        movimentacoes = [m for m in self.banco.movimentacoes.values() if m.produto_id == produto_id]
        return sorted(movimentacoes, key=lambda m: m.id, reverse=True)
