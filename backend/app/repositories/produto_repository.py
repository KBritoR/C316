from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.estoque import Produto


class ProdutoRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def listar(self, categoria: str | None = None, busca: str | None = None) -> list[Produto]:
        consulta = select(Produto)
        if categoria:
            consulta = consulta.where(func.lower(Produto.categoria) == categoria.lower())
        if busca:
            consulta = consulta.where(Produto.nome.ilike(f"%{busca}%"))
        consulta = consulta.order_by(func.lower(Produto.nome))
        return list(self.db.scalars(consulta))

    def obter(self, produto_id: int) -> Produto | None:
        return self.db.get(Produto, produto_id)

    def obter_para_atualizar(self, produto_id: int) -> Produto | None:
        # Trava a linha ate o commit: duas movimentacoes simultaneas no mesmo
        # produto nao conseguem calcular o saldo em cima do mesmo valor antigo.
        return self.db.get(Produto, produto_id, with_for_update=True)

    def obter_por_nome(self, nome: str) -> Produto | None:
        consulta = select(Produto).where(func.lower(Produto.nome) == nome.lower())
        return self.db.scalars(consulta).first()

    def criar(self, dados: dict) -> Produto:
        produto = Produto(**dados, quantidade=0)
        self.db.add(produto)
        self.db.commit()
        self.db.refresh(produto)
        return produto

    def atualizar(self, produto: Produto, dados: dict) -> Produto:
        for campo, valor in dados.items():
            setattr(produto, campo, valor)
        self.db.commit()
        self.db.refresh(produto)
        return produto

    def excluir(self, produto: Produto) -> None:
        self.db.delete(produto)
        self.db.commit()
