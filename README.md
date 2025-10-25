🔐 AI-Powered Document Verification System

This project is a secure, modern system for verifying the authenticity of documents using AI-driven OCR and an immutable blockchain ledger. It's designed to combat document fraud by providing a tamper-proof verification process.

🚀 Project Goal

To build a system that:

Verifies document authenticity using a blockchain (e.g., Ethereum localnet).

Stores document metadata (hash, timestamp, owner) immutably.

Uses AI (Tesseract-OCR) to extract document contents.

Integrates a hybrid database solution (SQL + NoSQL) for efficient data management.



💻 Tech Stack

Frontend: React, Bootstrap, Axios

Backend: Flask (Python)

Databases: * MySQL (SQL): For structured data (users, document metadata).

MongoDB (NoSQL): For unstructured data (OCR text logs, errors).

AI/ML: Tesseract-OCR (via pytesseract)

Blockchain (WIP): Solidity, Ganache, Web3.py

⚙️ Project Architecture

A simple overview of the data flow:

React Frontend (Client)
    ↓

Flask Backend (API Server)
    ↓

AI (OCR) (Extracts text)
    ↓

Databases (Stores data)

MySQL stores metadata (filename, user ID, hash).

MongoDB stores OCR text and logs.
    ↓

Blockchain (Stores immutable hash for verification)

🚀 Getting Started

Follow these steps to set up the project on your local machine.

Prerequisites

Git

Python 3.10+

Node.js (LTS)

[suspicious link removed] (Make sure it's running)

MongoDB Community Server (Make sure it's running)

Tesseract-OCR (Must be installed on your system)

1. Clone the repository

git clone [YOUR_GITHUB_REPO_URL_HERE]
cd document-verifier


2. Backend Setup (Flask)

# Navigate to the backend folder
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate the environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install all required packages
pip install -r requirements.txt


Note: We need to create a requirements.txt file. Run this in your backend terminal:
pip freeze > requirements.txt
(Do this before you push to GitHub!)

Database Setup:

Make sure your MySQL server is running.

Log in and run: CREATE DATABASE doc_verifier_db;

Update the MySQL user and password in backend/app.py.

3. Frontend Setup (React)

# Navigate to the frontend folder
cd frontend

# Install all node modules
npm install


🏃‍♂️ Running the Application

You must have two separate terminals open.

Terminal 1 (Backend):

cd backend
source venv/bin/activate  # or .\venv\Scripts\activate
python app.py


Your backend will be running at http://localhost:5000

Terminal 2 (Frontend):

cd frontend
npm start


Your frontend will open in your browser at http://localhost:3000

🤝 How to Contribute

Create a new branch (git checkout -b feature/YourNewFeature).

Make your changes.

Commit your changes (git commit -m 'Add some feature').

Push to the branch (git push origin feature/YourNewFeature).

Open a Pull Request.
