import pytest
from fastapi.testclient import TestClient

from app.api.dependencias import get_produto_service
from app.main import app
from app.repositories.memoria import (
    BancoMemoria,
    MovimentacaoRepositoryMemoria,
    ProdutoRepositoryMemoria,
)
from app.services.produto_service import ProdutoService


@pytest.fixture
def service():
    banco = BancoMemoria()
    return ProdutoService(ProdutoRepositoryMemoria(banco), MovimentacaoRepositoryMemoria(banco))


@pytest.fixture
def client(service):
    """TestClient com um banco em memória novo a cada teste."""
    app.dependency_overrides[get_produto_service] = lambda: service
    yield TestClient(app)
    app.dependency_overrides.clear()
