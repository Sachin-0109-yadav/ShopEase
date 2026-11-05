
from database.database import Base, engine

# Import all models before creating tables.
import models

def initialize_database():
    print("Starting ShopEase database initialization...")

    try:
        Base.metadata.create_all(bind=engine)

        print("Database tables created successfully!")
        print("Tables:")

        for table_name in sorted(Base.metadata.tables.keys()):
            print(f" - {table_name}")

    except Exception as error:
        print("Database initialization failed!")
        print(f"Error: {error}")
        raise


if __name__ == "__main__":
    initialize_database()
