
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from database.database import engine

# Customer API routers
from routers.wishlist import router as wishlist_router
from routers.auth import router as auth_router
from routers.categories import router as categories_router
from routers.products import router as products_router
from routers.cart import router as cart_router
from routers.orders import router as orders_router
from routers.reviews import router as reviews_router

# Admin API routers
from routers.admin import router as admin_router
from routers.admin_images import router as admin_images_router
from routers import admin_orders
from routers.admin_categories import router as admin_categories_router


# Upload directory
UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# Create FastAPI application
app = FastAPI(
    title="ShopEase API",
    description="Backend API for ShopEase E-Commerce Platform",
    version="1.0.0",
)


# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Serve product images
app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads",
)


# Register customer routers
app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(products_router)
app.include_router(cart_router)
app.include_router(wishlist_router)
app.include_router(orders_router)
app.include_router(reviews_router)


# Register admin routers
app.include_router(admin_router)
app.include_router(admin_images_router)
app.include_router(admin_orders.router)
app.include_router(admin_categories_router)


# Root endpoint
@app.get("/", tags=["General"])
def root():
    return {
        "message": "Welcome to ShopEase API",
        "status": "running",
        "version": "1.0.0",
        "documentation": "/docs",
    }


# Backend health check
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "message": "ShopEase backend is running",
    }


# Database health check
@app.get("/db-health", tags=["Health"])
def database_health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "connected",
            "database": "PostgreSQL",
            "message": "Database connection successful",
        }

    except Exception:
        return {
            "status": "error",
            "database": "PostgreSQL",
            "message": "Database connection failed",
        }
