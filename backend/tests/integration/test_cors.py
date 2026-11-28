ORIGEM_FRONTEND = "http://localhost:5173"


def preflight(client, origem, metodo="POST"):
    return client.options(
        "/produtos",
        headers={
            "Origin": origem,
            "Access-Control-Request-Method": metodo,
            "Access-Control-Request-Headers": "Content-Type",
        },
    )


def test_cors_libera_a_origem_do_frontend(client):
    response = preflight(client, ORIGEM_FRONTEND)

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == ORIGEM_FRONTEND
    for metodo in ("GET", "POST", "PUT", "PATCH", "DELETE"):
        assert metodo in response.headers["access-control-allow-methods"]


def test_cors_bloqueia_origem_desconhecida(client):
    response = preflight(client, "http://site-desconhecido.exemplo.com")

    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers


def test_resposta_normal_traz_o_cabecalho_de_cors(client):
    response = client.get("/produtos", headers={"Origin": ORIGEM_FRONTEND})

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == ORIGEM_FRONTEND
