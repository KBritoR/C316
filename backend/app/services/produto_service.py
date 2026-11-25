from decimal import Decimal
from typing import Any, Protocol

from app.schemas.movimentacao import MovimentacaoCreate
from app.schemas.produto import ProdutoCreate, ProdutoPatch, ProdutoUpdate
from app.schemas.resumo import ResumoEstoqueOut
from app.services.excecoes import (
    NomeDuplicadoError,
    ProdutoComEstoqueError,
    ProdutoNaoEncontradoError,
)
from app.services.regras_estoque import calcular_novo_saldo, esta_com_estoque_baixo


class ProdutoRepositorio(Protocol):
    def listar(self, categoria: str | None = None, busca: str | None = None) -> list[Any]: ...
    def obter(self, produto_id: int) -> Any | None: ...
    def obter_por_nome(self, nome: str) -> Any | None: ...
    def criar(self, dados: dict) -> Any: ...
    def atualizar(self, produto: Any, dados: dict) -> Any: ...
    def excluir(self, produto: Any) -> None: ...


class MovimentacaoRepositorio(Protocol):
    def registrar(
        self, produto: Any, tipo: str, quantidade: int, saldo_apos: int, observacao: str | None
    ) -> Any: ...
    def listar_por_produto(self, produto_id: int) -> list[Any]: ...


class ProdutoService:
    def __init__(
        self, produtos: ProdutoRepositorio, movimentacoes: MovimentacaoRepositorio
    ) -> None:
        self.produtos = produtos
        self.movimentacoes = movimentacoes

    def _garantir_nome_unico(self, nome: str, produto_id: int | None = None) -> None:
        existente = self.produtos.obter_por_nome(nome)
        if existente is not None and existente.id != produto_id:
            raise NomeDuplicadoError(nome)

    def listar(
        self,
        categoria: str | None = None,
        busca: str | None = None,
        estoque_baixo: bool | None = None,
    ) -> list[Any]:
        produtos = self.produtos.listar(categoria=categoria, busca=busca)
        if estoque_baixo is not None:
            produtos = [
                p
                for p in produtos
                if esta_com_estoque_baixo(p.quantidade, p.estoque_minimo) == estoque_baixo
            ]
        return produtos

    def obter(self, produto_id: int) -> Any:
        produto = self.produtos.obter(produto_id)
        if produto is None:
            raise ProdutoNaoEncontradoError(produto_id)
        return produto

    def criar(self, dados: ProdutoCreate) -> Any:
        self._garantir_nome_unico(dados.nome)
        return self.produtos.criar(dados.model_dump())

    def atualizar(self, produto_id: int, dados: ProdutoUpdate) -> Any:
        produto = self.obter(produto_id)
        self._garantir_nome_unico(dados.nome, produto_id)
        return self.produtos.atualizar(produto, dados.model_dump())

    def atualizar_parcialmente(self, produto_id: int, dados: ProdutoPatch) -> Any:
        produto = self.obter(produto_id)
        alteracoes = dados.model_dump(exclude_unset=True)
        if "nome" in alteracoes:
            self._garantir_nome_unico(alteracoes["nome"], produto_id)
        return self.produtos.atualizar(produto, alteracoes)

    def excluir(self, produto_id: int) -> None:
        produto = self.obter(produto_id)
        if produto.quantidade > 0:
            raise ProdutoComEstoqueError(produto.quantidade)
        self.produtos.excluir(produto)

    def registrar_movimentacao(self, produto_id: int, dados: MovimentacaoCreate) -> Any:
        produto = self.obter(produto_id)
        novo_saldo = calcular_novo_saldo(produto.quantidade, dados.tipo, dados.quantidade)
        return self.movimentacoes.registrar(
            produto, dados.tipo.value, dados.quantidade, novo_saldo, dados.observacao
        )

    def listar_movimentacoes(self, produto_id: int) -> list[Any]:
        self.obter(produto_id)
        return self.movimentacoes.listar_por_produto(produto_id)

    def resumo(self) -> ResumoEstoqueOut:
        produtos = self.produtos.listar()
        return ResumoEstoqueOut(
            total_produtos=len(produtos),
            produtos_estoque_baixo=sum(
                1 for p in produtos if esta_com_estoque_baixo(p.quantidade, p.estoque_minimo)
            ),
            valor_total_estoque=float(
                sum((p.quantidade * Decimal(p.custo_unitario) for p in produtos), Decimal(0))
            ),
        )
