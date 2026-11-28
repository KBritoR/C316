import pytest
from fakes import BancoMemoria, MovimentacaoRepositoryFake, ProdutoRepositoryFake

from app.services.produto_service import ProdutoService


@pytest.fixture
def service():
    banco = BancoMemoria()
    return ProdutoService(ProdutoRepositoryFake(banco), MovimentacaoRepositoryFake(banco))
