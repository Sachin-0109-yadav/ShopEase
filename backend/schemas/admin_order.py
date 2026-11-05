
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from schemas.order import OrderItemResponse


ALLOWED_ORDER_STATUSES = [
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
]


class AdminOrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: int

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
    updated_at: datetime

    items: list[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)


class AdminOrderStatusUpdate(BaseModel):
    status: str = Field(
        min_length=3,
        max_length=30,
    )
