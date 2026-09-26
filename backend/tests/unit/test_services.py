import pytest

from schemas import Item, ItemUpdate
from services import ItemStore, calculate_total_price


@pytest.fixture
def store():
    return ItemStore()


@pytest.mark.parametrize(
    "price, quantity, discount, expected",
    [
        (10, 2, 0, 20),
        (10, 2, 0.5, 10),
        (19.99, 3, 0, 59.97),
        (100, 1, 0.25, 75),
    ],
)
def test_calculate_total_price(price, quantity, discount, expected):
    assert calculate_total_price(price, quantity, discount) == expected


def test_calculate_total_price_negative_price_raises_error():
    with pytest.raises(ValueError):
        calculate_total_price(-10, 1)


def test_calculate_total_price_invalid_discount_raises_error():
    with pytest.raises(ValueError):
        calculate_total_price(10, 1, discount=1.5)


def test_store_create_assigns_incrementing_ids(store):
    first = store.create(Item(name="Caneta", price=2.5))
    second = store.create(Item(name="Lapis", price=1.0))
    assert first.id == 1
    assert second.id == 2


def test_store_get_returns_none_for_missing_item(store):
    assert store.get(999) is None


def test_store_partial_update_changes_only_given_fields(store):
    created = store.create(Item(name="Caderno", price=15.0, quantity=3))
    updated = store.partial_update(created.id, ItemUpdate(price=20.0))
    assert updated.price == 20.0
    assert updated.name == "Caderno"
    assert updated.quantity == 3


def test_store_partial_update_returns_none_for_missing_item(store):
    assert store.partial_update(999, ItemUpdate(price=20.0)) is None


def test_store_list_filters_by_name(store):
    store.create(Item(name="Caderno", price=15.0))
    store.create(Item(name="Caneta", price=2.5))
    result = store.list(name="cad")
    assert len(result) == 1
    assert result[0].name == "Caderno"
