from pydantic import BaseModel


class ResumoEstoqueOut(BaseModel):
    total_produtos: int
    produtos_estoque_baixo: int
    valor_total_estoque: float
