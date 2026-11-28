from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.services.excecoes import (
    NomeDuplicadoError,
    ProdutoComEstoqueError,
    ProdutoNaoEncontradoError,
)
from app.services.regras_estoque import EstoqueInsuficienteError, QuantidadeInvalidaError

_STATUS_POR_ERRO = {
    ProdutoNaoEncontradoError: 404,
    NomeDuplicadoError: 409,
    ProdutoComEstoqueError: 409,
    EstoqueInsuficienteError: 409,
    QuantidadeInvalidaError: 422,
}


def registrar_tratadores_de_erro(app: FastAPI) -> None:
    for tipo_erro, status in _STATUS_POR_ERRO.items():

        def tratar(_request: Request, exc: Exception, status: int = status) -> JSONResponse:
            return JSONResponse(status_code=status, content={"detail": str(exc)})

        app.add_exception_handler(tipo_erro, tratar)
