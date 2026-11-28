from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.estoque import Movimentacao, Produto


class MovimentacaoRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def registrar(
        self,
        produto: Produto,
        tipo: str,
        quantidade: int,
        saldo_apos: int,
        observacao: str | None,
    ) -> Movimentacao:
        # Atualiza o saldo e grava o historico no mesmo commit:
        # ou os dois acontecem, ou nenhum.
        movimentacao = Movimentacao(
            produto_id=produto.id,
            tipo=tipo,
            quantidade=quantidade,
            saldo_apos=saldo_apos,
            observacao=observacao,
        )
        produto.quantidade = saldo_apos
        self.db.add(movimentacao)
        self.db.commit()
        self.db.refresh(movimentacao)
        return movimentacao

    def listar_por_produto(self, produto_id: int) -> list[Movimentacao]:
        consulta = (
            select(Movimentacao)
            .where(Movimentacao.produto_id == produto_id)
            .order_by(Movimentacao.id.desc())
        )
        return list(self.db.scalars(consulta))
