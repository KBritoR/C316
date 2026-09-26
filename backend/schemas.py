from typing import Optional

from pydantic import BaseModel


class Item(BaseModel):
    name: str
    price: float
    quantity: int = 1


class ItemOut(Item):
    id: int


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
