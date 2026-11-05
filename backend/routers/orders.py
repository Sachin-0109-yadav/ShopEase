
import secrets
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from database.database import get_db
from dependencies.auth import get_current_user
from models.models import CartItem, Order, OrderItem, Product, User
from schemas.order import OrderCreate, OrderResponse


router = APIRouter(prefix="/orders", tags=["Orders"])

DELIVERY_CHARGE = Decimal("0.00")


@router.post(
    "/place",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
def place_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        # Only COD payments are supported.
        if order_data.payment_method != "COD":
            raise HTTPException(
                status_code=400,
                detail="Only Cash on Delivery is currently supported.",
            )

        # Lock this customer's cart rows.
        cart_items = db.scalars(
            select(CartItem)
            .where(CartItem.user_id == current_user.id)
            .order_by(CartItem.product_id)
            .with_for_update()
        ).all()

        if not cart_items:
            raise HTTPException(
                status_code=400,
                detail="Your cart is empty.",
            )

        # Lock product rows in a consistent order to prevent
        # simultaneous purchases from overselling inventory.
        product_ids = [item.product_id for item in cart_items]

        products = db.scalars(
            select(Product)
            .where(Product.id.in_(product_ids))
            .order_by(Product.id)
            .options(selectinload(Product.images))
            .with_for_update()
            .execution_options(populate_existing=True)
        ).all()

        products_by_id = {
            product.id: product for product in products
        }

        subtotal = Decimal("0.00")
        order_items_data = []

        # Validate products and calculate prices using database values.
        for cart_item in cart_items:
            product = products_by_id.get(cart_item.product_id)

            if not product or not product.is_active:
                raise HTTPException(
                    status_code=400,
                    detail="A product in your cart is unavailable.",
                )

            if cart_item.quantity > product.stock_quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for {product.name}.",
                )

            unit_price = (
                product.discount_price
                if product.discount_price is not None
                else product.price
            )

            line_total = unit_price * cart_item.quantity
            subtotal += line_total

            primary_image = next(
                (
                    image.image_url
                    for image in product.images
                    if image.is_primary
                ),
                None,
            )

            if not primary_image and product.images:
                primary_image = product.images[0].image_url

            order_items_data.append({
                "product_id": product.id,
                "product_name": product.name,
                "product_image": primary_image,
                "quantity": cart_item.quantity,
                "unit_price": unit_price,
            })

        delivery_charge = DELIVERY_CHARGE
        discount_amount = Decimal("0.00")

        total_amount = (
            subtotal + delivery_charge - discount_amount
        )

        # Create the order.
        order = Order(
            order_number=f"SE-{secrets.token_hex(6).upper()}",
            user_id=current_user.id,
            customer_name=order_data.customer_name,
            phone=order_data.phone,
            email=current_user.email,
            house_number=order_data.house_number,
            street=order_data.street,
            city=order_data.city,
            state=order_data.state,
            pin_code=order_data.pin_code,
            subtotal=subtotal,
            discount_amount=discount_amount,
            delivery_charge=delivery_charge,
            total_amount=total_amount,
            payment_method="COD",
            payment_status="Pending",
            status="Pending",
        )

        # Create order items and reduce inventory.
        for item_data in order_items_data:
            order.items.append(OrderItem(**item_data))

            product = products_by_id[item_data["product_id"]]
            product.stock_quantity -= item_data["quantity"]

        db.add(order)

        # Remove cart items in the same transaction.
        for cart_item in cart_items:
            db.delete(cart_item)

        # Flush changes before committing.
        db.flush()

        # Commit order, items, inventory and cart changes together.
        db.commit()

        # Refresh saved order information.
        db.refresh(order)

        return order

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to place your order. Please try again.",
        )


@router.get("/", response_model=list[OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    orders = db.scalars(
        select(Order)
        .where(Order.user_id == current_user.id)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    ).all()

    return orders
