from pydantic import BaseModel, ConfigDict, Field, field_validator


def _validar_url(value: str) -> str:
    if not value.startswith(("http://", "https://")):
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
    model_config = ConfigDict(from_attributes=True)

    id: int


class ServicoUpdate(BaseModel):
    nome: str | None = None
    url: str | None = None
    ativo: bool | None = None

    @field_validator("nome")
    @classmethod
    def nome_nao_pode_ser_nulo(cls, value: str | None) -> str:
        if value is None:
            raise ValueError("nome nao pode ser nulo")
        return _validar_nome(value)

    @field_validator("url")
    @classmethod
    def url_nao_pode_ser_nula(cls, value: str | None) -> str:
        if value is None:
            raise ValueError("url nao pode ser nula")
        return _validar_url(value)

    @field_validator("ativo")
    @classmethod
    def ativo_nao_pode_ser_nulo(cls, value: bool | None) -> bool:
        if value is None:
            raise ValueError("ativo nao pode ser nulo")
        return value
