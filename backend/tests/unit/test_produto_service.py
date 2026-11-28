from decimal import Decimal

import pytest

from app.schemas.movimentacao import MovimentacaoCreate
from app.schemas.produto import ProdutoCreate, ProdutoPatch, ProdutoUpdate
from app.services.excecoes import (
    NomeDuplicadoError,
    ProdutoComEstoqueError,
    ProdutoNaoEncontradoError,
)
from app.services.regras_estoque import EstoqueInsuficienteError, TipoMovimentacao


def novo_produto(nome="Arroz", categoria="Grãos", estoque_minimo=5, custo="6.50"):
    return ProdutoCreate(
        nome=nome,
        categoria=categoria,
        unidade="kg",
        estoque_minimo=estoque_minimo,
        custo_unitario=Decimal(custo),
    )


def entrada(quantidade, observacao=None):
    return MovimentacaoCreate(
        tipo=TipoMovimentacao.ENTRADA, quantidade=quantidade, observacao=observacao
    )


def saida(quantidade):
    return MovimentacaoCreate(tipo=TipoMovimentacao.SAIDA, quantidade=quantidade)


def test_criar_produto_comeca_com_quantidade_zero(service):
    produto = service.criar(novo_produto())

    assert produto.id == 1
    assert produto.quantidade == 0


def test_nome_duplicado_ignora_maiusculas(service):
    service.criar(novo_produto(nome="Arroz"))

    with pytest.raises(NomeDuplicadoError):
        service.criar(novo_produto(nome="ARROZ"))


def test_obter_produto_inexistente_gera_erro(service):
    with pytest.raises(ProdutoNaoEncontradoError):
        service.obter(999)


def test_entrada_aumenta_a_quantidade_e_guarda_o_saldo(service):
    produto = service.criar(novo_produto())

    movimentacao = service.registrar_movimentacao(produto.id, entrada(10, "compra semanal"))

    assert produto.quantidade == 10
    assert movimentacao.saldo_apos == 10
    assert movimentacao.observacao == "compra semanal"


def test_saida_maior_que_o_estoque_nao_altera_a_quantidade(service):
    produto = service.criar(novo_produto())
    service.registrar_movimentacao(produto.id, entrada(3))

    with pytest.raises(EstoqueInsuficienteError):
        service.registrar_movimentacao(produto.id, saida(5))

    assert produto.quantidade == 3
    assert len(service.listar_movimentacoes(produto.id)) == 1


def test_movimentacoes_mais_recentes_primeiro(service):
    produto = service.criar(novo_produto())
    service.registrar_movimentacao(produto.id, entrada(10))
    service.registrar_movimentacao(produto.id, saida(4))

    historico = service.listar_movimentacoes(produto.id)

    assert [m.tipo for m in historico] == ["saida", "entrada"]
    assert [m.saldo_apos for m in historico] == [6, 10]


def test_atualizar_produto_nao_muda_a_quantidade(service):
    produto = service.criar(novo_produto())
    service.registrar_movimentacao(produto.id, entrada(8))

    atualizado = service.atualizar(
        produto.id,
        ProdutoUpdate(
            nome="Arroz Agulhinha",
            categoria="Grãos",
            unidade="kg",
            estoque_minimo=10,
            custo_unitario=Decimal("7.00"),
        ),
    )

    assert atualizado.nome == "Arroz Agulhinha"
    assert atualizado.quantidade == 8


def test_atualizar_parcialmente_altera_so_os_campos_enviados(service):
    produto = service.criar(novo_produto())

    atualizado = service.atualizar_parcialmente(produto.id, ProdutoPatch(estoque_minimo=20))

    assert atualizado.estoque_minimo == 20
    assert atualizado.nome == "Arroz"


def test_renomear_para_nome_de_outro_produto_gera_erro(service):
    service.criar(novo_produto(nome="Arroz"))
    feijao = service.criar(novo_produto(nome="Feijão"))

    with pytest.raises(NomeDuplicadoError):
        service.atualizar_parcialmente(feijao.id, ProdutoPatch(nome="arroz"))


def test_nao_exclui_produto_com_estoque(service):
    produto = service.criar(novo_produto())
    service.registrar_movimentacao(produto.id, entrada(2))

    with pytest.raises(ProdutoComEstoqueError):
        service.excluir(produto.id)


def test_exclui_produto_zerado_e_seu_historico(service):
    produto = service.criar(novo_produto())
    service.registrar_movimentacao(produto.id, entrada(2))
    service.registrar_movimentacao(produto.id, saida(2))

    service.excluir(produto.id)

    with pytest.raises(ProdutoNaoEncontradoError):
        service.obter(produto.id)
    assert service.movimentacoes.banco.movimentacoes == {}


def test_listar_filtra_por_estoque_baixo(service):
    arroz = service.criar(novo_produto(nome="Arroz", estoque_minimo=5))
    feijao = service.criar(novo_produto(nome="Feijão", estoque_minimo=5))
    service.registrar_movimentacao(arroz.id, entrada(20))
    service.registrar_movimentacao(feijao.id, entrada(2))

    baixos = service.listar(estoque_baixo=True)

    assert [p.nome for p in baixos] == ["Feijão"]


def test_listar_busca_por_nome_e_categoria(service):
    service.criar(novo_produto(nome="Arroz", categoria="Grãos"))
    service.criar(novo_produto(nome="Alcatra", categoria="Carnes"))

    assert [p.nome for p in service.listar(busca="arr")] == ["Arroz"]
    assert [p.nome for p in service.listar(categoria="carnes")] == ["Alcatra"]


def test_resumo_do_estoque(service):
    arroz = service.criar(novo_produto(nome="Arroz", estoque_minimo=5, custo="6.50"))
    feijao = service.criar(novo_produto(nome="Feijão", estoque_minimo=5, custo="8.00"))
    service.registrar_movimentacao(arroz.id, entrada(10))
    service.registrar_movimentacao(feijao.id, entrada(2))

    resumo = service.resumo()

    assert resumo.total_produtos == 2
    assert resumo.produtos_estoque_baixo == 1
    assert resumo.valor_total_estoque == 81.0
