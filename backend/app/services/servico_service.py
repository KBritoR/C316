from typing import Any, Protocol

from app.schemas.servico import Servico, ServicoUpdate


class NomeDuplicadoError(Exception):
    pass


class RepositorioServico(Protocol):
    def create(self, nome: str, url: str, ativo: bool) -> Any: ...
    def list(self, ativo: bool | None = None) -> list[Any]: ...
    def get(self, servico_id: int) -> Any | None: ...
    def get_by_nome(self, nome: str) -> Any | None: ...
    def update(self, servico: Any, nome: str, url: str, ativo: bool) -> Any: ...
    def partial_update(self, servico: Any, changes: dict) -> Any: ...
    def delete(self, servico: Any) -> None: ...


class ServicoService:
    def __init__(self, repository: RepositorioServico) -> None:
        self.repository = repository

    def _garantir_nome_unico(self, nome: str, servico_id: int | None = None) -> None:
        existente = self.repository.get_by_nome(nome)
        if existente is not None and existente.id != servico_id:
            raise NomeDuplicadoError(nome)

    def criar(self, servico: Servico) -> Any:
        self._garantir_nome_unico(servico.nome)
        return self.repository.create(servico.nome, servico.url, servico.ativo)

    def listar(self, ativo: bool | None = None) -> list[Any]:
        return self.repository.list(ativo=ativo)

    def obter(self, servico_id: int) -> Any | None:
        return self.repository.get(servico_id)

    def atualizar(self, servico_id: int, dados: Servico) -> Any | None:
        atual = self.repository.get(servico_id)
        if atual is None:
            return None
        self._garantir_nome_unico(dados.nome, servico_id)
        return self.repository.update(atual, dados.nome, dados.url, dados.ativo)

    def atualizar_parcialmente(self, servico_id: int, changes: ServicoUpdate) -> Any | None:
        atual = self.repository.get(servico_id)
        if atual is None:
            return None
        alteracoes = changes.model_dump(exclude_unset=True)
        if "nome" in alteracoes:
            self._garantir_nome_unico(alteracoes["nome"], servico_id)
        return self.repository.partial_update(atual, alteracoes)

    def deletar(self, servico_id: int) -> bool:
        atual = self.repository.get(servico_id)
        if atual is None:
            return False
        self.repository.delete(atual)
        return True
