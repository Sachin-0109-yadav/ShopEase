
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class ProductImageResponse(BaseModel):
    id: int
    image_url: str
    alt_text: str | None = None
    is_primary: bool

    model_config = ConfigDict(from_attributes=True)


class ProductResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None = None
    price: Decimal
    discount_price: Decimal | None = None
    brand: str | None = None
    category_id: int
    stock_quantity: int
    rating: Decimal
    review_count: int
    is_active: bool
    is_featured: bool
    created_at: datetime
    updated_at: datetime | None = None
    images: list[ProductImageResponse] = []

    model_config = ConfigDict(from_attributes=True)
