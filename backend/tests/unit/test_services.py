import pytest
from pydantic import ValidationError

from schemas import Servico, ServicoUpdate
from services import ServicoStore


@pytest.fixture
def store():
    return ServicoStore()


def test_create_assigns_incrementing_ids(store):
    primeiro = store.create(Servico(nome="API Pagamentos", url="https://pagamentos.exemplo.com"))
    segundo = store.create(Servico(nome="API Usuarios", url="https://usuarios.exemplo.com"))
    assert primeiro.id == 1
    assert segundo.id == 2


def test_get_returns_none_for_missing_servico(store):
    assert store.get(999) is None


def test_list_filters_by_ativo(store):
    store.create(Servico(nome="API Pagamentos", url="https://pagamentos.exemplo.com", ativo=True))
    store.create(Servico(nome="API Legado", url="https://legado.exemplo.com", ativo=False))

    ativos = store.list(ativo=True)

    assert len(ativos) == 1
    assert ativos[0].nome == "API Pagamentos"


def test_partial_update_changes_only_given_fields(store):
    criado = store.create(Servico(nome="API Pagamentos", url="https://pagamentos.exemplo.com", ativo=True))

    atualizado = store.partial_update(criado.id, ServicoUpdate(ativo=False))

    assert atualizado.ativo is False
    assert atualizado.nome == "API Pagamentos"
    assert atualizado.url == "https://pagamentos.exemplo.com"


def test_partial_update_returns_none_for_missing_servico(store):
    assert store.partial_update(999, ServicoUpdate(ativo=False)) is None


def test_delete_returns_false_for_missing_servico(store):
    assert store.delete(999) is False


@pytest.mark.parametrize("url", ["ftp://exemplo.com", "exemplo.com", "www.exemplo.com"])
def test_servico_rejeita_url_sem_protocolo_http(url):
    with pytest.raises(ValidationError):
        Servico(nome="API Teste", url=url)


def test_servico_rejeita_nome_vazio():
    with pytest.raises(ValidationError):
        Servico(nome="   ", url="https://exemplo.com")


def test_servico_update_rejeita_valor_nulo_explicito():
    with pytest.raises(ValidationError):
        ServicoUpdate(nome=None, ativo=True)
