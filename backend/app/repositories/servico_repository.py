from sqlalchemy.orm import Session

from app.models.servico import ServicoModel


class ServicoRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, nome: str, url: str, ativo: bool) -> ServicoModel:
        servico = ServicoModel(nome=nome, url=url, ativo=ativo)
        self.db.add(servico)
        self.db.commit()
        self.db.refresh(servico)
        return servico

    def list(self, ativo: bool | None = None) -> list[ServicoModel]:
        query = self.db.query(ServicoModel)
        if ativo is not None:
            query = query.filter(ServicoModel.ativo == ativo)
        return query.order_by(ServicoModel.id).all()

    def get(self, servico_id: int) -> ServicoModel | None:
        return self.db.get(ServicoModel, servico_id)

    def update(self, servico: ServicoModel, nome: str, url: str, ativo: bool) -> ServicoModel:
        servico.nome = nome
        servico.url = url
        servico.ativo = ativo
        self.db.commit()
        self.db.refresh(servico)
        return servico

    def partial_update(self, servico: ServicoModel, changes: dict) -> ServicoModel:
        for campo, valor in changes.items():
            setattr(servico, campo, valor)
        self.db.commit()
        self.db.refresh(servico)
        return servico

    def delete(self, servico: ServicoModel) -> None:
        self.db.delete(servico)
        self.db.commit()
