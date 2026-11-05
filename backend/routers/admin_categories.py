
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from dependencies.auth import get_current_admin
from models.models import Category, Product
from schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
)

router = APIRouter(
    prefix="/admin/categories",
    tags=["Admin Categories"],
    dependencies=[Depends(get_current_admin)],
)


# GET: List all categories, including inactive ones
@router.get("/", response_model=list[CategoryResponse])
def get_all_categories(db: Session = Depends(get_db)):
    return (
        db.query(Category)
        .order_by(Category.created_at.desc())
        .all()
    )


# POST: Create a category
@router.post(
    "/",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
):
    existing_name = db.query(Category).filter(
        Category.name == category_data.name
    ).first()

    if existing_name:
        raise HTTPException(
            status_code=409,
            detail="A category with this name already exists",
        )

    existing_slug = db.query(Category).filter(
        Category.slug == category_data.slug
    ).first()

    if existing_slug:
        raise HTTPException(
            status_code=409,
            detail="A category with this slug already exists",
        )

    category = Category(**category_data.model_dump())

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


# PATCH: Update a category
@router.patch(
    "/{category_id}",
    response_model=CategoryResponse,
)
def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: Session = Depends(get_db),
):
    category = db.query(Category).filter(
        Category.id == category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )

    update_data = category_data.model_dump(exclude_unset=True)

    if "name" in update_data:
        if update_data["name"] is None:
            raise HTTPException(
                status_code=422,
                detail="Category name cannot be empty",
            )

        duplicate_name = db.query(Category).filter(
            Category.name == update_data["name"],
            Category.id != category_id,
        ).first()

        if duplicate_name:
            raise HTTPException(
                status_code=409,
                detail="A category with this name already exists",
            )

    if "slug" in update_data:
        if update_data["slug"] is None:
            raise HTTPException(
                status_code=422,
                detail="Category slug cannot be empty",
            )

        duplicate_slug = db.query(Category).filter(
            Category.slug == update_data["slug"],
            Category.id != category_id,
        ).first()

        if duplicate_slug:
            raise HTTPException(
                status_code=409,
                detail="A category with this slug already exists",
            )

    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)

    return category


# DELETE: Safely deactivate a category
@router.delete("/{category_id}")
def deactivate_category(
    category_id: int,
    db: Session = Depends(get_db),
):
    category = db.query(Category).filter(
        Category.id == category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )

    if not category.is_active:
        raise HTTPException(
            status_code=400,
            detail="Category is already inactive",
        )

    linked_products = db.query(Product).filter(
        Product.category_id == category_id
    ).count()

    if linked_products > 0:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot deactivate this category because "
                f"{linked_products} product(s) are linked to it. "
                "Move those products to another category first."
            ),
        )

    category.is_active = False

    db.commit()
    db.refresh(category)

    return {
        "message": "Category deactivated successfully",
        "category_id": category.id,
        "is_active": category.is_active,
    }
