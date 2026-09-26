from typing import Optional

from schemas import Item, ItemOut, ItemUpdate


class ItemStore:
    def __init__(self) -> None:
        self._items: dict[int, ItemOut] = {}
        self._next_id = 1

    def clear(self) -> None:
        self._items.clear()
        self._next_id = 1

    def create(self, item: Item) -> ItemOut:
        new_item = ItemOut(id=self._next_id, **item.model_dump())
        self._items[self._next_id] = new_item
        self._next_id += 1
        return new_item

    def list(self, name: Optional[str] = None) -> list[ItemOut]:
        items = list(self._items.values())
        if name is not None:
            needle = name.lower()
            items = [item for item in items if needle in item.name.lower()]
        return items

    def get(self, item_id: int) -> Optional[ItemOut]:
        return self._items.get(item_id)

    def update(self, item_id: int, item: Item) -> Optional[ItemOut]:
        if item_id not in self._items:
            return None
        updated = ItemOut(id=item_id, **item.model_dump())
        self._items[item_id] = updated
        return updated

    def partial_update(self, item_id: int, changes: ItemUpdate) -> Optional[ItemOut]:
        current = self._items.get(item_id)
        if current is None:
            return None
        updated = current.model_copy(update=changes.model_dump(exclude_unset=True))
        self._items[item_id] = updated
        return updated

    def delete(self, item_id: int) -> bool:
        if item_id not in self._items:
            return False
        del self._items[item_id]
        return True


store = ItemStore()


def calculate_total_price(price: float, quantity: int, discount: float = 0.0) -> float:
    if price < 0:
        raise ValueError("price nao pode ser negativo")
    if quantity < 0:
        raise ValueError("quantity nao pode ser negativo")
    if not 0 <= discount <= 1:
        raise ValueError("discount deve estar entre 0 e 1")
    return round(price * quantity * (1 - discount), 2)
