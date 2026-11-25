from app.repositories.memoria import (
    BancoMemoria,
    MovimentacaoRepositoryMemoria,
    ProdutoRepositoryMemoria,
)
from app.services.produto_service import ProdutoService

# Nesta etapa os dados ficam em memoria (somem ao reiniciar a API).
_banco = BancoMemoria()


def get_produto_service() -> ProdutoService:
    return ProdutoService(ProdutoRepositoryMemoria(_banco), MovimentacaoRepositoryMemoria(_banco))
