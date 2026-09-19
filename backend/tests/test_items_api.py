def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_item(client):
    response = client.post("/items", json={"name": "Caneta", "price": 2.5, "quantity": 10})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Caneta"
    assert data["id"] == 1


def test_list_items_empty(client):
    response = client.get("/items")
    assert response.status_code == 200
    assert response.json() == []


def test_get_item_not_found_returns_404(client):
    response = client.get("/items/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Item nao encontrado"


def test_update_and_delete_item(client):
    create_resp = client.post("/items", json={"name": "Caderno", "price": 15.0})
    item_id = create_resp.json()["id"]

    update_resp = client.put(f"/items/{item_id}", json={"name": "Caderno Grande", "price": 20.0})
    assert update_resp.status_code == 200
    assert update_resp.json()["name"] == "Caderno Grande"

    delete_resp = client.delete(f"/items/{item_id}")
    assert delete_resp.status_code == 204

    get_resp = client.get(f"/items/{item_id}")
    assert get_resp.status_code == 404
