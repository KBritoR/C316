import pytest

ARROZ = {
    "nome": "Arroz",
    "categoria": "Grãos",
    "unidade": "kg",
    "estoque_minimo": 5,
    "custo_unitario": "6.50",
}


@pytest.fixture
def arroz(client):
    return client.post("/produtos", json=ARROZ).json()


def movimentar(client, produto_id, tipo, quantidade, observacao=None):
    return client.post(
        f"/produtos/{produto_id}/movimentacoes",
        json={"tipo": tipo, "quantidade": quantidade, "observacao": observacao},
    )


def test_criar_produto(client):
    response = client.post("/produtos", json=ARROZ)

    assert response.status_code == 201
    corpo = response.json()
    assert corpo["nome"] == "Arroz"
    assert corpo["quantidade"] == 0
    assert corpo["custo_unitario"] == 6.5
    assert corpo["estoque_baixo"] is True


def test_criar_produto_com_nome_repetido_retorna_409(client, arroz):
    response = client.post("/produtos", json={**ARROZ, "nome": "arroz"})

    assert response.status_code == 409
    assert response.json()["detail"] == "Já existe um produto com esse nome"


def test_criar_produto_invalido_retorna_422(client):
    response = client.post("/produtos", json={**ARROZ, "unidade": "tonelada"})

    assert response.status_code == 422


def test_listar_e_obter_produto(client, arroz):
    assert [p["nome"] for p in client.get("/produtos").json()] == ["Arroz"]
    assert client.get(f"/produtos/{arroz['id']}").json()["nome"] == "Arroz"


def test_obter_produto_inexistente_retorna_404(client):
    response = client.get("/produtos/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Produto 999 não encontrado"


def test_listar_com_filtros(client, arroz):
    client.post("/produtos", json={**ARROZ, "nome": "Alcatra", "categoria": "Carnes"})
    movimentar(client, arroz["id"], "entrada", 20)

    assert [p["nome"] for p in client.get("/produtos", params={"busca": "alc"}).json()] == [
        "Alcatra"
    ]
    assert [p["nome"] for p in client.get("/produtos", params={"categoria": "grãos"}).json()] == [
        "Arroz"
    ]
    baixos = client.get("/produtos", params={"estoque_baixo": True}).json()
    assert [p["nome"] for p in baixos] == ["Alcatra"]


def test_put_substitui_os_campos(client, arroz):
    dados = {**ARROZ, "nome": "Arroz Integral", "estoque_minimo": 2}

    response = client.put(f"/produtos/{arroz['id']}", json=dados)

    assert response.status_code == 200
    assert response.json()["nome"] == "Arroz Integral"
    assert response.json()["estoque_minimo"] == 2


def test_patch_altera_so_o_que_foi_enviado(client, arroz):
    response = client.patch(f"/produtos/{arroz['id']}", json={"custo_unitario": "7.25"})

    assert response.status_code == 200
    assert response.json()["custo_unitario"] == 7.25
    assert response.json()["nome"] == "Arroz"


def test_patch_com_nulo_retorna_422(client, arroz):
    response = client.patch(f"/produtos/{arroz['id']}", json={"nome": None})

    assert response.status_code == 422


def test_registrar_entrada_e_saida(client, arroz):
    entrada = movimentar(client, arroz["id"], "entrada", 10, "compra do fornecedor")
    saida = movimentar(client, arroz["id"], "saida", 4)

    assert entrada.status_code == 201
    assert saida.status_code == 201
    assert saida.json()["saldo_apos"] == 6
    assert client.get(f"/produtos/{arroz['id']}").json()["quantidade"] == 6

    historico = client.get(f"/produtos/{arroz['id']}/movimentacoes").json()
    assert [m["tipo"] for m in historico] == ["saida", "entrada"]


def test_saida_maior_que_o_estoque_retorna_409(client, arroz):
    movimentar(client, arroz["id"], "entrada", 2)

    response = movimentar(client, arroz["id"], "saida", 5)

    assert response.status_code == 409
    assert "Estoque insuficiente" in response.json()["detail"]
    assert client.get(f"/produtos/{arroz['id']}").json()["quantidade"] == 2


def test_movimentacao_com_quantidade_zero_retorna_422(client, arroz):
    assert movimentar(client, arroz["id"], "entrada", 0).status_code == 422


def test_movimentacao_em_produto_inexistente_retorna_404(client):
    assert movimentar(client, 999, "entrada", 1).status_code == 404


def test_excluir_produto_com_estoque_retorna_409(client, arroz):
    movimentar(client, arroz["id"], "entrada", 1)

    response = client.delete(f"/produtos/{arroz['id']}")

    assert response.status_code == 409


def test_excluir_produto_zerado(client, arroz):
    response = client.delete(f"/produtos/{arroz['id']}")

    assert response.status_code == 204
    assert client.get(f"/produtos/{arroz['id']}").status_code == 404


def test_resumo_do_estoque(client, arroz):
    movimentar(client, arroz["id"], "entrada", 10)

    resumo = client.get("/estoque/resumo").json()

    assert resumo == {"total_produtos": 1, "produtos_estoque_baixo": 0, "valor_total_estoque": 65.0}
