import pytest
from pydantic import ValidationError

from app.schemas.servico import Servico, ServicoUpdate


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
