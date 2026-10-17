from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.servico_repository import ServicoRepository
from app.schemas.servico import Servico, ServicoOut, ServicoUpdate
from app.services.servico_service import ServicoService

router = APIRouter(prefix="/servicos", tags=["servicos"])


def get_service(db: Session = Depends(get_db)) -> ServicoService:
    return ServicoService(ServicoRepository(db))


@router.post("", response_model=ServicoOut, status_code=201)
def criar_servico(servico: Servico, service: ServicoService = Depends(get_service)):
    return service.criar(servico)


@router.get("", response_model=list[ServicoOut])
def listar_servicos(ativo: bool | None = None, service: ServicoService = Depends(get_service)):
    return service.listar(ativo=ativo)


@router.get("/{servico_id}", response_model=ServicoOut)
def obter_servico(servico_id: int, service: ServicoService = Depends(get_service)):
    servico = service.obter(servico_id)
    if servico is None:
        raise HTTPException(status_code=404, detail="Servico nao encontrado")
    return servico


@router.put("/{servico_id}", response_model=ServicoOut)
def atualizar_servico(
    servico_id: int, servico: Servico, service: ServicoService = Depends(get_service)
):
    atualizado = service.atualizar(servico_id, servico)
    if atualizado is None:
        raise HTTPException(status_code=404, detail="Servico nao encontrado")
    return atualizado


@router.patch("/{servico_id}", response_model=ServicoOut)
def atualizar_parcialmente_servico(
    servico_id: int, changes: ServicoUpdate, service: ServicoService = Depends(get_service)
):
    atualizado = service.atualizar_parcialmente(servico_id, changes)
    if atualizado is None:
        raise HTTPException(status_code=404, detail="Servico nao encontrado")
    return atualizado


@router.delete("/{servico_id}", status_code=204)
def deletar_servico(servico_id: int, service: ServicoService = Depends(get_service)):
    if not service.deletar(servico_id):
        raise HTTPException(status_code=404, detail="Servico nao encontrado")
