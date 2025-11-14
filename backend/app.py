# backend/app.py
import os
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import openai

# Config
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")  # change if you prefer another model
MEMORY_DB = os.getenv("MEMORY_DB", "memory.db")
MAX_HISTORY = int(os.getenv("MAX_HISTORY", "8"))  # how many past turns to include

if not OPENAI_API_KEY:
    raise RuntimeError("Set OPENAI_API_KEY environment variable before running.")

openai.api_key = OPENAI_API_KEY

# App
app = Flask(__name__, static_folder="../frontend", static_url_path="/")
CORS(app)

# Initialize DB
def init_db():
    conn = sqlite3.connect(MEMORY_DB)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def save_message(role, content):
    conn = sqlite3.connect(MEMORY_DB)
    cur = conn.cursor()
    cur.execute("INSERT INTO messages (role, content, created_at) VALUES (?, ?, ?)",
                (role, content, datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()

def get_recent_history(n=MAX_HISTORY):
    conn = sqlite3.connect(MEMORY_DB)
    cur = conn.cursor()
    cur.execute("SELECT role, content FROM messages ORDER BY id DESC LIMIT ?", (n*2,))  # *2 because user+assistant pairs
    rows = cur.fetchall()
    conn.close()
    # rows are newest first; reverse to oldest-first
    rows.reverse()
    return [{"role": r, "content": c} for r, c in rows]

# Routes
@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json or {}
    user_message = data.get("message", "").strip()
    if not user_message:
        return jsonify({"error": "No message provided."}), 400

    # Save user message to memory
    save_message("user", user_message)

    # Build conversation context: a system prompt + recent memory
    system_prompt = {
        "role": "system",
        "content": (
            "You are a helpful personal assistant for a user. Be concise, polite, and ask clarifying "
            "questions only if absolutely necessary. Your responses should be actionable and safe."
        )
    }

    history_msgs = get_recent_history(MAX_HISTORY)
    messages = [system_prompt] + history_msgs + [{"role": "user", "content": user_message}]

    # Call OpenAI Chat Completions
    try:
        resp = openai.ChatCompletion.create(
            model=OPENAI_MODEL,
            messages=messages,
            max_tokens=500,
            temperature=0.2,
        )
        assistant_text = resp.choices[0].message["content"].strip()
    except Exception as e:
        assistant_text = f"Error contacting language model: {str(e)}"
        return jsonify({"error": assistant_text}), 500

    # Save assistant response into memory
    save_message("assistant", assistant_text)

    return jsonify({"reply": assistant_text})

@app.route("/api/history", methods=["GET"])
def history():
    history = get_recent_history(MAX_HISTORY)
    return jsonify({"history": history})

if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000)
