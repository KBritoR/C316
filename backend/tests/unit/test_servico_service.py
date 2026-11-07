import pytest
from fake_repository import FakeServicoRepository

from app.schemas.servico import Servico, ServicoUpdate
from app.services.servico_service import NomeDuplicadoError, ServicoService


@pytest.fixture
def service():
    return ServicoService(FakeServicoRepository())


def test_criar_atribui_id_incremental(service):
    primeiro = service.criar(Servico(nome="API Pagamentos", url="https://pagamentos.exemplo.com"))
    segundo = service.criar(Servico(nome="API Usuarios", url="https://usuarios.exemplo.com"))
    assert primeiro.id == 1
    assert segundo.id == 2


def test_obter_retorna_none_para_servico_inexistente(service):
    assert service.obter(999) is None


def test_listar_filtra_por_ativo(service):
    service.criar(Servico(nome="API Pagamentos", url="https://pagamentos.exemplo.com", ativo=True))
    service.criar(Servico(nome="API Legado", url="https://legado.exemplo.com", ativo=False))

    ativos = service.listar(ativo=True)

    assert len(ativos) == 1
    assert ativos[0].nome == "API Pagamentos"


def test_atualizar_substitui_todos_os_campos(service):
    criado = service.criar(Servico(nome="API Pagamentos", url="https://pagamentos.exemplo.com"))

    atualizado = service.atualizar(
        criado.id,
        Servico(nome="API Pagamentos v2", url="https://pagamentos.exemplo.com/v2", ativo=False),
    )

    assert atualizado.nome == "API Pagamentos v2"
    assert atualizado.ativo is False


def test_atualizar_retorna_none_para_servico_inexistente(service):
    dados = Servico(nome="API Pagamentos", url="https://pagamentos.exemplo.com")
    assert service.atualizar(999, dados) is None


def test_atualizar_parcialmente_altera_so_campos_informados(service):
    criado = service.criar(
        Servico(nome="API Pagamentos", url="https://pagamentos.exemplo.com", ativo=True)
    )

    atualizado = service.atualizar_parcialmente(criado.id, ServicoUpdate(ativo=False))

    assert atualizado.ativo is False
    assert atualizado.nome == "API Pagamentos"


def test_atualizar_parcialmente_retorna_none_para_servico_inexistente(service):
    assert service.atualizar_parcialmente(999, ServicoUpdate(ativo=False)) is None


def test_deletar_remove_servico(service):
    criado = service.criar(Servico(nome="API Pagamentos", url="https://pagamentos.exemplo.com"))

    assert service.deletar(criado.id) is True
    assert service.obter(criado.id) is None


def test_deletar_retorna_false_para_servico_inexistente(service):
    assert service.deletar(999) is False


def test_criar_rejeita_nome_duplicado(service):
    service.criar(Servico(nome="API Pagamentos", url="https://pagamentos.exemplo.com"))

    with pytest.raises(NomeDuplicadoError):
        service.criar(Servico(nome="API Pagamentos", url="https://outra.exemplo.com"))


def test_atualizar_parcialmente_rejeita_nome_de_outro_servico(service):
    service.criar(Servico(nome="API Pagamentos", url="https://pagamentos.exemplo.com"))
    legado = service.criar(Servico(nome="API Legado", url="https://legado.exemplo.com"))

    with pytest.raises(NomeDuplicadoError):
        service.atualizar_parcialmente(legado.id, ServicoUpdate(nome="API Pagamentos"))


def test_atualizar_permite_manter_o_proprio_nome(service):
    criado = service.criar(Servico(nome="API Pagamentos", url="https://pagamentos.exemplo.com"))

    atualizado = service.atualizar(
        criado.id, Servico(nome="API Pagamentos", url="https://nova.exemplo.com", ativo=False)
    )

    assert atualizado.url == "https://nova.exemplo.com"
