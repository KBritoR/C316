from typing import Optional

from pydantic import BaseModel, Field, field_validator


def _validar_url(value: str) -> str:
    if not (value.startswith("http://") or value.startswith("https://")):
        raise ValueError("url deve comecar com http:// ou https://")
    return value


def _validar_nome(value: str) -> str:
    value = value.strip()
    if not value:
        raise ValueError("nome nao pode ser vazio")
    return value


class Servico(BaseModel):
    nome: str = Field(..., min_length=1)
    url: str
    ativo: bool = True

    @field_validator("nome")
    @classmethod
    def nome_valido(cls, value: str) -> str:
        return _validar_nome(value)

    @field_validator("url")
    @classmethod
    def url_valida(cls, value: str) -> str:
        return _validar_url(value)


class ServicoOut(Servico):
    id: int


class ServicoUpdate(BaseModel):
    nome: Optional[str] = None
    url: Optional[str] = None
    ativo: Optional[bool] = None

    @field_validator("nome")
    @classmethod
    def nome_nao_pode_ser_nulo(cls, value: Optional[str]) -> str:
        if value is None:
            raise ValueError("nome nao pode ser nulo")
        return _validar_nome(value)

    @field_validator("url")
    @classmethod
    def url_nao_pode_ser_nula(cls, value: Optional[str]) -> str:
        if value is None:
            raise ValueError("url nao pode ser nula")
        return _validar_url(value)

    @field_validator("ativo")
    @classmethod
    def ativo_nao_pode_ser_nulo(cls, value: Optional[bool]) -> bool:
        if value is None:
            raise ValueError("ativo nao pode ser nulo")
        return value
