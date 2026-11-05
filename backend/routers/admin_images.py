
from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from database.database import get_db
from dependencies.auth import get_current_admin
from models.models import Product, ProductImage


router = APIRouter(
    prefix="/admin/products",
    tags=["Admin - Product Images"],
    dependencies=[Depends(get_current_admin)],
)


# Upload folder inside the backend directory
UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads" / "products"

# Maximum image size: 5 MB
MAX_IMAGE_SIZE = 5 * 1024 * 1024

# Supported image formats and their file signatures
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def validate_image(content: bytes, content_type: str):
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, PNG and WebP images are allowed.",
        )

    if content_type == "image/jpeg":
        valid_signature = content.startswith(b"\xff\xd8\xff")

    elif content_type == "image/png":
        valid_signature = content.startswith(
            b"\x89PNG\r\n\x1a\n"
        )

    else:
        valid_signature = (
            len(content) >= 12
            and content.startswith(b"RIFF")
            and content[8:12] == b"WEBP"
        )

    if not valid_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is not a valid supported image.",
        )


@router.post(
    "/{product_id}/images",
    status_code=status.HTTP_201_CREATED,
)
async def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    alt_text: str | None = Form(default=None),
    is_primary: bool = Form(default=False),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    content = await file.read(MAX_IMAGE_SIZE + 1)

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please select an image.",
        )

    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image size must not exceed 5 MB.",
        )

    extension = ALLOWED_IMAGE_TYPES.get(file.content_type)

    if not extension:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, PNG and WebP images are allowed.",
        )

    validate_image(content, file.content_type)

    try:
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

        filename = f"{uuid4().hex}{extension}"
        file_path = UPLOAD_DIR / filename

        file_path.write_bytes(content)

        image_count = (
            db.query(ProductImage)
            .filter(ProductImage.product_id == product_id)
            .count()
        )

        make_primary = is_primary or image_count == 0

        if make_primary:
            existing_images = (
                db.query(ProductImage)
                .filter(ProductImage.product_id == product_id)
                .all()
            )

            for image in existing_images:
                image.is_primary = False

        new_image = ProductImage(
            product_id=product_id,
            image_url=f"/uploads/products/{filename}",
            alt_text=alt_text,
            is_primary=make_primary,
        )

        db.add(new_image)
        db.commit()
        db.refresh(new_image)

        return {
            "message": "Product image uploaded successfully.",
            "image": {
                "id": new_image.id,
                "product_id": new_image.product_id,
                "image_url": new_image.image_url,
                "alt_text": new_image.alt_text,
                "is_primary": new_image.is_primary,
            },
        }

    except Exception:
        db.rollback()

        if "file_path" in locals() and file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save product image.",
        )

    finally:
        await file.close()


@router.patch(
    "/{product_id}/images/{image_id}/primary"
)
def set_primary_product_image(
    product_id: int,
    image_id: int,
    db: Session = Depends(get_db),
):
    image = (
        db.query(ProductImage)
        .filter(
            ProductImage.id == image_id,
            ProductImage.product_id == product_id,
        )
        .first()
    )

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product image not found.",
        )

    try:
        db.query(ProductImage).filter(
            ProductImage.product_id == product_id
        ).update(
            {ProductImage.is_primary: False},
            synchronize_session=False,
        )

        image.is_primary = True
        db.commit()

        return {
            "message": "Primary product image updated successfully.",
            "image_id": image.id,
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update primary image.",
        )


@router.delete(
    "/{product_id}/images/{image_id}"
)
def delete_product_image(
    product_id: int,
    image_id: int,
    db: Session = Depends(get_db),
):
    image = (
        db.query(ProductImage)
        .filter(
            ProductImage.id == image_id,
            ProductImage.product_id == product_id,
        )
        .first()
    )

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product image not found.",
        )

    try:
        image_url = image.image_url

        db.delete(image)
        db.commit()

        # Delete only files stored in this application's upload folder.
        filename = image_url.rsplit("/", 1)[-1]

        if (
            image_url.startswith("/uploads/products/")
            and filename
        ):
            file_path = UPLOAD_DIR / filename

            if file_path.is_file():
                file_path.unlink()

        return {
            "message": "Product image deleted successfully."
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete product image.",
        )
