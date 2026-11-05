from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class WishlistItemCreate(BaseModel):
    product_id: int = Field(gt=0)


class WishlistProductResponse(BaseModel):
    id: int
    name: str
    slug: str
    price: Decimal
    discount_price: Decimal | None = None
    stock_quantity: int
    image_url: str | None = None


class WishlistItemResponse(BaseModel):
    id: int
    product: WishlistProductResponse
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WishlistResponse(BaseModel):
    items: list[WishlistItemResponse]
    total_items: int