
from datetime import datetime, timedelta, timezone
import hashlib
import importlib
import secrets
import hmac

from jose import jwt

from config import settings


# Use pwdlib (Argon2) when available; fall back to stdlib scrypt so this
# module can also run in environments where pwdlib has not been installed.
try:
    PasswordHash = importlib.import_module("pwdlib").PasswordHash
    password_hash = PasswordHash.recommended()
except (ImportError, AttributeError):
    password_hash = None


def _hash_with_scrypt(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(
        password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1
    )
    return f"scrypt${salt.hex()}${digest.hex()}"


def hash_password(password: str) -> str:
    if password_hash is not None:
        return password_hash.hash(password)
    return _hash_with_scrypt(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    if hashed_password.startswith("scrypt$"):
        try:
            _, salt_hex, digest_hex = hashed_password.split("$", 2)
            salt = bytes.fromhex(salt_hex)
            expected = bytes.fromhex(digest_hex)
            actual = hashlib.scrypt(
                plain_password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1
            )
            return hmac.compare_digest(actual, expected)
        except (ValueError, TypeError):
            return False

    if password_hash is None:
        return False
    return password_hash.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
