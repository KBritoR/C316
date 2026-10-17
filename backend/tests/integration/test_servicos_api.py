def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_criar_servico(client):
    response = client.post(
        "/servicos",
        json={"nome": "API Pagamentos", "url": "https://pagamentos.exemplo.com", "ativo": True},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["nome"] == "API Pagamentos"
    assert isinstance(data["id"], int)


def test_criar_servico_com_url_invalida_retorna_422(client):
    response = client.post("/servicos", json={"nome": "API Invalida", "url": "ftp://exemplo.com"})
    assert response.status_code == 422


def test_criar_servico_com_nome_vazio_retorna_422(client):
    response = client.post("/servicos", json={"nome": "   ", "url": "https://exemplo.com"})
    assert response.status_code == 422


def test_listar_servicos_vazio(client):
    response = client.get("/servicos")
    assert response.status_code == 200
    assert response.json() == []


def test_servico_persiste_entre_requisicoes(client):
    criado = client.post(
        "/servicos", json={"nome": "API Pagamentos", "url": "https://pagamentos.exemplo.com"}
    ).json()

    response = client.get(f"/servicos/{criado['id']}")

    assert response.status_code == 200
    assert response.json()["nome"] == "API Pagamentos"


def test_listar_servicos_filtra_por_ativo(client):
    client.post(
        "/servicos",
        json={"nome": "API Pagamentos", "url": "https://pagamentos.exemplo.com", "ativo": True},
    )
    client.post(
        "/servicos",
        json={"nome": "API Legado", "url": "https://legado.exemplo.com", "ativo": False},
    )

    response = client.get("/servicos", params={"ativo": True})

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["nome"] == "API Pagamentos"


def test_obter_servico_inexistente_retorna_404(client):
    response = client.get("/servicos/999999")
    assert response.status_code == 404


def test_atualizar_servico_com_put(client):
    criado = client.post(
        "/servicos", json={"nome": "API Pagamentos", "url": "https://pagamentos.exemplo.com"}
    ).json()

    response = client.put(
        f"/servicos/{criado['id']}",
        json={"nome": "API Pagamentos v2", "url": "https://pagamentos.exemplo.com/v2", "ativo": False},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["nome"] == "API Pagamentos v2"
    assert data["ativo"] is False


def test_atualizar_servico_inexistente_com_put_retorna_404(client):
    response = client.put(
        "/servicos/999999",
        json={"nome": "API Pagamentos", "url": "https://pagamentos.exemplo.com", "ativo": True},
    )
    assert response.status_code == 404


def test_atualizar_parcialmente_servico_com_patch(client):
    criado = client.post(
        "/servicos",
        json={"nome": "API Pagamentos", "url": "https://pagamentos.exemplo.com", "ativo": True},
    ).json()

    response = client.patch(f"/servicos/{criado['id']}", json={"ativo": False})

    assert response.status_code == 200
    data = response.json()
    assert data["ativo"] is False
    assert data["nome"] == "API Pagamentos"


def test_patch_rejeita_valor_nulo(client):
    criado = client.post(
        "/servicos", json={"nome": "API Pagamentos", "url": "https://pagamentos.exemplo.com"}
    ).json()

    response = client.patch(f"/servicos/{criado['id']}", json={"nome": None})

    assert response.status_code == 422


def test_patch_servico_inexistente_retorna_404(client):
    response = client.patch("/servicos/999999", json={"ativo": False})
    assert response.status_code == 404


def test_deletar_servico(client):
    criado = client.post(
        "/servicos", json={"nome": "API Pagamentos", "url": "https://pagamentos.exemplo.com"}
    ).json()

    delete_resp = client.delete(f"/servicos/{criado['id']}")
    assert delete_resp.status_code == 204

    get_resp = client.get(f"/servicos/{criado['id']}")
    assert get_resp.status_code == 404


def test_deletar_servico_inexistente_retorna_404(client):
    response = client.delete("/servicos/999999")
    assert response.status_code == 404
