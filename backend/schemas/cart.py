from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CartItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(default=1, ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)


class CartProductResponse(BaseModel):
    id: int
    name: str
    price: Decimal
    discount_price: Decimal | None = None
    stock_quantity: int
    image_url: str | None = None


class CartItemResponse(BaseModel):
    id: int
    quantity: int
    product: CartProductResponse
    line_total: Decimal


class CartResponse(BaseModel):
    items: list[CartItemResponse]
    subtotal: Decimal
    total_items: int