from fastapi import Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.movimentacao_repository import MovimentacaoRepository
from app.repositories.produto_repository import ProdutoRepository
from app.services.produto_service import ProdutoService


def get_produto_service(db: Session = Depends(get_db)) -> ProdutoService:
    return ProdutoService(ProdutoRepository(db), MovimentacaoRepository(db))
