
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from database.database import get_db
from dependencies.auth import get_current_user
from models.models import CartItem, Product, User
from schemas.cart import CartItemCreate, CartItemUpdate, CartResponse


router = APIRouter(
    prefix="/cart",
    tags=["Shopping Cart"]
)


# ==========================================
# BUILD CART RESPONSE
# ==========================================

def build_cart_response(cart_items):
    response_items = []
    subtotal = Decimal("0.00")
    total_items = 0

    for item in cart_items:
        product = item.product

        unit_price = (
            product.discount_price
            if product.discount_price is not None
            else product.price
        )

        line_total = unit_price * item.quantity

        primary_image = next(
            (
                image.image_url
                for image in product.images
                if image.is_primary
            ),
            None
        )

        if primary_image is None and product.images:
            primary_image = product.images[0].image_url

        response_items.append({
            "id": item.id,
            "quantity": item.quantity,
            "product": {
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "discount_price": product.discount_price,
                "stock_quantity": product.stock_quantity,
                "image_url": primary_image,
            },
            "line_total": line_total,
        })

        subtotal += line_total
        total_items += item.quantity

    return CartResponse(
        items=response_items,
        subtotal=subtotal,
        total_items=total_items
    )


# ==========================================
# GET USER CART
# ==========================================

@router.get("/", response_model=CartResponse)
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cart_items = (
        db.query(CartItem)
        .options(
            joinedload(CartItem.product).selectinload(Product.images)
        )
        .filter(CartItem.user_id == current_user.id)
        .all()
    )

    return build_cart_response(cart_items)


# ==========================================
# ADD PRODUCT TO CART
# ==========================================

@router.post("/add", response_model=CartResponse)
def add_to_cart(
    cart_data: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = (
        db.query(Product)
        .filter(
            Product.id == cart_data.product_id,
            Product.is_active.is_(True)
        )
        .with_for_update()
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found or unavailable"
        )

    existing_item = (
        db.query(CartItem)
        .filter(
            CartItem.user_id == current_user.id,
            CartItem.product_id == product.id
        )
        .first()
    )

    new_quantity = cart_data.quantity

    if existing_item:
        new_quantity += existing_item.quantity

    if product.stock_quantity < new_quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Only {product.stock_quantity} units available"
        )

    if existing_item:
        existing_item.quantity = new_quantity
    else:
        db.add(
            CartItem(
                user_id=current_user.id,
                product_id=product.id,
                quantity=new_quantity
            )
        )

    db.commit()

    updated_items = (
        db.query(CartItem)
        .options(
            joinedload(CartItem.product).selectinload(Product.images)
        )
        .filter(CartItem.user_id == current_user.id)
        .all()
    )

    return build_cart_response(updated_items)


# ==========================================
# UPDATE CART ITEM QUANTITY
# ==========================================

@router.put("/update/{item_id}", response_model=CartResponse)
def update_cart_item(
    item_id: int,
    cart_data: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cart_item = (
        db.query(CartItem)
        .filter(
            CartItem.id == item_id,
            CartItem.user_id == current_user.id
        )
        .first()
    )

    if cart_item is None:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found"
        )

    product = (
        db.query(Product)
        .filter(Product.id == cart_item.product_id)
        .with_for_update()
        .first()
    )

    if product is None or not product.is_active:
        raise HTTPException(
            status_code=400,
            detail="This product is no longer available"
        )

    if cart_data.quantity > product.stock_quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Only {product.stock_quantity} units available"
        )

    cart_item.quantity = cart_data.quantity
    db.commit()

    updated_items = (
        db.query(CartItem)
        .options(
            joinedload(CartItem.product).selectinload(Product.images)
        )
        .filter(CartItem.user_id == current_user.id)
        .all()
    )

    return build_cart_response(updated_items)


# ==========================================
# REMOVE PRODUCT FROM CART
# ==========================================

@router.delete("/remove/{item_id}", response_model=CartResponse)
def remove_from_cart(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cart_item = (
        db.query(CartItem)
        .filter(
            CartItem.id == item_id,
            CartItem.user_id == current_user.id
        )
        .first()
    )

    if cart_item is None:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found"
        )

    db.delete(cart_item)
    db.commit()

    updated_items = (
        db.query(CartItem)
        .options(
            joinedload(CartItem.product).selectinload(Product.images)
        )
        .filter(CartItem.user_id == current_user.id)
        .all()
    )

    return build_cart_response(updated_items)


# ==========================================
# CLEAR ENTIRE CART
# ==========================================

@router.delete("/clear", response_model=CartResponse)
def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    (
        db.query(CartItem)
        .filter(CartItem.user_id == current_user.id)
        .delete(synchronize_session=False)
    )

    db.commit()

    return CartResponse(
        items=[],
        subtotal=Decimal("0.00"),
        total_items=0
    )
