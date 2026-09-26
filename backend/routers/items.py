from typing import Optional

from fastapi import APIRouter, HTTPException

from schemas import Item, ItemOut, ItemUpdate
from services import store

router = APIRouter(prefix="/items", tags=["items"])


@router.post("", response_model=ItemOut, status_code=201)
def create_item(item: Item):
    return store.create(item)


@router.get("", response_model=list[ItemOut])
def list_items(name: Optional[str] = None):
    return store.list(name=name)


@router.get("/{item_id}", response_model=ItemOut)
def get_item(item_id: int):
    item = store.get(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item nao encontrado")
    return item


@router.put("/{item_id}", response_model=ItemOut)
def update_item(item_id: int, item: Item):
    updated = store.update(item_id, item)
    if updated is None:
        raise HTTPException(status_code=404, detail="Item nao encontrado")
    return updated


@router.patch("/{item_id}", response_model=ItemOut)
def partial_update_item(item_id: int, changes: ItemUpdate):
    updated = store.partial_update(item_id, changes)
    if updated is None:
        raise HTTPException(status_code=404, detail="Item nao encontrado")
    return updated


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int):
    if not store.delete(item_id):
        raise HTTPException(status_code=404, detail="Item nao encontrado")
    return None
