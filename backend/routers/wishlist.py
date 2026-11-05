
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload, selectinload

from database.database import get_db
from dependencies.auth import get_current_user
from models.models import WishlistItem, Product, CartItem, User
from schemas.wishlist import (
    WishlistItemCreate,
    WishlistResponse,
)

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


def build_wishlist_response(items):
    response_items = []

    for item in items:
        product = item.product

        primary_image = next(
            (image.image_url for image in product.images if image.is_primary),
            None
        )

        if primary_image is None and product.images:
            primary_image = product.images[0].image_url

        response_items.append({
            "id": item.id,
            "created_at": item.created_at,
            "product": {
                "id": product.id,
                "name": product.name,
                "slug": product.slug,
                "price": product.price,
                "discount_price": product.discount_price,
                "stock_quantity": product.stock_quantity,
                "image_url": primary_image,
            },
        })

    return WishlistResponse(
        items=response_items,
        total_items=len(response_items)
    )


def get_user_wishlist(db: Session, user_id: int):
    return (
        db.query(WishlistItem)
        .options(
            joinedload(WishlistItem.product).selectinload(Product.images)
        )
        .filter(WishlistItem.user_id == user_id)
        .order_by(WishlistItem.created_at.desc())
        .all()
    )


@router.get("/", response_model=WishlistResponse)
def get_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = get_user_wishlist(db, current_user.id)
    return build_wishlist_response(items)


@router.post("/add", response_model=WishlistResponse)
def add_to_wishlist(
    wishlist_data: WishlistItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = (
        db.query(Product)
        .filter(
            Product.id == wishlist_data.product_id,
            Product.is_active.is_(True)
        )
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found or unavailable"
        )

    existing_item = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == product.id
        )
        .first()
    )

    if existing_item:
        raise HTTPException(
            status_code=409,
            detail="Product is already in your wishlist"
        )

    try:
        db.add(
            WishlistItem(
                user_id=current_user.id,
                product_id=product.id
            )
        )
        db.commit()
    except Exception:
        db.rollback()
        raise

    items = get_user_wishlist(db, current_user.id)
    return build_wishlist_response(items)


@router.delete("/remove/{item_id}", response_model=WishlistResponse)
def remove_from_wishlist(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.id == item_id,
            WishlistItem.user_id == current_user.id
        )
        .first()
    )

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Wishlist item not found"
        )

    db.delete(item)
    db.commit()

    items = get_user_wishlist(db, current_user.id)
    return build_wishlist_response(items)


@router.post("/move-to-cart/{item_id}", response_model=WishlistResponse)
def move_to_cart(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wishlist_item = (
        db.query(WishlistItem)
        .options(joinedload(WishlistItem.product))
        .filter(
            WishlistItem.id == item_id,
            WishlistItem.user_id == current_user.id
        )
        .first()
    )

    if wishlist_item is None:
        raise HTTPException(
            status_code=404,
            detail="Wishlist item not found"
        )

    product = (
        db.query(Product)
        .filter(Product.id == wishlist_item.product_id)
        .with_for_update()
        .first()
    )

    if product is None or not product.is_active:
        raise HTTPException(
            status_code=400,
            detail="This product is no longer available"
        )

    if product.stock_quantity < 1:
        raise HTTPException(
            status_code=400,
            detail="This product is currently out of stock"
        )

    existing_cart_item = (
        db.query(CartItem)
        .filter(
            CartItem.user_id == current_user.id,
            CartItem.product_id == product.id
        )
        .first()
    )

    if existing_cart_item:
        if existing_cart_item.quantity + 1 > product.stock_quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Only {product.stock_quantity} units available"
            )
        existing_cart_item.quantity += 1
    else:
        db.add(
            CartItem(
                user_id=current_user.id,
                product_id=product.id,
                quantity=1
            )
        )

    db.delete(wishlist_item)
    db.commit()

    items = get_user_wishlist(db, current_user.id)
    return build_wishlist_response(items)
