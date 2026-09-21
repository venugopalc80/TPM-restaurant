from fastapi import FastAPI, HTTPException

from .db import supabase
from .schemas import CreateOrderRequest, OrderResponse


app = FastAPI(
    title="TPM Restaurant API",
    version="0.1.0",
    description="Shared ordering API for the TPM restaurant website, dashboard and AI phone agent.",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/restaurants/{restaurant_id}")
def get_restaurant(restaurant_id: str):
    result = (
        supabase.table("restaurants")
        .select("id,name,phone,email,currency,active")
        .eq("id", restaurant_id)
        .eq("active", True)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return result.data


@app.get("/restaurants/{restaurant_id}/menu")
def get_menu(restaurant_id: str):
    result = (
        supabase.table("menu_categories")
        .select(
            "id,name,cuisine,sort_order,menu_items("
            "id,name,description,price,allergens,dietary_tags,spice_level,available"
            ")"
        )
        .eq("restaurant_id", restaurant_id)
        .order("sort_order")
        .execute()
    )
    return {"restaurant_id": restaurant_id, "categories": result.data or []}


@app.get("/restaurants/{restaurant_id}/menu/items/{menu_item_id}")
def get_menu_item(restaurant_id: str, menu_item_id: str):
    result = (
        supabase.table("menu_items")
        .select(
            "id,restaurant_id,category_id,name,description,price,"
            "allergens,dietary_tags,spice_level,available"
        )
        .eq("restaurant_id", restaurant_id)
        .eq("id", menu_item_id)
        .eq("available", True)
        .maybe_single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Menu item not found or unavailable")
    return result.data


@app.post("/orders", response_model=OrderResponse)
def create_order(payload: CreateOrderRequest):
    if payload.order_type == "delivery" and not payload.delivery_address:
        raise HTTPException(status_code=400, detail="Delivery address is required")

    rpc_payload = {
        "p_restaurant_id": payload.restaurant_id,
        "p_source": payload.source,
        "p_order_type": payload.order_type,
        "p_customer_name": payload.customer_name,
        "p_customer_phone": payload.customer_phone,
        "p_delivery_address": payload.delivery_address,
        "p_notes": payload.notes,
        "p_items": [item.model_dump() for item in payload.items],
    }

    try:
        result = supabase.rpc("create_restaurant_order", rpc_payload).execute()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not result.data:
        raise HTTPException(status_code=400, detail="Order could not be created")

    return result.data


@app.get("/restaurants/{restaurant_id}/orders")
def list_orders(restaurant_id: str, limit: int = 50):
    limit = max(1, min(limit, 100))
    result = (
        supabase.table("orders")
        .select(
            "id,order_number,source,order_type,status,customer_name,customer_phone,"
            "delivery_address,notes,subtotal,delivery_fee,total,created_at,updated_at,"
            "order_items(id,item_name,unit_price,quantity,line_total,notes)"
        )
        .eq("restaurant_id", restaurant_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return {"orders": result.data or []}
