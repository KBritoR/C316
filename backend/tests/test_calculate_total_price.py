import pytest

from main import calculate_total_price


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
