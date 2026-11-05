
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PG_USER: str
    PG_PASSWORD: str
    PG_HOST: str = "localhost"
    PG_PORT: int = 5432
    PG_DATABASE: str
    PG_SSLMODE: str = "prefer"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
