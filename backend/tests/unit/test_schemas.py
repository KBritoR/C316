import pytest
from pydantic import ValidationError

from app.schemas.movimentacao import MovimentacaoCreate
from app.schemas.produto import ProdutoCreate, ProdutoPatch

DADOS_VALIDOS = {
    "nome": "Arroz",
    "categoria": "Grãos",
    "unidade": "kg",
    "estoque_minimo": 5,
    "custo_unitario": "6.50",
}


def test_produto_valido_remove_espacos_do_nome():
    produto = ProdutoCreate(**{**DADOS_VALIDOS, "nome": "  Arroz  "})

    assert produto.nome == "Arroz"


@pytest.mark.parametrize(
    ("campo", "valor"),
    [
        ("nome", "   "),
        ("categoria", ""),
        ("unidade", "tonelada"),
        ("estoque_minimo", -1),
        ("custo_unitario", "-0.01"),
        ("custo_unitario", "1.999"),
    ],
)
def test_produto_invalido(campo, valor):
    with pytest.raises(ValidationError):
        ProdutoCreate(**{**DADOS_VALIDOS, campo: valor})


def test_patch_rejeita_nulo_explicito():
    with pytest.raises(ValidationError):
        ProdutoPatch(nome=None)


def test_patch_sem_campos_e_valido():
    assert ProdutoPatch().model_dump(exclude_unset=True) == {}


@pytest.mark.parametrize("quantidade", [0, -3])
def test_movimentacao_exige_quantidade_positiva(quantidade):
    with pytest.raises(ValidationError):
        MovimentacaoCreate(tipo="entrada", quantidade=quantidade)


def test_movimentacao_com_tipo_invalido():
    with pytest.raises(ValidationError):
        MovimentacaoCreate(tipo="ajuste", quantidade=1)
