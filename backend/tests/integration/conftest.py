import os
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker

from app.database.session import get_db
from app.main import app

# Banco separado do de desenvolvimento: rodar os testes nunca apaga dados reais.
TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://estoque:estoque@localhost:5432/estoque_test",
)
BACKEND_DIR = Path(__file__).resolve().parents[2]


def _criar_banco_de_teste_se_nao_existir() -> None:
    url = make_url(TEST_DATABASE_URL)
    admin = create_engine(url.set(database="postgres"), isolation_level="AUTOCOMMIT")
    with admin.connect() as conexao:
        existe = conexao.scalar(
            text("SELECT 1 FROM pg_database WHERE datname = :nome"), {"nome": url.database}
        )
        if not existe:
            conexao.execute(text(f'CREATE DATABASE "{url.database}"'))
    admin.dispose()


def _aplicar_migrations() -> None:
    config = Config(str(BACKEND_DIR / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    config.set_main_option("sqlalchemy.url", TEST_DATABASE_URL)
    command.upgrade(config, "head")


@pytest.fixture(scope="session")
def engine():
    _criar_banco_de_teste_se_nao_existir()
    _aplicar_migrations()
    engine = create_engine(TEST_DATABASE_URL)
    yield engine
    engine.dispose()


@pytest.fixture
def client(engine):
    with engine.begin() as conexao:
        conexao.execute(text("TRUNCATE movimentacoes, produtos RESTART IDENTITY CASCADE"))

    SessaoDeTeste = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

    def get_db_de_teste():
        db = SessaoDeTeste()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = get_db_de_teste
    yield TestClient(app)
    app.dependency_overrides.clear()
