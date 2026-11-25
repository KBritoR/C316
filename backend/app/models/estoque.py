from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal


@dataclass
class Produto:
    id: int
    nome: str
    categoria: str
    unidade: str
    estoque_minimo: int
    custo_unitario: Decimal
    quantidade: int = 0


@dataclass
class Movimentacao:
    id: int
    produto_id: int
    tipo: str
    quantidade: int
    saldo_apos: int
    observacao: str | None
    criado_em: datetime
