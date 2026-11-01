from typing import Any, Protocol

from app.schemas.servico import Servico, ServicoUpdate


class RepositorioServico(Protocol):
    def create(self, nome: str, url: str, ativo: bool) -> Any: ...
    def list(self, ativo: bool | None = None) -> list[Any]: ...
    def get(self, servico_id: int) -> Any | None: ...
    def update(self, servico: Any, nome: str, url: str, ativo: bool) -> Any: ...
    def partial_update(self, servico: Any, changes: dict) -> Any: ...
    def delete(self, servico: Any) -> None: ...


class ServicoService:
    def __init__(self, repository: RepositorioServico) -> None:
        self.repository = repository

    def criar(self, servico: Servico) -> Any:
        return self.repository.create(servico.nome, servico.url, servico.ativo)

    def listar(self, ativo: bool | None = None) -> list[Any]:
        return self.repository.list(ativo=ativo)

    def obter(self, servico_id: int) -> Any | None:
        return self.repository.get(servico_id)

    def atualizar(self, servico_id: int, dados: Servico) -> Any | None:
        atual = self.repository.get(servico_id)
        if atual is None:
            return None
        return self.repository.update(atual, dados.nome, dados.url, dados.ativo)

    def atualizar_parcialmente(self, servico_id: int, changes: ServicoUpdate) -> Any | None:
        atual = self.repository.get(servico_id)
        if atual is None:
            return None
        return self.repository.partial_update(atual, changes.model_dump(exclude_unset=True))

    def deletar(self, servico_id: int) -> bool:
        atual = self.repository.get(servico_id)
        if atual is None:
            return False
        self.repository.delete(atual)
        return True
