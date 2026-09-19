import pytest
from fastapi.testclient import TestClient

from main import app, store


@pytest.fixture
def client():
    """Cliente de teste com o estado em memoria zerado antes de cada teste."""
    store.clear()
    return TestClient(app)
