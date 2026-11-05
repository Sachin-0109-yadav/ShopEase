
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=10, max_length=15)
    house_number: str = Field(min_length=1, max_length=100)
    street: str = Field(min_length=2, max_length=200)
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    pin_code: str = Field(pattern=r"^[0-9]{6}$")
    payment_method: str = "COD"


class OrderItemResponse(BaseModel):
    id: int
    product_id: int | None
    product_name: str
    product_image: str | None
    quantity: int
    unit_price: Decimal

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: int
    order_number: str
    customer_name: str
    phone: str
    email: str

    house_number: str
    street: str
    city: str
    state: str
    pin_code: str

    subtotal: Decimal
    discount_amount: Decimal
    delivery_charge: Decimal
    total_amount: Decimal

    payment_method: str
    payment_status: str
    status: str

    created_at: datetime
    items: list[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)
