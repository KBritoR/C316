from typing import Optional

from schemas import Servico, ServicoOut, ServicoUpdate


class ServicoStore:
    def __init__(self) -> None:
        self._servicos: dict[int, ServicoOut] = {}
        self._next_id = 1

    def clear(self) -> None:
        self._servicos.clear()
        self._next_id = 1

    def create(self, servico: Servico) -> ServicoOut:
        novo_servico = ServicoOut(id=self._next_id, **servico.model_dump())
        self._servicos[self._next_id] = novo_servico
        self._next_id += 1
        return novo_servico

    def list(self, ativo: Optional[bool] = None) -> list[ServicoOut]:
        servicos = list(self._servicos.values())
        if ativo is not None:
            servicos = [servico for servico in servicos if servico.ativo == ativo]
        return servicos

    def get(self, servico_id: int) -> Optional[ServicoOut]:
        return self._servicos.get(servico_id)

    def update(self, servico_id: int, servico: Servico) -> Optional[ServicoOut]:
        if servico_id not in self._servicos:
            return None
        atualizado = ServicoOut(id=servico_id, **servico.model_dump())
        self._servicos[servico_id] = atualizado
        return atualizado

    def partial_update(self, servico_id: int, changes: ServicoUpdate) -> Optional[ServicoOut]:
        atual = self._servicos.get(servico_id)
        if atual is None:
            return None
        atualizado = atual.model_copy(update=changes.model_dump(exclude_unset=True))
        self._servicos[servico_id] = atualizado
        return atualizado

    def delete(self, servico_id: int) -> bool:
        if servico_id not in self._servicos:
            return False
        del self._servicos[servico_id]
        return True


store = ServicoStore()
