import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import DATABASE_URL
from app.database.session import get_db
from app.main import app
from app.models.servico import ServicoModel

engine = create_engine(DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_get_db


@pytest.fixture
def client():
    """TestClient com a tabela de servicos zerada antes de cada teste.

    Usa o Postgres real (a mesma tabela criada pela migration do Alembic),
    nao um banco mockado, pra testar a persistencia de fato.
    """
    db = TestingSessionLocal()
    db.query(ServicoModel).delete()
    db.commit()
    db.close()
    return TestClient(app)
