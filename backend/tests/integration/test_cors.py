ORIGEM_FRONTEND = "http://localhost:5173"


def test_cors_permite_origem_do_frontend(client):
    response = client.options(
        "/servicos",
        headers={
            "Origin": ORIGEM_FRONTEND,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == ORIGEM_FRONTEND


def test_cors_nao_libera_origem_desconhecida(client):
    response = client.options(
        "/servicos",
        headers={
            "Origin": "http://site-malicioso.exemplo.com",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers
