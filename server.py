#!/usr/bin/env python3
"""
Backend Web Server & REST API for Lifestyle & Habit Stacking Platform
Built with Python 3 Standard Library (No external pip dependencies required).
"""

import http.server
import socketserver
import os
import json
import sqlite3
import urllib.parse
from datetime import datetime

PORT = int(os.environ.get("PORT", 8080))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
DB_PATH = os.path.join(BASE_DIR, "mahdis.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Patients table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        phone TEXT UNIQUE,
        age INTEGER,
        height REAL,
        weight REAL,
        target_weight REAL,
        menstrual_cycle TEXT,
        conditions TEXT,
        blood_test_filename TEXT,
        status TEXT DEFAULT 'waiting_review',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Habit tracking progress table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS habit_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        day INTEGER,
        task_id TEXT,
        completed INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Chat messages table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        sender TEXT,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Seed demo patient if empty
    cursor.execute("SELECT COUNT(*) FROM patients")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO patients (name, phone, age, height, weight, target_weight, menstrual_cycle, conditions, blood_test_filename, status)
        VALUES ('سارا محمدی', '09123456789', 31, 168, 78, 62, 'pco', 'کم‌کاری تیروئید خفیف', 'Azmayesh-Khon-Tir98.pdf', 'waiting_review')
        """)

    conn.commit()
    conn.close()

class CustomHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def end_headers(self):
        # Enable CORS and UTF-8
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        url_parts = urllib.parse.urlparse(self.path)
        path = url_parts.path

        if path == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            resp = {
                "status": "online",
                "doctor": "خانم دکتر مهدیه",
                "clinic": "کلینیک تخصصی رژیم و تغییر سبک زندگی ۹۰ روزه",
                "time": datetime.now().isoformat()
            }
            self.wfile.write(json.dumps(resp, ensure_ascii=False).encode("utf-8"))
            return

        if path == "/api/techniques":
            tech_file = os.path.join(PUBLIC_DIR, "data", "techniques.json")
            if os.path.exists(tech_file):
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                with open(tech_file, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.end_headers()
            return

        if path == "/api/patients":
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM patients ORDER BY id DESC")
            rows = [dict(row) for row in cursor.fetchall()]
            conn.close()

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(rows, ensure_ascii=False).encode("utf-8"))
            return

        # Default static file handling
        return super().do_GET()

    def do_POST(self):
        url_parts = urllib.parse.urlparse(self.path)
        path = url_parts.path

        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length)

        try:
            body = json.loads(post_data.decode("utf-8")) if post_data else {}
        except Exception:
            body = {}

        if path == "/api/onboarding":
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("""
            INSERT OR REPLACE INTO patients (name, phone, age, height, weight, target_weight, menstrual_cycle, conditions, blood_test_filename, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'waiting_review')
            """, (
                body.get("name", "مراجع جدید"),
                body.get("phone", "09000000000"),
                body.get("age", 30),
                body.get("height", 165),
                body.get("weight", 75),
                body.get("target_weight", 60),
                body.get("menstrual_cycle", "regular"),
                body.get("conditions", ""),
                body.get("blood_test_filename", "test.pdf")
            ))
            conn.commit()
            conn.close()

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            resp = {"success": True, "message": "پرونده شما در صف بررسی خانم دکتر قرار گرفت."}
            self.wfile.write(json.dumps(resp, ensure_ascii=False).encode("utf-8"))
            return

        if path == "/api/doctor/approve":
            patient_id = body.get("patient_id", 1)
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("UPDATE patients SET status = 'approved' WHERE id = ?", (patient_id,))
            conn.commit()
            conn.close()

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            resp = {"success": True, "message": "رژیم و برنامه ورزشی با موفقیت تایید و پیامک ارسال شد."}
            self.wfile.write(json.dumps(resp, ensure_ascii=False).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

if __name__ == "__main__":
    init_db()
    print(f"🚀 Database initialized at {DB_PATH}")
    print(f"🌐 Server running at http://localhost:{PORT}")
    print(f"📱 Patient Web App: http://localhost:{PORT}/index.html")
    print(f"🩺 Doctor Portal:   http://localhost:{PORT}/doctor.html")
    
    with socketserver.TCPServer(("", PORT), CustomHTTPHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
            httpd.shutdown()
