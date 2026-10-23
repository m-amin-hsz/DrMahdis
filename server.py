#!/usr/bin/env python3
"""
Full-Featured REST API & Web Server for Dr. Madis Shock Lifestyle & Diet Platform
Standard Library implementation with SQLite, RBAC (Admin/Patient), AI Copilot,
Real Dossier Management, and Habit Tracking.
"""

import http.server
import socketserver
import os
import json
import sqlite3
import urllib.parse
import base64
import re
import uuid
from datetime import datetime
from ai_engine import ai_service

PORT = int(os.environ.get("PORT", 8080))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
UPLOADS_DIR = os.path.join(PUBLIC_DIR, "uploads")
DB_PATH = os.path.join(BASE_DIR, "mahdis.db")

os.makedirs(UPLOADS_DIR, exist_ok=True)

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Users / Auth table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        identifier TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'patient',
        age INTEGER,
        height REAL,
        weight REAL,
        target_weight REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 2. Patients table (Linked to user_id)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        name TEXT,
        phone TEXT,
        age INTEGER,
        height REAL,
        weight REAL,
        target_weight REAL,
        menstrual_cycle TEXT,
        conditions TEXT,
        blood_test_filename TEXT,
        photo_front TEXT,
        photo_right TEXT,
        photo_back TEXT,
        photo_left TEXT,
        status TEXT DEFAULT 'waiting_review',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Auto-migrate columns for existing databases
    cursor.execute("PRAGMA table_info(patients)")
    existing_p_cols = [r[1] for r in cursor.fetchall()]
    cols_to_add = [
        ("user_id", "INTEGER"),
        ("photo_front", "TEXT"),
        ("photo_right", "TEXT"),
        ("photo_back", "TEXT"),
        ("photo_left", "TEXT"),
        ("updated_at", "TIMESTAMP")
    ]
    for col_name, col_type in cols_to_add:
        if col_name not in existing_p_cols:
            cursor.execute(f"ALTER TABLE patients ADD COLUMN {col_name} {col_type}")

    cursor.execute("PRAGMA table_info(habit_progress)")
    existing_hp = [r[1] for r in cursor.fetchall()]
    if "user_id" not in existing_hp:
        cursor.execute("ALTER TABLE habit_progress ADD COLUMN user_id INTEGER")

    cursor.execute("PRAGMA table_info(chat_messages)")
    existing_cm = [r[1] for r in cursor.fetchall()]
    if "user_id" not in existing_cm:
        cursor.execute("ALTER TABLE chat_messages ADD COLUMN user_id INTEGER")

    # 3. Doctor Prescriptions / Plans table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS doctor_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        user_id INTEGER,
        calorie_target INTEGER DEFAULT 1550,
        protein_grams INTEGER DEFAULT 95,
        carbs_grams INTEGER DEFAULT 130,
        fat_grams INTEGER DEFAULT 50,
        diet_protocol TEXT,
        workout_plan TEXT,
        doctor_note TEXT,
        doctor_voice_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 4. Habit tracking progress table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS habit_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        day INTEGER,
        task_id TEXT,
        completed INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, day, task_id)
    )
    """)

    # 5. Daily Trackers (Water & Workout)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS daily_trackers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        day INTEGER,
        water_glasses INTEGER DEFAULT 0,
        workout_mins INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, day)
    )
    """)

    # 6. Chat messages table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        sender TEXT,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Seed Admin User: admin / 1234
    cursor.execute("SELECT id FROM users WHERE identifier = 'admin'")
    admin_row = cursor.fetchone()
    if not admin_row:
        cursor.execute("""
        INSERT INTO users (name, identifier, password, role)
        VALUES ('دکتر مهدیس (مدیر کلینیک)', 'admin', '1234', 'admin')
        """)
    else:
        cursor.execute("UPDATE users SET password = '1234', role = 'admin' WHERE identifier = 'admin'")

    conn.commit()
    conn.close()

class CustomHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def end_headers(self):
        # Enable CORS and UTF-8
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def _send_json(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))

    def _read_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            return {}
        post_data = self.rfile.read(content_length)
        try:
            return json.loads(post_data.decode("utf-8"))
        except Exception:
            return {}

    def do_GET(self):
        url_parts = urllib.parse.urlparse(self.path)
        path = url_parts.path
        query = urllib.parse.parse_qs(url_parts.query)

        # 1. Server Status
        if path == "/api/status":
            return self._send_json({
                "status": "online",
                "doctor": "دکتر مهدیس",
                "clinic": "متد شوک لاغری و سبک زندگی ۹۰ روزه (Drmadis.com)",
                "admin_user": "admin",
                "time": datetime.now().isoformat()
            })

        # 2. Daily Techniques JSON
        if path == "/api/techniques":
            tech_file = os.path.join(PUBLIC_DIR, "data", "techniques.json")
            if os.path.exists(tech_file):
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                with open(tech_file, "rb") as f:
                    self.wfile.write(f.read())
                return
            return self._send_json({"error": "Techniques not found"}, 404)

        # 3. Patient Profile & Approved Plan
        if path == "/api/patient/profile":
            user_id = query.get("user_id", [None])[0]
            if not user_id:
                return self._send_json({"error": "user_id required"}, 400)

            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()

            c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            user_row = c.fetchone()
            if not user_row:
                conn.close()
                return self._send_json({"error": "User not found"}, 404)

            c.execute("SELECT * FROM patients WHERE user_id = ?", (user_id,))
            patient_row = c.fetchone()

            c.execute("SELECT * FROM doctor_plans WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
            plan_row = c.fetchone()

            conn.close()
            return self._send_json({
                "user": dict(user_row),
                "patient": dict(patient_row) if patient_row else None,
                "plan": dict(plan_row) if plan_row else None
            })

        # 4. Patient Status & Plan
        if path == "/api/patient/status":
            user_id = query.get("user_id", [None])[0]
            if not user_id:
                return self._send_json({"error": "user_id required"}, 400)

            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()

            c.execute("SELECT status FROM patients WHERE user_id = ?", (user_id,))
            p_row = c.fetchone()
            status = p_row["status"] if p_row else "pending_dossier"

            c.execute("SELECT * FROM doctor_plans WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
            plan_row = c.fetchone()

            conn.close()
            return self._send_json({
                "status": status,
                "plan": dict(plan_row) if plan_row else None
            })

        # 5. Patient Habits for Day
        if path == "/api/patient/habits":
            user_id = query.get("user_id", [None])[0]
            day = query.get("day", [1])[0]
            if not user_id:
                return self._send_json({"error": "user_id required"}, 400)

            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT task_id, completed FROM habit_progress WHERE user_id = ? AND day = ?", (user_id, day))
            rows = [dict(r) for r in c.fetchall()]
            conn.close()
            return self._send_json({"habits": rows})

        # 6. Patient Trackers (Water & Workout)
        if path == "/api/patient/trackers":
            user_id = query.get("user_id", [None])[0]
            day = query.get("day", [1])[0]
            if not user_id:
                return self._send_json({"error": "user_id required"}, 400)

            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT water_glasses, workout_mins FROM daily_trackers WHERE user_id = ? AND day = ?", (user_id, day))
            row = c.fetchone()
            conn.close()
            if row:
                return self._send_json(dict(row))
            return self._send_json({"water_glasses": 0, "workout_mins": 0})

        # 7. Chat History
        if path == "/api/chat/messages":
            user_id = query.get("user_id", [None])[0]
            if not user_id:
                return self._send_json({"messages": []})

            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT id, user_id, sender, message, created_at FROM chat_messages WHERE user_id = ? ORDER BY id ASC", (user_id,))
            rows = [dict(r) for r in c.fetchall()]
            conn.close()
            return self._send_json({"messages": rows})

        # ================= ADMIN APIS =================
        # 8. Admin Stats
        if path == "/api/admin/stats":
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("SELECT COUNT(*) FROM users WHERE role = 'patient'")
            total_users = c.fetchone()[0]

            c.execute("SELECT COUNT(*) FROM patients WHERE status = 'waiting_review'")
            pending_reviews = c.fetchone()[0]

            c.execute("SELECT COUNT(*) FROM patients WHERE status = 'approved'")
            approved_diets = c.fetchone()[0]

            c.execute("SELECT COUNT(*) FROM chat_messages")
            total_messages = c.fetchone()[0]

            c.execute("SELECT COUNT(*) FROM habit_progress WHERE completed = 1")
            total_habits = c.fetchone()[0]

            conn.close()
            return self._send_json({
                "total_users": total_users,
                "pending_reviews": pending_reviews,
                "approved_diets": approved_diets,
                "total_messages": total_messages,
                "total_habits": total_habits
            })

        # 9. Admin Patients List
        if path == "/api/admin/patients":
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("""
            SELECT 
                p.id, p.user_id, p.name, p.phone, p.age, p.height, p.weight, p.target_weight,
                p.menstrual_cycle, p.conditions, p.blood_test_filename, p.status, p.created_at,
                u.identifier,
                (SELECT COUNT(*) FROM habit_progress WHERE user_id = p.user_id AND completed = 1) as habits_count,
                (SELECT COUNT(*) FROM chat_messages WHERE user_id = p.user_id) as chat_count
            FROM patients p
            LEFT JOIN users u ON p.user_id = u.id
            ORDER BY p.id DESC
            """)
            patients = [dict(r) for r in c.fetchall()]
            conn.close()
            return self._send_json({"patients": patients})

        # 10. Specific Patient Dossier
        if path.startswith("/api/admin/patient/"):
            patient_id = path.split("/")[-1]
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
            p_row = c.fetchone()
            if not p_row:
                conn.close()
                return self._send_json({"error": "Patient not found"}, 404)

            p_data = dict(p_row)
            c.execute("SELECT * FROM doctor_plans WHERE patient_id = ? ORDER BY id DESC LIMIT 1", (patient_id,))
            plan_row = c.fetchone()
            p_data["plan"] = dict(plan_row) if plan_row else None

            # Get recent chats
            c.execute("SELECT sender, message, created_at FROM chat_messages WHERE user_id = ? ORDER BY id ASC LIMIT 20", (p_data.get("user_id"),))
            p_data["chat_history"] = [dict(r) for r in c.fetchall()]

            conn.close()
            return self._send_json(p_data)

        # Fallback to serving static public files
        return super().do_GET()

    def do_POST(self):
        url_parts = urllib.parse.urlparse(self.path)
        path = url_parts.path
        body = self._read_body()

        # ================= AUTHENTICATION =================
        if path == "/api/auth/signup":
            name = body.get("name", "").strip()
            identifier = body.get("identifier", "").strip()
            password = body.get("password", "").strip()
            age = int(body.get("age", 30))
            height = float(body.get("height", 165))
            weight = float(body.get("weight", 70))
            target_weight = float(body.get("target_weight", 60))

            if not name or not identifier or not password:
                return self._send_json({"error": "لطفاً تمامی فیلدها را به دقت وارد کنید."}, 400)

            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()

            try:
                c.execute("""
                INSERT INTO users (name, identifier, password, role, age, height, weight, target_weight)
                VALUES (?, ?, ?, 'patient', ?, ?, ?, ?)
                """, (name, identifier, password, age, height, weight, target_weight))
                user_id = c.lastrowid

                # Create patient dossier
                c.execute("""
                INSERT INTO patients (user_id, name, phone, age, height, weight, target_weight, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'waiting_review')
                """, (user_id, name, identifier, age, height, weight, target_weight))

                conn.commit()

                c.execute("SELECT id, name, identifier, role, age, height, weight, target_weight, created_at FROM users WHERE id = ?", (user_id,))
                user_data = dict(c.fetchone())
                conn.close()

                return self._send_json({
                    "success": True,
                    "message": "حساب کاربری شما با موفقیت ایجاد شد.",
                    "user": user_data
                })
            except sqlite3.IntegrityError:
                conn.close()
                return self._send_json({"error": "این شماره موبایل یا ایمیل قبلاً در سامانه ثبت شده است."}, 409)

        if path == "/api/auth/signin" or path == "/api/admin/login":
            identifier = body.get("identifier", "").strip()
            password = body.get("password", "").strip()

            if not identifier or not password:
                return self._send_json({"error": "لطفاً نام کاربری و رمز عبور را وارد نمایید."}, 400)

            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()

            c.execute("""
            SELECT id, name, identifier, role, age, height, weight, target_weight, created_at 
            FROM users WHERE identifier = ? AND password = ?
            """, (identifier, password))
            row = c.fetchone()
            conn.close()

            if row:
                user_data = dict(row)
                return self._send_json({
                    "success": True,
                    "message": f"خوش آمدید {user_data['name']}",
                    "user": user_data
                })
            else:
                return self._send_json({"error": "نام کاربری یا رمز عبور اشتباه است."}, 401)

        if path == "/api/auth/signout":
            return self._send_json({"success": True, "message": "با موفقیت خارج شدید."})

        # ================= PATIENT ACTIONS =================
        if path == "/api/patient/intake":
            user_id = body.get("user_id")
            if not user_id:
                return self._send_json({"error": "user_id required"}, 400)

            height = float(body.get("height", 168))
            weight = float(body.get("weight", 78))
            age = int(body.get("age", 31))
            target_weight = float(body.get("target_weight", 62))
            menstrual = body.get("menstrual_cycle", "regular")
            conditions = body.get("conditions", "")
            blood_test_filename = body.get("blood_test_filename", "Azmayesh-Khon-Tir98.pdf")
            photo_front = body.get("photo_front", "")
            photo_right = body.get("photo_right", "")
            photo_back = body.get("photo_back", "")
            photo_left = body.get("photo_left", "")

            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()

            c.execute("SELECT name, identifier FROM users WHERE id = ?", (user_id,))
            u_row = c.fetchone()
            name = u_row[0] if u_row else "مراجع"
            phone = u_row[1] if u_row else ""

            # Update users biometric
            c.execute("""
            UPDATE users SET height = ?, weight = ?, age = ?, target_weight = ? WHERE id = ?
            """, (height, weight, age, target_weight, user_id))

            # Upsert into patients safely
            c.execute("SELECT id FROM patients WHERE user_id = ?", (user_id,))
            p_exist = c.fetchone()
            if p_exist:
                c.execute("""
                UPDATE patients SET
                    age = ?, height = ?, weight = ?, target_weight = ?,
                    menstrual_cycle = ?, conditions = ?, blood_test_filename = ?,
                    photo_front = COALESCE(NULLIF(?, ''), photo_front),
                    photo_right = COALESCE(NULLIF(?, ''), photo_right),
                    photo_back = COALESCE(NULLIF(?, ''), photo_back),
                    photo_left = COALESCE(NULLIF(?, ''), photo_left),
                    status = 'waiting_review',
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
                """, (age, height, weight, target_weight, menstrual, conditions, blood_test_filename, photo_front, photo_right, photo_back, photo_left, user_id))
            else:
                c.execute("""
                INSERT INTO patients (user_id, name, phone, age, height, weight, target_weight, menstrual_cycle, conditions, blood_test_filename, photo_front, photo_right, photo_back, photo_left, status, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'waiting_review', CURRENT_TIMESTAMP)
                """, (user_id, name, phone, age, height, weight, target_weight, menstrual, conditions, blood_test_filename, photo_front, photo_right, photo_back, photo_left))

            conn.commit()
            conn.close()

            return self._send_json({
                "success": True,
                "message": "پرونده سلامت، آزمایش خون و تصاویر با موفقیت ذخیره شد و در صف بررسی خانم دکتر قرار گرفت."
            })

        if path == "/api/patient/habits":
            user_id = body.get("user_id")
            day = int(body.get("day", 1))
            task_id = body.get("task_id", "")
            completed = int(body.get("completed", 1))

            if not user_id or not task_id:
                return self._send_json({"error": "Missing params"}, 400)

            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("SELECT id FROM habit_progress WHERE user_id = ? AND day = ? AND task_id = ?", (user_id, day, task_id))
            hp_row = c.fetchone()
            if hp_row:
                c.execute("UPDATE habit_progress SET completed = ? WHERE id = ?", (completed, hp_row[0]))
            else:
                c.execute("INSERT INTO habit_progress (user_id, day, task_id, completed) VALUES (?, ?, ?, ?)", (user_id, day, task_id, completed))
            conn.commit()
            conn.close()
            return self._send_json({"success": True, "completed": completed})

        if path == "/api/patient/trackers":
            user_id = body.get("user_id")
            day = int(body.get("day", 1))
            water = int(body.get("water_glasses", 0))
            workout = int(body.get("workout_mins", 0))

            if not user_id:
                return self._send_json({"error": "Missing user_id"}, 400)

            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("SELECT id FROM daily_trackers WHERE user_id = ? AND day = ?", (user_id, day))
            dt_row = c.fetchone()
            if dt_row:
                c.execute("UPDATE daily_trackers SET water_glasses = ?, workout_mins = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (water, workout, dt_row[0]))
            else:
                c.execute("INSERT INTO daily_trackers (user_id, day, water_glasses, workout_mins) VALUES (?, ?, ?, ?)", (user_id, day, water, workout))
            conn.commit()
            conn.close()
            return self._send_json({"success": True})

        if path == "/api/chat/send":
            user_id = body.get("user_id")
            message = body.get("message", "").strip()
            lang = body.get("lang", "fa")

            if not message:
                return self._send_json({"error": "Empty message"}, 400)

            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()

            # Save user message
            c.execute("INSERT INTO chat_messages (user_id, sender, message) VALUES (?, 'user', ?)", (user_id, message))

            # Fetch patient profile for context
            c.execute("SELECT * FROM patients WHERE user_id = ?", (user_id,))
            p_row = c.fetchone()
            profile = dict(p_row) if p_row else {}

            # Generate AI reply
            ai_reply = ai_service.chat_companion(message, profile, lang)

            # Save AI reply
            c.execute("INSERT INTO chat_messages (user_id, sender, message) VALUES (?, 'doctor', ?)", (user_id, ai_reply))

            conn.commit()
            conn.close()

            return self._send_json({"success": True, "reply": ai_reply})

        # ================= FILE UPLOAD API =================
        if path == "/api/upload":
            file_data = body.get("data")  # Base64 data URL
            original_filename = body.get("filename", "upload.jpg")

            if not file_data or "base64," not in file_data:
                return self._send_json({"error": "Invalid base64 payload"}, 400)

            try:
                header, encoded = file_data.split("base64,", 1)
                file_bytes = base64.b64decode(encoded)
                ext = original_filename.split(".")[-1].lower() if "." in original_filename else "jpg"
                clean_name = f"{uuid.uuid4().hex[:12]}.{ext}"
                target_path = os.path.join(UPLOADS_DIR, clean_name)

                with open(target_path, "wb") as f:
                    f.write(file_bytes)

                return self._send_json({
                    "success": True,
                    "url": f"/uploads/{clean_name}",
                    "filename": clean_name
                })
            except Exception as e:
                return self._send_json({"error": f"Upload failed: {str(e)}"}, 500)

        # ================= ADMIN ACTIONS =================
        if path == "/api/admin/patient/approve":
            patient_id = body.get("patient_id")
            user_id = body.get("user_id")
            cal_goal = int(body.get("calorie_target", 1550))
            protein = int(body.get("protein_grams", 95))
            carbs = int(body.get("carbs_grams", 130))
            fat = int(body.get("fat_grams", 50))
            protocol = body.get("diet_protocol", "رژیم با شاخص گلایسمی پایین (Low GI) متناسب با شرایط متابولیک.")
            workout = body.get("workout_plan", "روزانه ۲۰ دقیقه پیاده‌روی تند بعد از عصرانه + ۳ روز در هفته تمرین مقاومتی در منزل.")
            note = body.get("doctor_note", "برنامه رژیم و ورزشی شما تایید و در پنل فعال شد.")

            if not patient_id:
                return self._send_json({"error": "patient_id required"}, 400)

            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()

            # If user_id missing, find it from patient
            if not user_id:
                c.execute("SELECT user_id FROM patients WHERE id = ?", (patient_id,))
                r = c.fetchone()
                if r:
                    user_id = r[0]

            # 1. Update patient status
            c.execute("UPDATE patients SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?", (patient_id,))

            # 2. Insert or replace plan
            c.execute("""
            INSERT INTO doctor_plans (patient_id, user_id, calorie_target, protein_grams, carbs_grams, fat_grams, diet_protocol, workout_plan, doctor_note)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (patient_id, user_id, cal_goal, protein, carbs, fat, protocol, workout, note))

            # 3. Add doctor welcome chat
            if user_id:
                c.execute("""
                INSERT INTO chat_messages (user_id, sender, message)
                VALUES (?, 'doctor', ?)
                """, (user_id, f"🎉 سلام عزیزم، برنامه اختصاصی شما رو با دقت تنظیم و تایید کردم:\n{note}\nاز امروز با تکنیک‌های ۹۰ روزه شوک پرانرژی همراهت هستم!"))

            conn.commit()
            conn.close()

            return self._send_json({
                "success": True,
                "message": "✅ برنامه رژیم اختصاصی با موفقیت تایید و در پنل مراجع فعال گردید."
            })

        if path == "/api/admin/patient/reject":
            patient_id = body.get("patient_id")
            reason = body.get("reason", "نیازمند تکمیل مدارک یا ارسال مجدد آزمایش.")

            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("UPDATE patients SET status = 'needs_info', updated_at = CURRENT_TIMESTAMP WHERE id = ?", (patient_id,))
            conn.commit()
            conn.close()
            return self._send_json({"success": True, "message": "وضعیت پرونده به «نیازمند تکمیل مدارک» تغییر یافت."})

        if path == "/api/admin/chat/reply":
            user_id = body.get("user_id")
            message = body.get("message", "").strip()

            if not user_id or not message:
                return self._send_json({"error": "Missing params"}, 400)

            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("INSERT INTO chat_messages (user_id, sender, message) VALUES (?, 'doctor', ?)", (user_id, message))
            conn.commit()
            conn.close()
            return self._send_json({"success": True})

        # ================= AI CLINICAL COPILOT =================
        if path == "/api/ai/analyze-lab":
            analysis = ai_service.analyze_lab_test(body)
            return self._send_json(analysis)

        if path == "/api/ai/suggest-plan":
            plan = ai_service.generate_nutrition_plan(body)
            return self._send_json(plan)

        if path == "/api/ai/chat":
            message = body.get("message", "")
            profile = body.get("profile", {})
            lang = body.get("lang", "fa")
            reply = ai_service.chat_companion(message, profile, lang)
            return self._send_json({"reply": reply})

        # 404
        self.send_response(404)
        self.end_headers()

    def do_DELETE(self):
        url_parts = urllib.parse.urlparse(self.path)
        path = url_parts.path

        if path.startswith("/api/admin/patient/"):
            patient_id = path.split("/")[-1]
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("SELECT user_id FROM patients WHERE id = ?", (patient_id,))
            row = c.fetchone()
            if row and row[0]:
                u_id = row[0]
                c.execute("DELETE FROM habit_progress WHERE user_id = ?", (u_id,))
                c.execute("DELETE FROM daily_trackers WHERE user_id = ?", (u_id,))
                c.execute("DELETE FROM chat_messages WHERE user_id = ?", (u_id,))
                c.execute("DELETE FROM doctor_plans WHERE user_id = ?", (u_id,))
                c.execute("DELETE FROM users WHERE id = ?", (u_id,))
            c.execute("DELETE FROM patients WHERE id = ?", (patient_id,))
            conn.commit()
            conn.close()
            return self._send_json({"success": True, "message": "پرونده و سوابق مراجع با موفقیت حذف شد."})

        self.send_response(404)
        self.end_headers()

if __name__ == "__main__":
    init_db()
    print("=" * 60)
    print(f"🚀 DR. MADIS SHOCK PLATFORM - LOCAL BACKEND SERVER")
    print(f"📁 Database: {DB_PATH}")
    print(f"🌐 Local URL: http://localhost:{PORT}")
    print(f"📱 Patient Web App:  http://localhost:{PORT}/index.html")
    print(f"🩺 Admin / Doctor:   http://localhost:{PORT}/admin.html")
    print(f"🔑 Admin Login:      Username: admin  |  Password: 1234")
    print("=" * 60)
    
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CustomHTTPHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server cleanly.")
            httpd.shutdown()
