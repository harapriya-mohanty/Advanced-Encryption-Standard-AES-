from fastapi import FastAPI, Form, UploadFile, File
from fastapi.responses import StreamingResponse
from aes_crypto import check_password_strength
import io

from fastapi.middleware.cors import CORSMiddleware

from aes_crypto import (
    encrypt_text_to_b64,
    decrypt_text_from_b64,
    encrypt_bytes,
    decrypt_bytes,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TEXT ENCRYPT
@app.post("/api/encrypt-text")
async def encrypt_text(password: str = Form(...), text: str = Form(...)):
    if not check_password_strength(password):
        return {"error": "Weak password (min 8 chars, upper, lower, number)"}

    result = encrypt_text_to_b64(text, password)
    return {"ciphertext_b64": result}


# TEXT DECRYPT
@app.post("/api/decrypt-text")
async def decrypt_text(password: str = Form(...), ciphertext_b64: str = Form(...)):
    result = decrypt_text_from_b64(ciphertext_b64.strip(), password)

    if result is None:
        return {"error": "Invalid password or corrupted data"}

    return {"text": result}

# FILE ENCRYPT
@app.post("/api/encrypt-file")
async def encrypt_file(password: str = Form(...), file: UploadFile = File(...)):
    from fastapi import HTTPException

    if not check_password_strength(password):
        raise HTTPException(status_code=400, detail="Weak password")

    data = await file.read()

    if not data:
        raise HTTPException(status_code=400, detail="Empty file")

    encrypted = encrypt_bytes(data, password)

    return StreamingResponse(
        io.BytesIO(encrypted),
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{file.filename}.enc"'
        },
    )

# File Decrypt
@app.post("/api/decrypt-file")
async def decrypt_file(password: str = Form(...), file: UploadFile = File(...)):
    from fastapi import HTTPException

    data = await file.read()

    if not data:
        raise HTTPException(status_code=400, detail="Empty file")

    decrypted = decrypt_bytes(data, password)

    if decrypted is None:
        raise HTTPException(status_code=400, detail="Invalid password or corrupted file")

    filename = file.filename.replace(".enc", "")

    return StreamingResponse(
        io.BytesIO(decrypted),
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}_decrypted"'
        },
    )
    # except Exception as e:
    #     return {"error": str(e)}