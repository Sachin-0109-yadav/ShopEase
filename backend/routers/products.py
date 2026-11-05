
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload

from database.database import get_db
from models.models import Product
from schemas.product import ProductResponse

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


@router.get("/", response_model=list[ProductResponse])
def get_products(
    search: str | None = None,
    category_id: int | None = None,
    featured: bool | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = (
        db.query(Product)
        .options(selectinload(Product.images))
        .filter(Product.is_active == True)
    )

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            Product.name.ilike(search_term)
            | Product.description.ilike(search_term)
        )

    if category_id is not None:
        query = query.filter(
            Product.category_id == category_id
        )

    if featured is not None:
        query = query.filter(
            Product.is_featured == featured
        )

    return (
        query.order_by(Product.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = (
        db.query(Product)
        .options(selectinload(Product.images))
        .filter(
            Product.id == product_id,
            Product.is_active == True
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product
