import pytest

from app.services.regras_estoque import (
    EstoqueInsuficienteError,
    QuantidadeInvalidaError,
    TipoMovimentacao,
    calcular_novo_saldo,
    esta_com_estoque_baixo,
)


@pytest.mark.parametrize(
    ("saldo_atual", "tipo", "quantidade", "esperado"),
    [
        (0, TipoMovimentacao.ENTRADA, 10, 10),
        (5, TipoMovimentacao.ENTRADA, 3, 8),
        (10, TipoMovimentacao.SAIDA, 4, 6),
        (10, TipoMovimentacao.SAIDA, 10, 0),
    ],
)
def test_calcular_novo_saldo(saldo_atual, tipo, quantidade, esperado):
    assert calcular_novo_saldo(saldo_atual, tipo, quantidade) == esperado


def test_saida_maior_que_o_saldo_gera_erro():
    with pytest.raises(EstoqueInsuficienteError) as erro:
        calcular_novo_saldo(3, TipoMovimentacao.SAIDA, 5)

    assert erro.value.saldo_atual == 3
    assert erro.value.quantidade == 5


@pytest.mark.parametrize("quantidade", [0, -1, -10])
@pytest.mark.parametrize("tipo", [TipoMovimentacao.ENTRADA, TipoMovimentacao.SAIDA])
def test_quantidade_menor_ou_igual_a_zero_gera_erro(tipo, quantidade):
    with pytest.raises(QuantidadeInvalidaError):
        calcular_novo_saldo(10, tipo, quantidade)


@pytest.mark.parametrize(
    ("quantidade", "estoque_minimo", "esperado"),
    [
        (2, 5, True),
        (5, 5, True),
        (0, 0, True),
        (6, 5, False),
    ],
)
def test_esta_com_estoque_baixo(quantidade, estoque_minimo, esperado):
    assert esta_com_estoque_baixo(quantidade, estoque_minimo) is esperado
