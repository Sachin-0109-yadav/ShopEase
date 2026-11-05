
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from database.database import get_db
from dependencies.auth import get_current_admin
from models.models import Order, User
from schemas.admin_order import (
    AdminOrderResponse,
    AdminOrderStatusUpdate,
    ALLOWED_ORDER_STATUSES,
)


router = APIRouter(
    prefix="/admin/orders",
    tags=["Admin Orders"],
)


# Get all customer orders
@router.get("/", response_model=list[AdminOrderResponse])
def get_all_orders(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    orders = db.scalars(
        select(Order)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    ).all()

    return orders


# Get one order by ID
@router.get("/{order_id}", response_model=AdminOrderResponse)
def get_order_details(
    order_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    order = db.scalars(
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.items))
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found.",
        )

    return order


# Update order status
@router.patch("/{order_id}/status", response_model=AdminOrderResponse)
def update_order_status(
    order_id: int,
    status_data: AdminOrderStatusUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    if status_data.status not in ALLOWED_ORDER_STATUSES:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Invalid order status.",
                "allowed_statuses": ALLOWED_ORDER_STATUSES,
            },
        )

    order = db.scalars(
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.items))
        .with_for_update()
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found.",
        )

    # Do not allow changing a cancelled order.
    if order.status == "Cancelled":
        raise HTTPException(
            status_code=400,
            detail="A cancelled order cannot be updated.",
        )

    # Do not allow reopening a delivered order.
    if order.status == "Delivered":
        raise HTTPException(
            status_code=400,
            detail="A delivered order cannot be updated.",
        )

    # Update order status.
    order.status = status_data.status

    db.commit()
    db.refresh(order)

    return order
