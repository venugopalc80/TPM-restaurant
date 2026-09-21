from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


class OrderItemInput(BaseModel):
    menu_item_id: str
    quantity: int = Field(gt=0)
    notes: str | None = None


class CreateOrderRequest(BaseModel):
    restaurant_id: str
    source: Literal["website", "phone", "staff"] = "website"
    order_type: Literal["collection", "delivery"] = "collection"
    customer_name: str = Field(min_length=1, max_length=120)
    customer_phone: str = Field(min_length=3, max_length=40)
    delivery_address: str | None = None
    notes: str | None = None
    items: list[OrderItemInput] = Field(min_length=1)


class UpdateOrderStatusRequest(BaseModel):
    status: Literal[
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
        "completed",
        "cancelled",
    ]


class OrderResponse(BaseModel):
    order_id: str
    customer_id: str
    subtotal: Decimal
    delivery_fee: Decimal
    total: Decimal
