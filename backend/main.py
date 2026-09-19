from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="C316 Backend")


class Item(BaseModel):
    name: str
    price: float
    quantity: int = 1


class ItemOut(Item):
    id: int


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

    def list(self) -> list[ItemOut]:
        return list(self._items.values())

    def get(self, item_id: int) -> Optional[ItemOut]:
        return self._items.get(item_id)

    def update(self, item_id: int, item: Item) -> Optional[ItemOut]:
        if item_id not in self._items:
            return None
        updated = ItemOut(id=item_id, **item.model_dump())
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


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/items", response_model=ItemOut, status_code=201)
def create_item(item: Item):
    return store.create(item)


@app.get("/items", response_model=list[ItemOut])
def list_items():
    return store.list()


@app.get("/items/{item_id}", response_model=ItemOut)
def get_item(item_id: int):
    item = store.get(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item nao encontrado")
    return item


@app.put("/items/{item_id}", response_model=ItemOut)
def update_item(item_id: int, item: Item):
    updated = store.update(item_id, item)
    if updated is None:
        raise HTTPException(status_code=404, detail="Item nao encontrado")
    return updated


@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int):
    if not store.delete(item_id):
        raise HTTPException(status_code=404, detail="Item nao encontrado")
    return None
