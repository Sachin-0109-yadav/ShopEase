
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from database.database import get_db
from dependencies.auth import get_current_admin
from models.models import Product, Category
from schemas.admin import (
    AdminProductCreate,
    AdminProductUpdate,
    AdminProductResponse,
)

router = APIRouter(
    prefix="/admin/products",
    tags=["Admin - Products"],
    dependencies=[Depends(get_current_admin)]
)


@router.get("/", response_model=list[AdminProductResponse])
def get_all_products(db: Session = Depends(get_db)):
    return (
        db.query(Product)
        .options(selectinload(Product.images))
        .order_by(Product.created_at.desc())
        .all()
    )


@router.post(
    "/",
    response_model=AdminProductResponse,
    status_code=status.HTTP_201_CREATED
)
def create_product(
    product_data: AdminProductCreate,
    db: Session = Depends(get_db)
):
    existing_slug = db.query(Product).filter(
        Product.slug == product_data.slug
    ).first()

    if existing_slug:
        raise HTTPException(
            status_code=400,
            detail="A product with this slug already exists."
        )

    category = db.query(Category).filter(
        Category.id == product_data.category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found."
        )

    if (
        product_data.discount_price is not None
        and product_data.discount_price >= product_data.price
    ):
        raise HTTPException(
            status_code=400,
            detail="Discount price must be lower than regular price."
        )

    product = Product(**product_data.model_dump())

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


@router.patch("/{product_id}", response_model=AdminProductResponse)
def update_product(
    product_id: int,
    product_data: AdminProductUpdate,
    db: Session = Depends(get_db)
):
    product = (
        db.query(Product)
        .options(selectinload(Product.images))
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found."
        )

    updates = product_data.model_dump(exclude_unset=True)

    if "slug" in updates and updates["slug"] != product.slug:
        existing_slug = db.query(Product).filter(
            Product.slug == updates["slug"],
            Product.id != product_id
        ).first()

        if existing_slug:
            raise HTTPException(
                status_code=400,
                detail="A product with this slug already exists."
            )

    if "category_id" in updates:
        category = db.query(Category).filter(
            Category.id == updates["category_id"]
        ).first()

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Category not found."
            )

    new_price = updates.get("price", product.price)
    new_discount = updates.get(
        "discount_price",
        product.discount_price
    )

    if new_discount is not None and new_discount >= new_price:
        raise HTTPException(
            status_code=400,
            detail="Discount price must be lower than regular price."
        )

    for field, value in updates.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product


@router.delete("/{product_id}")
def deactivate_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found."
        )

    product.is_active = False

    db.commit()

    return {
        "message": "Product deactivated successfully."
    }
