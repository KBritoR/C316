from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.services.regras_estoque import TipoMovimentacao


class MovimentacaoCreate(BaseModel):
    tipo: TipoMovimentacao
    quantidade: int = Field(gt=0)
    observacao: str | None = Field(default=None, max_length=200)


class MovimentacaoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    produto_id: int
    tipo: TipoMovimentacao
    quantidade: int
    saldo_apos: int
    observacao: str | None
    criado_em: datetime
