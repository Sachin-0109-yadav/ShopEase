
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import sessionmaker, declarative_base

from config import settings


# Build the PostgreSQL connection URL safely.
DATABASE_URL = URL.create(
    drivername="postgresql+psycopg",
    username=settings.PG_USER,
    password=settings.PG_PASSWORD,
    host=settings.PG_HOST,
    port=settings.PG_PORT,
    database=settings.PG_DATABASE,
)

# Create database engine.
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=False
)

# Create database sessions.
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for all database models.
Base = declarative_base()


# Database session dependency.
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
