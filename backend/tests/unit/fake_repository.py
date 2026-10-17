class FakeServico:
    def __init__(self, id: int, nome: str, url: str, ativo: bool) -> None:
        self.id = id
        self.nome = nome
        self.url = url
        self.ativo = ativo


class FakeServicoRepository:
    """Repositorio em memoria usado so pelos testes unitarios do service,
    pra nao depender de Postgres pra testar regra de negocio."""

    def __init__(self) -> None:
        self._dados: dict[int, FakeServico] = {}
        self._next_id = 1

    def create(self, nome: str, url: str, ativo: bool) -> FakeServico:
        servico = FakeServico(self._next_id, nome, url, ativo)
        self._dados[self._next_id] = servico
        self._next_id += 1
        return servico

    def list(self, ativo: bool | None = None) -> list[FakeServico]:
        valores = list(self._dados.values())
        if ativo is not None:
            valores = [s for s in valores if s.ativo == ativo]
        return valores

    def get(self, servico_id: int) -> FakeServico | None:
        return self._dados.get(servico_id)

    def update(self, servico: FakeServico, nome: str, url: str, ativo: bool) -> FakeServico:
        servico.nome = nome
        servico.url = url
        servico.ativo = ativo
        return servico

    def partial_update(self, servico: FakeServico, changes: dict) -> FakeServico:
        for campo, valor in changes.items():
            setattr(servico, campo, valor)
        return servico

    def delete(self, servico: FakeServico) -> None:
        del self._dados[servico.id]
