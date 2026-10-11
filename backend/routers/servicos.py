from typing import Optional

from fastapi import APIRouter, HTTPException

from schemas import Servico, ServicoOut, ServicoUpdate
from services import store

router = APIRouter(prefix="/servicos", tags=["servicos"])


@router.post("", response_model=ServicoOut, status_code=201)
def criar_servico(servico: Servico):
    return store.create(servico)


@router.get("", response_model=list[ServicoOut])
def listar_servicos(ativo: Optional[bool] = None):
    return store.list(ativo=ativo)


@router.get("/{servico_id}", response_model=ServicoOut)
def obter_servico(servico_id: int):
    servico = store.get(servico_id)
    if servico is None:
        raise HTTPException(status_code=404, detail="Servico nao encontrado")
    return servico


@router.put("/{servico_id}", response_model=ServicoOut)
def atualizar_servico(servico_id: int, servico: Servico):
    atualizado = store.update(servico_id, servico)
    if atualizado is None:
        raise HTTPException(status_code=404, detail="Servico nao encontrado")
    return atualizado


@router.patch("/{servico_id}", response_model=ServicoOut)
def atualizar_parcialmente_servico(servico_id: int, changes: ServicoUpdate):
    atualizado = store.partial_update(servico_id, changes)
    if atualizado is None:
        raise HTTPException(status_code=404, detail="Servico nao encontrado")
    return atualizado


@router.delete("/{servico_id}", status_code=204)
def deletar_servico(servico_id: int):
    if not store.delete(servico_id):
        raise HTTPException(status_code=404, detail="Servico nao encontrado")
    return None
