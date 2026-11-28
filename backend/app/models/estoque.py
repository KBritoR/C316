from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Produto(Base):
    __tablename__ = "produtos"
    __table_args__ = (
        CheckConstraint("quantidade >= 0", name="ck_produtos_quantidade_nao_negativa"),
        CheckConstraint("estoque_minimo >= 0", name="ck_produtos_estoque_minimo_nao_negativo"),
        CheckConstraint("custo_unitario >= 0", name="ck_produtos_custo_nao_negativo"),
        # Nome unico sem diferenciar maiusculas: "Arroz" e "ARROZ" sao o mesmo produto.
        Index("uq_produtos_nome_minusculo", text("lower(nome)"), unique=True),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(100))
    categoria: Mapped[str] = mapped_column(String(50))
    unidade: Mapped[str] = mapped_column(String(5))
    estoque_minimo: Mapped[int] = mapped_column(Integer)
    custo_unitario: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    quantidade: Mapped[int] = mapped_column(Integer, default=0, server_default="0")


class Movimentacao(Base):
    __tablename__ = "movimentacoes"
    __table_args__ = (
        CheckConstraint("tipo in ('entrada', 'saida')", name="ck_movimentacoes_tipo"),
        CheckConstraint("quantidade > 0", name="ck_movimentacoes_quantidade_positiva"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    produto_id: Mapped[int] = mapped_column(
        ForeignKey("produtos.id", ondelete="CASCADE"), index=True
    )
    tipo: Mapped[str] = mapped_column(String(10))
    quantidade: Mapped[int] = mapped_column(Integer)
    saldo_apos: Mapped[int] = mapped_column(Integer)
    observacao: Mapped[str | None] = mapped_column(String(200))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
