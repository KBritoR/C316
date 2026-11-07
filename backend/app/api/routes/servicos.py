from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.servico_repository import ServicoRepository
from app.schemas.servico import Servico, ServicoOut, ServicoUpdate
from app.services.servico_service import NomeDuplicadoError, ServicoService

router = APIRouter(prefix="/servicos", tags=["servicos"])

NOME_DUPLICADO = "Já existe um serviço com esse nome"
NAO_ENCONTRADO = "Servico nao encontrado"


def get_service(db: Session = Depends(get_db)) -> ServicoService:
    return ServicoService(ServicoRepository(db))


@router.post("", response_model=ServicoOut, status_code=201)
def criar_servico(servico: Servico, service: ServicoService = Depends(get_service)):
    try:
        return service.criar(servico)
    except NomeDuplicadoError:
        raise HTTPException(status_code=409, detail=NOME_DUPLICADO) from None


@router.get("", response_model=list[ServicoOut])
def listar_servicos(ativo: bool | None = None, service: ServicoService = Depends(get_service)):
    return service.listar(ativo=ativo)


@router.get("/{servico_id}", response_model=ServicoOut)
def obter_servico(servico_id: int, service: ServicoService = Depends(get_service)):
    servico = service.obter(servico_id)
    if servico is None:
        raise HTTPException(status_code=404, detail=NAO_ENCONTRADO)
    return servico


@router.put("/{servico_id}", response_model=ServicoOut)
def atualizar_servico(
    servico_id: int, servico: Servico, service: ServicoService = Depends(get_service)
):
    try:
        atualizado = service.atualizar(servico_id, servico)
    except NomeDuplicadoError:
        raise HTTPException(status_code=409, detail=NOME_DUPLICADO) from None
    if atualizado is None:
        raise HTTPException(status_code=404, detail=NAO_ENCONTRADO)
    return atualizado


@router.patch("/{servico_id}", response_model=ServicoOut)
def atualizar_parcialmente_servico(
    servico_id: int, changes: ServicoUpdate, service: ServicoService = Depends(get_service)
):
    try:
        atualizado = service.atualizar_parcialmente(servico_id, changes)
    except NomeDuplicadoError:
        raise HTTPException(status_code=409, detail=NOME_DUPLICADO) from None
    if atualizado is None:
        raise HTTPException(status_code=404, detail=NAO_ENCONTRADO)
    return atualizado


@router.delete("/{servico_id}", status_code=204)
def deletar_servico(servico_id: int, service: ServicoService = Depends(get_service)):
    if not service.deletar(servico_id):
        raise HTTPException(status_code=404, detail=NAO_ENCONTRADO)
