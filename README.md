# 🔐 AES-GCM Encryption Tool (Full Stack)

A full-stack web application for secure text and file encryption using AES-GCM with password-based key derivation (PBKDF2).

---

## 🚀 Live Demo

🌐 Frontend: advanced-encryption-standard-aes.vercel.app  
🔗 Backend API: https://advanced-encryption-standard-aes-0y3n.onrender.com  

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS

### Backend
- FastAPI
- Python

### Cryptography
- AES-GCM encryption
- PBKDF2 password-based key derivation

---

## ✨ Features

- 🔐 Secure text encryption & decryption
- 📁 File encryption & decryption (.enc format)
- 🔑 Password strength validation
- ⚡ Fast API responses
- 📋 Copy to clipboard support
- 📥 File download after encryption/decryption
- ❌ Proper error handling (invalid password, corrupted data)

---

## 📂 Project Structure
AES/
├── app/ # Backend (FastAPI)
│ ├── api.py
│ ├── aes_crypto.py
│ └── requirements.txt
│
├── aes-ui/ # Frontend (React + Tailwind)
│ ├── src/
│ ├── package.json
│ └── ...


---

## Setup Instructions

### Backend

```bash
cd app
pip install -r requirements.txt
python -m uvicorn api:app --reload

### Frontend

```bash
cd aes-ui
npm install
npm run dev