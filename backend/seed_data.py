
from decimal import Decimal

from database.database import SessionLocal
from models.models import Category, Product, ProductImage


def seed_categories(db):
    categories_data = [
        {
            "name": "Electronics",
            "slug": "electronics",
            "description": "Smartphones, laptops and electronic accessories.",
            "image_url": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800",
        },
        {
            "name": "Fashion",
            "slug": "fashion",
            "description": "Clothing, shoes and fashion accessories.",
            "image_url": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800",
        },
        {
            "name": "Home & Living",
            "slug": "home-living",
            "description": "Furniture and products for your home.",
            "image_url": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800",
        },
    ]

    for item in categories_data:
        category = db.query(Category).filter(
            Category.slug == item["slug"]
        ).first()

        if not category:
            category = Category(
                **item,
                is_active=True
            )
            db.add(category)

    db.commit()
    print("Categories added successfully.")


def seed_products(db):
    products_data = [
        {
            "name": "Smartphone",
            "slug": "smartphone",
            "description": "Modern smartphone with a high-resolution display and excellent performance.",
            "price": Decimal("24999.00"),
            "discount_price": Decimal("21999.00"),
            "brand": "TechPro",
            "category_slug": "electronics",
            "stock_quantity": 25,
            "rating": Decimal("4.5"),
            "review_count": 12,
            "is_featured": True,
            "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900",
        },
        {
            "name": "Wireless Headphones",
            "slug": "wireless-headphones",
            "description": "Comfortable wireless headphones with clear sound quality.",
            "price": Decimal("3999.00"),
            "discount_price": Decimal("2999.00"),
            "brand": "SoundMax",
            "category_slug": "electronics",
            "stock_quantity": 40,
            "rating": Decimal("4.4"),
            "review_count": 8,
            "is_featured": True,
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900",
        },
        {
            "name": "Laptop",
            "slug": "laptop",
            "description": "Powerful laptop suitable for work, study and entertainment.",
            "price": Decimal("65999.00"),
            "discount_price": Decimal("59999.00"),
            "brand": "TechPro",
            "category_slug": "electronics",
            "stock_quantity": 15,
            "rating": Decimal("4.7"),
            "review_count": 15,
            "is_featured": True,
            "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900",
        },
        {
            "name": "Classic T-Shirt",
            "slug": "classic-t-shirt",
            "description": "Comfortable everyday cotton T-shirt.",
            "price": Decimal("999.00"),
            "discount_price": Decimal("699.00"),
            "brand": "UrbanStyle",
            "category_slug": "fashion",
            "stock_quantity": 60,
            "rating": Decimal("4.2"),
            "review_count": 6,
            "is_featured": True,
            "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900",
        },
        {
            "name": "Running Sneakers",
            "slug": "running-sneakers",
            "description": "Lightweight sneakers designed for everyday comfort.",
            "price": Decimal("2999.00"),
            "discount_price": Decimal("2499.00"),
            "brand": "UrbanStyle",
            "category_slug": "fashion",
            "stock_quantity": 35,
            "rating": Decimal("4.6"),
            "review_count": 10,
            "is_featured": True,
            "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900",
        },
        {
            "name": "Travel Backpack",
            "slug": "travel-backpack",
            "description": "Spacious backpack for travel, college and everyday use.",
            "price": Decimal("1799.00"),
            "discount_price": Decimal("1399.00"),
            "brand": "UrbanStyle",
            "category_slug": "fashion",
            "stock_quantity": 30,
            "rating": Decimal("4.3"),
            "review_count": 5,
            "is_featured": False,
            "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900",
        },
        {
            "name": "Modern Table Lamp",
            "slug": "modern-table-lamp",
            "description": "Stylish table lamp for bedrooms and living spaces.",
            "price": Decimal("1999.00"),
            "discount_price": Decimal("1599.00"),
            "brand": "HomeCraft",
            "category_slug": "home-living",
            "stock_quantity": 20,
            "rating": Decimal("4.4"),
            "review_count": 7,
            "is_featured": True,
            "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900",
        },
        {
            "name": "Modern Sofa",
            "slug": "modern-sofa",
            "description": "Comfortable modern sofa for your living room.",
            "price": Decimal("24999.00"),
            "discount_price": Decimal("21999.00"),
            "brand": "HomeCraft",
            "category_slug": "home-living",
            "stock_quantity": 8,
            "rating": Decimal("4.8"),
            "review_count": 4,
            "is_featured": True,
            "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900",
        },
        {
            "name": "Decorative Chair",
            "slug": "decorative-chair",
            "description": "Elegant chair to enhance your home interior.",
            "price": Decimal("5999.00"),
            "discount_price": Decimal("4999.00"),
            "brand": "HomeCraft",
            "category_slug": "home-living",
            "stock_quantity": 12,
            "rating": Decimal("4.5"),
            "review_count": 3,
            "is_featured": False,
            "image_url": "https://images.unsplash.com/photo-1503602642458-232111445657?w=900",
        },
    ]

    for item in products_data:
        category = db.query(Category).filter(
            Category.slug == item["category_slug"]
        ).first()

        if not category:
            print(
                f"Category missing for product: {item['name']}"
            )
            continue

        product = db.query(Product).filter(
            Product.slug == item["slug"]
        ).first()

        if product:
            print(f"Already exists: {item['name']}")
            continue

        image_url = item.pop("image_url")
        category_slug = item.pop("category_slug")

        product = Product(
            **item,
            category_id=category.id,
            is_active=True
        )

        db.add(product)
        db.flush()

        product_image = ProductImage(
            product_id=product.id,
            image_url=image_url,
            alt_text=product.name,
            is_primary=True
        )

        db.add(product_image)

        print(f"Added product: {product.name}")

    db.commit()
    print("Products and images added successfully.")


def main():
    db = SessionLocal()

    try:
        seed_categories(db)
        seed_products(db)

        print("\nShopEase sample data setup completed.")

    except Exception as error:
        db.rollback()
        print("Error while adding sample data:", error)
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
