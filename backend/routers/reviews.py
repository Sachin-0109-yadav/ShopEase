from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.exc import IntegrityError

from database.database import get_db
from dependencies.auth import get_current_user
from models.models import Review, Product, User, Order, OrderItem
from schemas.review import (
    ReviewCreate,
    ReviewUpdate,
    ReviewResponse,
    ProductReviewSummary,
)

router = APIRouter(prefix="/reviews", tags=["Reviews"])


def get_product_or_404(product_id: int, db: Session):
    product = db.get(Product, product_id)

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found."
        )

    return product


@router.get(
    "/product/{product_id}",
    response_model=ProductReviewSummary
)
def get_product_reviews(
    product_id: int,
    db: Session = Depends(get_db)
):
    get_product_or_404(product_id, db)

    reviews = db.scalars(
        select(Review)
        .where(Review.product_id == product_id)
        .options(selectinload(Review.user))
        .order_by(Review.created_at.desc())
    ).all()

    result = db.execute(
        select(
            func.avg(Review.rating),
            func.count(Review.id)
        ).where(Review.product_id == product_id)
    ).one()

    average_rating = float(result[0] or 0)
    total_reviews = result[1]

    return ProductReviewSummary(
        average_rating=round(average_rating, 1),
        total_reviews=total_reviews,
        reviews=reviews
    )


@router.post(
    "/product/{product_id}",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED
)
def create_review(
    product_id: int,
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_product_or_404(product_id, db)

    existing_review = db.scalar(
        select(Review).where(
            Review.user_id == current_user.id,
            Review.product_id == product_id
        )
    )

    if existing_review:
        raise HTTPException(
            status_code=400,
            detail="You have already reviewed this product."
        )

    purchased_item = db.scalar(
        select(OrderItem.id)
        .join(Order, OrderItem.order_id == Order.id)
        .where(
            Order.user_id == current_user.id,
            OrderItem.product_id == product_id
        )
        .limit(1)
    )

    if not purchased_item:
        raise HTTPException(
            status_code=403,
            detail="You must order this product before reviewing it."
        )

    review = Review(
        user_id=current_user.id,
        product_id=product_id,
        rating=review_data.rating,
        comment=review_data.comment
    )

    db.add(review)

    try:
        db.commit()
        db.refresh(review)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="You have already reviewed this product."
        )

    return review


@router.put(
    "/{review_id}",
    response_model=ReviewResponse
)
def update_review(
    review_id: int,
    review_data: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = db.scalar(
        select(Review)
        .where(Review.id == review_id)
        .options(selectinload(Review.user))
    )

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found."
        )

    if review.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only edit your own review."
        )

    update_data = review_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(review, field, value)

    db.commit()
    db.refresh(review)

    return review


@router.delete(
    "/{review_id}",
    status_code=status.HTTP_200_OK
)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = db.get(Review, review_id)

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found."
        )

    if review.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own review."
        )

    db.delete(review)
    db.commit()

    return {"message": "Review deleted successfully."}