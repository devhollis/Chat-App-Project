# PaperPlane - Real-Time Chat Application

PaperPlane is a real-time, browser-based chat app built with Flask and Flask-SocketIO. Messages are delivered instantly over WebSockets, persisted to a local SQLite database, and rendered in an iMessage-style interface with grouped bubbles, typing indicators, and live online status.

## Tech Stack

- **Python 3** / **Flask** - web server and routing
- **Flask-SocketIO** (`python-socketio`, `python-engineio`) - real-time WebSocket communication
- **SQLite** - message persistence (`chat.db`)
- **Vanilla HTML / CSS / JavaScript** - no frontend framework or build step

## Features

- Real-time messaging over WebSockets - messages appear instantly for everyone connected
- Message persistence - chat history survives page refreshes and reconnects, backed by SQLite
- Live online status - the sidebar shows exactly who's currently connected
- Typing indicator - see when someone else is composing a message, with a 1-second idle timeout
- Light and dark mode, with a manual toggle that's remembered across visits
- Responsive layout - collapsible sidebar drawer on mobile, persistent sidebar on desktop
- Message grouping, avatars, and bubble tails styled after iMessage/Discord conventions

## Installation

1. **Create a virtual environment**

   ```
   python -m venv venv
   ```

2. **Activate it**

   ```
   venv\Scripts\activate        # Windows
   source venv/bin/activate     # macOS/Linux
   ```

3. **Install dependencies**

   ```
   pip install -r requirements.txt
   ```

4. **Run the server**

   ```
   python app.py
   ```

   You should see `Server running on http://localhost:5000` printed in the terminal.

See [INSTALLATION.md](INSTALLATION.md) for more detail, including system requirements.

## Usage

1. With the server running, open `http://localhost:5000` in your browser.
2. Enter a name on the welcome screen and click **Enter Chat**.
3. Type a message and hit **Send** (or press Enter) - it's delivered instantly to everyone else connected.
4. Open the same URL in a second tab or browser to chat with yourself and see real-time delivery, typing indicators, and online status in action.
5. Use the sun/moon button in the header to switch between light and dark mode.

## Future Features (Phase 3)

These are natural next steps beyond the current MVP:

- **User accounts** - real sign-up/login with hashed passwords, replacing the free-text username field
- **Multiple chat rooms** - create and join separate rooms instead of one shared conversation
- **Message reactions, editing, and deletion**
- **Read receipts** - sent/delivered/read indicators per message
- **User profiles** - click a username to view their profile and message history
- **Search** - find past messages by keyword

## License

Open source.
