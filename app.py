import os
import sqlite3
from datetime import datetime

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
# Override via the SECRET_KEY env var (e.g. Replit's Secrets panel) for any
# real deployment -- the default is fine for local-only use.
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "change-me")
socketio = SocketIO(app)

DB_PATH = "chat.db"
MAX_MESSAGE_LENGTH = 500

# Tracks which username belongs to which socket connection (sid), so we can
# log "[USERNAME] connected/disconnected" instead of just a raw connection id.
connected_users = {}


def now():
    return datetime.now().strftime("%H:%M:%S")


def broadcast_online_users():
    """Tell every client who's currently online (deduped, so a user with two
    tabs open still only appears once)."""
    online_usernames = sorted(set(connected_users.values()))
    socketio.emit("online_users", {"users": online_usernames})


def init_db():
    """Create chat.db and the messages table if they don't already exist."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def save_message(username, message, timestamp):
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO messages (username, message, timestamp) VALUES (?, ?, ?)",
        (username, message, timestamp),
    )
    conn.commit()
    conn.close()


def get_all_messages():
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT username, message, timestamp FROM messages ORDER BY id ASC"
    ).fetchall()
    conn.close()
    return [{"username": u, "message": m, "timestamp": t} for u, m, t in rows]


init_db()


@app.route("/")
def index():
    """Serve the chat page."""
    return render_template("index.html")


@socketio.on("connect")
def handle_connect():
    """Fires on every (re)connection. Replays chat history to just this client."""
    for chat_message in get_all_messages():
        emit("receive_message", chat_message)


@socketio.on("join")
def handle_join(data):
    """Fires once the client has picked a username and entered the chat."""
    username = (data or {}).get("username", "").strip()
    if not username:
        return

    connected_users[request.sid] = username
    print(f"[{now()}] [{username}] connected")
    broadcast_online_users()


@socketio.on("disconnect")
def handle_disconnect():
    """Fires when a user closes the app or loses connection."""
    username = connected_users.pop(request.sid, None)
    if username:
        print(f"[{now()}] [{username}] disconnected")
        broadcast_online_users()
        # In case they disconnected mid-keystroke, don't leave other clients
        # stuck showing "username is typing..." forever.
        socketio.emit("user_stopped_typing", {"username": username})
    else:
        print(f"[{now()}] [unknown] disconnected")


@socketio.on("user_typing")
def handle_user_typing(data):
    """Relay a typing signal to everyone except the person typing."""
    username = (data or {}).get("username", "").strip()
    if not username:
        return
    emit("user_typing", {"username": username}, broadcast=True, include_self=False)


@socketio.on("user_stopped_typing")
def handle_user_stopped_typing(data):
    username = (data or {}).get("username", "").strip()
    if not username:
        return
    emit("user_stopped_typing", {"username": username}, broadcast=True, include_self=False)


@socketio.on("send_message")
def handle_send_message(data):
    """Fires when a user sends a chat message. Validates, persists, then broadcasts it."""
    username = (data or {}).get("username", "").strip()
    message = (data or {}).get("message", "").strip()

    if not username or not message:
        emit("error_message", {"error": "Username and message cannot be empty."})
        return

    if len(message) > MAX_MESSAGE_LENGTH:
        emit(
            "error_message",
            {"error": f"Message too long (max {MAX_MESSAGE_LENGTH} characters)."},
        )
        return

    timestamp = now()
    save_message(username, message, timestamp)
    print(f"[{timestamp}] [{username}] sent message")

    # Broadcast to every connected client (including the sender) so it appears in the chat.
    socketio.emit(
        "receive_message",
        {"username": username, "message": message, "timestamp": timestamp},
    )


if __name__ == "__main__":
    # Replit (and most hosts) assign the port dynamically and expect the app
    # to bind 0.0.0.0, rather than the localhost-only default used for local dev.
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 5000))
    # Debug defaults on (matches prior local-dev behavior); set DEBUG=false
    # in Replit's Secrets before sharing the URL -- Flask's debugger exposes
    # a code-execution console on error pages, which is unsafe on a public host.
    debug = os.getenv("DEBUG", "true").lower() == "true"

    print(f"Server running on http://{host}:{port}")
    socketio.run(app, host=host, port=port, debug=debug)
