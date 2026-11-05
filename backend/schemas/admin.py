
from decimal import Decimal

from pydantic import BaseModel, Field, ConfigDict


class AdminProductImageResponse(BaseModel):
    id: int
    product_id: int
    image_url: str
    alt_text: str | None = None
    is_primary: bool

    model_config = ConfigDict(from_attributes=True)


class AdminProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    slug: str = Field(min_length=2, max_length=220)
    description: str = Field(min_length=5)

    price: Decimal = Field(gt=0)
    discount_price: Decimal | None = Field(default=None, gt=0)

    brand: str | None = None
    category_id: int = Field(gt=0)

    stock_quantity: int = Field(default=0, ge=0)

    is_active: bool = True
    is_featured: bool = False


class AdminProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=200)
    slug: str | None = Field(default=None, min_length=2, max_length=220)
    description: str | None = Field(default=None, min_length=5)

    price: Decimal | None = Field(default=None, gt=0)
    discount_price: Decimal | None = Field(default=None, gt=0)

    brand: str | None = None
    category_id: int | None = Field(default=None, gt=0)

    stock_quantity: int | None = Field(default=None, ge=0)

    is_active: bool | None = None
    is_featured: bool | None = None


class AdminProductResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: str

    price: Decimal
    discount_price: Decimal | None

    brand: str | None
    category_id: int
    stock_quantity: int

    is_active: bool
    is_featured: bool

    images: list[AdminProductImageResponse] = Field(
        default_factory=list
    )

    model_config = ConfigDict(from_attributes=True)
