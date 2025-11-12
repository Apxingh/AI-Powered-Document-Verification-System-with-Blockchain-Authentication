import os
import hashlib
import uuid
import mysql.connector
from pymongo import MongoClient
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import pytesseract

# --- Tesseract Path ---
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# --- 1. INITIALIZE APP & DATABASES ---
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# --- MySQL Connection ---
try:
    mysql_db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Angad@2508",
        database="doc_verifier_db",
        port=3306
    )
    print("✅ MySQL connected successfully!")
except mysql.connector.Error as err:
    print(f"❌ Error connecting to MySQL: {err}")
    mysql_db = None

# --- MongoDB Connection ---
try:
    mongo_client = MongoClient("mongodb://localhost:27017/")
    mongo_db = mongo_client["doc_verifier_logs"]
    mongo_collection = mongo_db["logs"]
    mongo_collection.insert_one({"status": "MongoDB connected successfully!"})
    print("✅ MongoDB connected successfully!")
except Exception as e:
    print(f"❌ Error connecting to MongoDB: {e}")

# --- 2. SETUP DATABASE TABLES ---
def setup_databases():
    if mysql_db:
        cursor = mysql_db.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255),
                verification_status VARCHAR(50),
                blockchain_hash VARCHAR(255) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ MySQL 'documents' table checked/created.")
        cursor.close()

# --- 3. API ROUTES ---

@app.route('/')
def home():
    return "Hello! This is the Document Verifier Backend."

# ---------- UPLOAD DOCUMENT ROUTE ----------
@app.route('/upload', methods=['POST'])
def upload_document():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        try:
            filename = file.filename

            # --- 1. OCR (Text Extraction) ---
            img = Image.open(file.stream)
            extracted_text = pytesseract.image_to_string(img)
            print(f"--- Extracted Text ---\n{extracted_text}\n----------------------")

            # --- 2. Generate File Hash (Fix: use raw file, not stream) ---
            file.seek(0)  # reset file pointer
            file_bytes = file.read()
            file_hash = hashlib.sha256(file_bytes).hexdigest()
            print(f"[UPLOAD] ✅ Generated File Hash: {file_hash}")

            # --- 3. Simulate Blockchain Transaction ID ---
            tx_hash = "0x" + uuid.uuid4().hex
            print(f"[UPLOAD] Simulated Tx Hash: {tx_hash}")

            # --- 4. Store Metadata in MySQL ---
            verification_status = "Uploaded"
            sql = "INSERT INTO documents (filename, verification_status, blockchain_hash) VALUES (%s, %s, %s)"
            val = (filename, verification_status, file_hash)
            cursor = mysql_db.cursor()
            cursor.execute(sql, val)
            mysql_db.commit()
            document_id = cursor.lastrowid
            cursor.close()

            # --- 5. Log Upload in MongoDB ---
            log_entry = {
                "document_id": document_id,
                "filename": filename,
                "hash": file_hash,
                "tx": tx_hash,
                "action": "UPLOAD_SUCCESS",
                "extracted_text_snippet": extracted_text[:100] + "..."
            }
            mongo_collection.insert_one(log_entry)

            # --- 6. Send Response ---
            return jsonify({
                "message": "File uploaded and processed successfully!",
                "hash": file_hash,
                "tx": tx_hash,
                "document_id": document_id,
                "filename": filename
            }), 201

        except Exception as e:
            print(f"❌ Upload Error: {e}")
            mongo_collection.insert_one({"action": "UPLOAD_FAIL", "error": str(e)})
            return jsonify({"error": str(e)}), 500


# ---------- VERIFY DOCUMENT ROUTE ----------
@app.route('/verify/<file_hash>', methods=['GET'])
def verify_document(file_hash):
    try:
        print(f"[VERIFY] Searching for Hash: {file_hash}")
        cursor = mysql_db.cursor(dictionary=True)
        query = "SELECT * FROM documents WHERE blockchain_hash = %s"
        cursor.execute(query, (file_hash,))
        result = cursor.fetchone()
        cursor.close()

        if result:
            print(f"[VERIFY] ✅ Match Found for {file_hash}")
            response = {
                "verified": True,
                "message": "Document found and verified successfully!",
                "filename": result["filename"],
                "status": result["verification_status"],
                "created_at": str(result["created_at"])
            }
            return jsonify(response), 200
        else:
            print(f"[VERIFY] ❌ No match found for {file_hash}")
            return jsonify({
                "verified": False,
                "message": "Document not found or not verified."
            }), 404

    except Exception as e:
        print(f"❌ Verification Error: {e}")
        return jsonify({"error": str(e)}), 500


# --- 4. RUN THE APP ---
if __name__ == '__main__':
    setup_databases()
    app.run(debug=True, port=5000)
