from __future__ import annotations

import base64
import binascii
import os
import re

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

MAGIC = b"AESGCM1"  # header + version for encrypted files/strings
SALT_LEN = 16
NONCE_LEN = 12
PBKDF2_ITERS = 200_000


def check_password_strength(password: str) -> bool:
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"[0-9]", password):
        return False
    return True


def derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=PBKDF2_ITERS,
    )
    return kdf.derive(password.encode("utf-8"))


def encrypt_bytes(plaintext: bytes, password: str) -> bytes:
    salt = os.urandom(SALT_LEN)
    key = derive_key(password, salt)
    aesgcm = AESGCM(key)
    nonce = os.urandom(NONCE_LEN)
    ciphertext = aesgcm.encrypt(nonce, plaintext, None)
    return MAGIC + salt + nonce + ciphertext


def decrypt_bytes(blob: bytes, password: str) -> bytes | None:
    try:
        payload = blob[len(MAGIC) :] if blob.startswith(MAGIC) else blob
        if len(payload) < SALT_LEN + NONCE_LEN + 16:
            return None
        salt = payload[:SALT_LEN]
        nonce = payload[SALT_LEN : SALT_LEN + NONCE_LEN]
        ciphertext = payload[SALT_LEN + NONCE_LEN :]
        key = derive_key(password, salt)
        aesgcm = AESGCM(key)
        return aesgcm.decrypt(nonce, ciphertext, None)
    except Exception:
        return None


def encrypt_text_to_b64(text: str, password: str) -> str:
    blob = encrypt_bytes(text.encode("utf-8"), password)
    return base64.b64encode(blob).decode("ascii")


def decrypt_bytes_from_base64_text(ciphertext_b64: str, password: str) -> bytes | None:
    compact = re.sub(r"\s+", "", ciphertext_b64)
    try:
        blob = base64.b64decode(compact.encode("ascii"), validate=True)
    except (binascii.Error, UnicodeEncodeError):
        return None
    return decrypt_bytes(blob, password)


def decrypt_text_from_b64(ciphertext_b64: str, password: str) -> str | None:
    plaintext_bytes = decrypt_bytes_from_base64_text(ciphertext_b64, password)
    if plaintext_bytes is None:
        return None
    try:
        return plaintext_bytes.decode("utf-8")
    except UnicodeDecodeError:
        return None

