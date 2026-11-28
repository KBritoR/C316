from decimal import Decimal
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator

from app.services.regras_estoque import esta_com_estoque_baixo


class UnidadeMedida(StrEnum):
    UNIDADE = "un"
    QUILO = "kg"
    GRAMA = "g"
    LITRO = "l"
    MILILITRO = "ml"
    CAIXA = "cx"


def _texto_obrigatorio(valor: str) -> str:
    valor = valor.strip()
    if not valor:
        raise ValueError("não pode ficar em branco")
    return valor


class ProdutoCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=100)
    categoria: str = Field(min_length=1, max_length=50)
    unidade: UnidadeMedida
    estoque_minimo: int = Field(ge=0)
    custo_unitario: Decimal = Field(ge=0, max_digits=10, decimal_places=2)

    @field_validator("nome", "categoria")
    @classmethod
    def remover_espacos(cls, valor: str) -> str:
        return _texto_obrigatorio(valor)


class ProdutoUpdate(ProdutoCreate):
    """PUT: substitui todos os campos editáveis. A quantidade só muda por movimentação."""


class ProdutoPatch(BaseModel):
    nome: str | None = Field(default=None, min_length=1, max_length=100)
    categoria: str | None = Field(default=None, min_length=1, max_length=50)
    unidade: UnidadeMedida | None = None
    estoque_minimo: int | None = Field(default=None, ge=0)
    custo_unitario: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)

    @field_validator(
        "nome", "categoria", "unidade", "estoque_minimo", "custo_unitario", mode="before"
    )
    @classmethod
    def rejeitar_nulo(cls, valor):
        if valor is None:
            raise ValueError("não pode ser nulo")
        return valor

    @field_validator("nome", "categoria")
    @classmethod
    def remover_espacos(cls, valor: str) -> str:
        return _texto_obrigatorio(valor)


class ProdutoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    categoria: str
    unidade: UnidadeMedida
    estoque_minimo: int
    custo_unitario: float
    quantidade: int

    @computed_field
    @property
    def estoque_baixo(self) -> bool:
        return esta_com_estoque_baixo(self.quantidade, self.estoque_minimo)
