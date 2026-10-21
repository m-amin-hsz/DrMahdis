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
from ai_engine import ai_service

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

    # Users / Auth table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        identifier TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        age INTEGER,
        height REAL,
        weight REAL,
        target_weight REAL,
        role TEXT DEFAULT 'patient',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Seed demo user if empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO users (name, identifier, password, age, height, weight, target_weight)
        VALUES ('سارا محمدی', '09123456789', '123456', 31, 168, 78, 62)
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
                "doctor": "دکتر مهدیس",
                "clinic": "متد شوک لاغری و سبک زندگی ۹۰ روزه (Drmadis.com)",
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

        if path == "/api/auth/signup":
            name = body.get("name", "").strip()
            identifier = body.get("identifier", "").strip()
            password = body.get("password", "").strip()
            age = int(body.get("age", 30))
            height = float(body.get("height", 165))
            weight = float(body.get("weight", 70))
            target_weight = float(body.get("target_weight", 60))

            if not name or not identifier or not password:
                self.send_response(400)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "لطفاً نام، شناسه و رمز عبور را وارد کنید."}, ensure_ascii=False).encode("utf-8"))
                return

            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            try:
                cursor.execute("""
                INSERT INTO users (name, identifier, password, age, height, weight, target_weight)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (name, identifier, password, age, height, weight, target_weight))
                user_id = cursor.lastrowid
                
                # Also create initial patient profile
                cursor.execute("""
                INSERT OR IGNORE INTO patients (name, phone, age, height, weight, target_weight, status)
                VALUES (?, ?, ?, ?, ?, ?, 'waiting_review')
                """, (name, identifier, age, height, weight, target_weight))
                
                conn.commit()
                cursor.execute("SELECT id, name, identifier, age, height, weight, target_weight, created_at FROM users WHERE id = ?", (user_id,))
                user_data = dict(cursor.fetchone())
                conn.close()

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "user": user_data}, ensure_ascii=False).encode("utf-8"))
                return
            except sqlite3.IntegrityError:
                conn.close()
                self.send_response(409)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "این شماره موبایل یا ایمیل قبلاً ثبت نام کرده است."}, ensure_ascii=False).encode("utf-8"))
                return

        if path == "/api/auth/signin":
            identifier = body.get("identifier", "").strip()
            password = body.get("password", "").strip()

            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("""
            SELECT id, name, identifier, age, height, weight, target_weight, created_at 
            FROM users WHERE identifier = ? AND password = ?
            """, (identifier, password))
            row = cursor.fetchone()
            conn.close()

            if row:
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "user": dict(row)}, ensure_ascii=False).encode("utf-8"))
            else:
                self.send_response(401)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "شماره یا رمز عبور اشتباه است."}, ensure_ascii=False).encode("utf-8"))
            return

        if path == "/api/auth/signout":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "message": "با موفقیت خارج شدید."}, ensure_ascii=False).encode("utf-8"))
            return

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

        if path == "/api/ai/analyze-lab":
            analysis = ai_service.analyze_lab_test(body)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(analysis, ensure_ascii=False).encode("utf-8"))
            return

        if path == "/api/ai/suggest-plan":
            plan = ai_service.generate_nutrition_plan(body)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(plan, ensure_ascii=False).encode("utf-8"))
            return

        if path == "/api/ai/chat":
            message = body.get("message", "")
            profile = body.get("profile", {})
            lang = body.get("lang", "fa")
            reply = ai_service.chat_companion(message, profile, lang)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"reply": reply}, ensure_ascii=False).encode("utf-8"))
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
    
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CustomHTTPHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
            httpd.shutdown()

