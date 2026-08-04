# Claude Code Prompts for Chat App Build
Use these prompts in Claude Code (terminal or desktop). Copy the entire prompt block, paste it into Claude Code, and it will generate the code. Test after each prompt.

**Before you start:** Create a folder on your machine called `chat-app`. All code will be generated inside it.

---

## PHASE 1: MVP (Real-Time Chat)

### Prompt 1: Project Setup & Requirements
**Copy this entire prompt into Claude Code:**

```
I'm building a real-time chat application using Python and Flask. Create the project structure and dependencies file.

Requirements:
1. Create a new folder structure for the project with:
   - app.py (main Flask app)
   - requirements.txt (Python dependencies)
   - templates/ folder (for HTML)
   - static/ folder (for CSS and JavaScript)

2. In requirements.txt, include:
   - Flask (web framework)
   - Flask-SocketIO (for real-time WebSocket communication)
   - python-socketio and python-engineio (SocketIO dependencies)
   - Any other standard dependencies for a Flask app

3. Print instructions on how to:
   - Create a virtual environment
   - Install the requirements
   - Run the app

Start me off—I just need the project structure and requirements.txt file created. Nothing else yet.
```

**Test:** Run `pip install -r requirements.txt` and check that packages install without errors.

---

### Prompt 2: Basic Flask Server with WebSocket Support
**Copy this entire prompt into Claude Code:**

```
Build a basic Flask server with WebSocket support using Flask-SocketIO.

Requirements:
1. In app.py, create:
   - A Flask app that runs on localhost:5000
   - Initialize Flask-SocketIO for real-time communication
   - A route that serves index.html (the chat page)
   - WebSocket event handlers for:
     - "connect" — when a user opens the app
     - "disconnect" — when a user closes the app
     - "send_message" — when a user sends a message
   
2. For now, just print these events to the console (no database yet).

3. Add comments explaining what each handler does.

4. The server should print "Server running on http://localhost:5000" when started.

Important: This is Phase 1, so keep it simple. No authentication, no database storage yet. Just handle the WebSocket events.

Generate app.py with these basic handlers.
```

**Test:** Run `python app.py` and check that the server starts. Visit `http://localhost:5000` in your browser (will 404 because there's no index.html yet—that's OK).

---

### Prompt 3: HTML & CSS for Chat UI
**Copy this entire prompt into Claude Code:**

```
Create a clean, simple chat UI for a web-based chat app.

Requirements:
1. Create templates/index.html with:
   - A text input for the username (shows only on first load, then hidden after "Enter Chat")
   - A text input for typing messages
   - A "Send" button
   - A message display area (div where messages appear)
   - Messages should show: [Username] [Time]: [Message]

2. Create static/style.css with:
   - Clean, modern styling (no need to be fancy)
   - Message area that scrolls
   - Responsive design (works on mobile)
   - Input fields and buttons are easy to tap
   - Background is light, text is dark, good contrast

3. Make it so the username input is required, and users can't send a blank message.

4. The design should look professional enough to show someone (Phase 2 will polish it more).

Generate both templates/index.html and static/style.css with inline CSS or a linked stylesheet.
```

**Test:** Start the server and visit `http://localhost:5000`. You should see the chat UI. Type a message—nothing happens yet (because there's no JavaScript connecting to WebSocket).

---

### Prompt 4: Frontend JavaScript & WebSocket Connection
**Copy this entire prompt into Claude Code:**

```
Create the JavaScript that connects the frontend to the WebSocket server and handles messaging.

Requirements:
1. Create static/script.js that:
   - Connects to the WebSocket server using SocketIO
   - Handles the username input: when user clicks "Enter Chat", store username and hide the input
   - When user types a message and clicks "Send":
     - Send the message to the server via WebSocket ("send_message" event)
     - Clear the input field
   - Listen for incoming messages from the server ("receive_message" event)
   - When a message is received, display it in the message area with format: [Time] [Username]: [Message]
   - Add smooth scrolling to the bottom when new messages arrive

2. Include error handling (console.log errors if WebSocket fails).

3. Keep the code clean and well-commented.

Generate static/script.js and update templates/index.html to include the script tag at the bottom.
```

**Test:** Start server, open `http://localhost:5000` in two browser tabs. Type a username in each. Send a message from Tab 1—it should appear in Tab 2 instantly. Test both directions.

---

### Prompt 5: SQLite Database Setup & Message Persistence
**Copy this entire prompt into Claude Code:**

```
Add SQLite database to store chat messages so they persist after refresh.

Requirements:
1. In app.py, add:
   - Import sqlite3
   - Create a database function that initializes a chat.db file (if it doesn't exist)
   - Create a "messages" table with columns:
     - id (primary key, auto-increment)
     - username (text)
     - message (text)
     - timestamp (datetime, auto-set to current time)

2. Modify the WebSocket handlers:
   - When "send_message" is received, store it in the database
   - When a user connects, send all messages from the database to populate the chat history

3. Load all previous messages when the page loads (so chat history is shown).

4. Keep timestamps simple: "HH:MM:SS" format.

Important: This adds persistence. After this, messages survive page refreshes.

Update app.py to include database initialization and message storage.
```

**Test:** Send some messages, refresh the page—old messages should still be there. Test in both tabs.

---

### Prompt 6: Refine & Bug Fix (MVP Complete)
**Copy this entire prompt into Claude Code:**

```
Polish the MVP and fix any edge cases.

Requirements:
1. Test and fix:
   - Prevent empty messages
   - Prevent empty usernames
   - Validate message length (max 500 characters)
   - Handle disconnection gracefully (if server goes down, show error)

2. Improve UX:
   - Add a "currently connected" indicator at the top
   - Show number of messages in the chat
   - Auto-focus on message input after sending

3. Add logging:
   - Print to console: "[HH:MM:SS] [USERNAME] sent message"
   - Print: "[HH:MM:SS] [USERNAME] connected"
   - Print: "[HH:MM:SS] [USERNAME] disconnected"

4. Test the entire flow:
   - Open two browser windows
   - User A sends message → appears in User B's window instantly
   - Refresh both windows → messages persist
   - Disconnect one user → other user sees disconnect message

Generate updates to app.py and static/script.js to polish this MVP.

Once this works, you're done with Phase 1. You have a working real-time chat app.
```

**Test:** Full end-to-end test. Send messages, refresh, disconnect, reconnect. Everything should work smoothly.

---

## PHASE 2: Shareable Product (Polish & Deploy)

### Prompt 7: Upgrade UI/UX for Production
**Copy this entire prompt into Claude Code:**

```
Upgrade the chat UI to look professional and production-ready.

Requirements:
1. Update static/style.css:
   - Use a modern color scheme (I recommend: white background, dark text, blue accents)
   - Message bubbles: User's messages on right (blue background), other users on left (gray background)
   - Better spacing and typography
   - Smooth animations when messages appear
   - User list on the side showing who's currently online
   - Typing indicator: show "User is typing..." when another user is composing

2. Update templates/index.html:
   - Add a header showing the chat name "ChatApp"
   - Add a user list sidebar
   - Show online/offline status for each user
   - Add timestamps for each message (smaller, gray text)

3. Add responsive design:
   - Mobile: sidebar collapses, full-width message area
   - Desktop: sidebar visible, messages on right

4. Add CSS for animations:
   - Message fade-in
   - Bounce when new message arrives
   - Smooth scroll

Generate updated static/style.css and templates/index.html. Make it look like a real app.
```

**Test:** Open `http://localhost:5000`. Check that the UI looks professional. Test on mobile view (browser dev tools). Messages should be bubble-style and easy to read.

---

### Prompt 8: Typing Indicator & Online Status
**Copy this entire prompt into Claude Code:**

```
Add typing indicator and online status tracking.

Requirements:
1. Frontend (static/script.js):
   - When user starts typing, send a "user_typing" event to the server
   - When user stops typing for 1 second, send "user_stopped_typing"
   - Display "User is typing..." when someone else is typing

2. Backend (app.py):
   - Track which users are online (add to a set when they connect, remove on disconnect)
   - When "user_typing" is received, broadcast it to all other users
   - When "user_stopped_typing" is received, stop showing typing indicator
   - Send the list of online users to all clients whenever it changes

3. Frontend UI:
   - Show "Currently online: [number] users" at the top
   - Show typing indicator below the message area: "Alice is typing..."

Generate updates to app.py and static/script.js to implement this feature.
```

**Test:** Open two tabs. Start typing in one tab—the other should show "User is typing..." Stop typing and it should disappear.

---

### Prompt 9: README & Documentation
**Copy this entire prompt into Claude Code:**

```
Create professional documentation for the chat app.

Requirements:
1. Create README.md with sections:
   - Project title: "ChatApp - Real-Time Chat Application"
   - Description (2-3 sentences explaining what it is)
   - Tech stack (Python, Flask, SocketIO, SQLite)
   - Features (real-time messaging, message persistence, online status, typing indicator)
   - Installation instructions (step-by-step to run locally)
   - Usage (how to open the app and start chatting)
   - Future features (Phase 3 upgrades)
   - License (MIT or just say "Open source")

2. Create INSTALLATION.md with:
   - System requirements (Python 3.8+)
   - Step-by-step setup:
     1. Clone repo / Download code
     2. Create virtual environment
     3. Install dependencies
     4. Run the server
     5. Open browser to localhost:5000

3. Create a .gitignore file to exclude:
   - __pycache__/
   - *.pyc
   - venv/
   - chat.db (optional, for privacy)
   - .env (for secrets later)

Generate README.md, INSTALLATION.md, and .gitignore.
```

**Test:** Read the README and follow the instructions—they should work perfectly.

---

### Prompt 10: Deploy to Replit
**Copy this entire prompt into Claude Code:**

```
Prepare the chat app for deployment to Replit.

Requirements:
1. Update app.py:
   - Instead of localhost:5000, use os.getenv("HOST", "0.0.0.0") and os.getenv("PORT", 5000)
   - This allows Replit to assign the port dynamically

2. Add a .replit file with:
   - Run command: "python app.py"
   - Language: "python3"

3. Create a Replit-specific setup:
   - Make sure requirements.txt has all dependencies
   - Add environment variable setup if needed (none for this MVP)

4. Add a Procfile (for compatibility):
   - web: python app.py

Instructions to deploy manually:
   1. Go to Replit.com and sign up (free)
   2. Click "Create" and import from GitHub OR upload files
   3. Click "Run"
   4. Replit generates a live URL (e.g., https://chatapp.username.repl.co)
   5. Share the URL with anyone to chat in real-time

Generate the .replit file and Procfile. Update app.py for Replit compatibility.
```

**Test:** Create a Replit account, upload your code, and hit "Run". Should work instantly without changes.

---

## PHASE 3: Feature-Rich Platform

### Prompt 11: User Authentication (Sign Up / Login)
**Copy this entire prompt into Claude Code:**

```
Add user authentication to the chat app.

Requirements:
1. Create a "users" table in SQLite with:
   - id (primary key)
   - username (unique, text)
   - email (unique, text)
   - password (hashed, text)
   - created_at (timestamp)

2. In app.py:
   - Import bcrypt for password hashing
   - Create /signup route: accept username, email, password → hash password → store in DB
   - Create /login route: accept username, password → verify hash → create session
   - Protect /chat route: only logged-in users can access chat

3. Frontend (templates):
   - Create auth.html with sign-up and login forms
   - If not logged in, show auth.html
   - If logged in, show index.html (the chat)
   - Add logout button in chat

4. Store session info:
   - Use Flask sessions or JWT tokens to track logged-in users
   - Verify user on each WebSocket connection

Generate updates for authentication. This replaces the simple username input with real user accounts.
```

**Test:** Sign up with an account, log out, log back in—your sessions should persist.

---

### Prompt 12: Multiple Chat Rooms
**Copy this entire prompt into Claude Code:**

```
Add support for multiple chat rooms.

Requirements:
1. Create a "rooms" table in SQLite:
   - id (primary key)
   - room_name (unique, text)
   - created_at (timestamp)

2. Create a "room_membership" table:
   - user_id
   - room_id
   - joined_at (timestamp)

3. Modify "messages" table to include:
   - room_id (foreign key)

4. Backend (app.py):
   - When user logs in, show list of rooms (or let them create one)
   - When user clicks a room, join it (WebSocket.emit "join_room")
   - Messages are room-specific (only users in that room see them)
   - Users can see who's in each room

5. Frontend:
   - Sidebar shows list of rooms
   - Click a room to switch
   - Current room name is highlighted
   - Button to create new room
   - Messages are scoped to current room

Generate updates to support multiple rooms.
```

**Test:** Create two rooms, join different rooms with two users, send messages—they should only see messages in their room.

---

### Prompt 13: Advanced Features (Pick One or More)
**Copy this entire prompt into Claude Code:**

```
Choose one or more of these features to add:

OPTION A: Message Reactions
- Users can react to messages with emoji
- Show emoji counts under messages
- Click to toggle your reaction

OPTION B: Message Editing & Deletion
- Users can edit their own messages
- Users can delete their own messages
- Show "[edited]" next to edited messages
- Show "deleted" as placeholder for deleted messages

OPTION C: Read Receipts
- Show checkmarks: 1 check = sent, 2 checks = received, 2 blue checks = read
- Show "Last read at HH:MM" for each user

OPTION D: User Profiles
- Click username to see profile
- Profile shows: username, email, joined date, number of messages sent
- Users can edit their own profile

OPTION E: Search & Message History
- Search bar to find messages by keyword
- Show results with context (message before/after)
- Filter by user

Pick the feature you want most. Generate the backend and frontend code to implement it.
```

**Test:** Implement one feature fully. Test it end-to-end.

---

## How to Use These Prompts

1. **Copy the entire prompt** (from "Copy this entire prompt..." to the end of the requirements)
2. **Paste into Claude Code** (terminal or desktop app)
3. **Hit enter** — Claude Code generates the code
4. **Files are created automatically** in your chat-app directory
5. **Test immediately** — run the code, try the feature
6. **Debug if needed** — if something breaks, ask Claude Code: "Fix [error description]"
7. **Move to next prompt** when current one works

---

## Pro Tips

- **Commit to Git after each prompt** — `git add .` then `git commit -m "Phase 1.X: [feature name]"`
- **Keep a log** — write down what each prompt taught you
- **Skip if confused** — if a prompt doesn't make sense, ask Claude to explain before building
- **Iterate** — bugs are normal, fix them before moving forward
- **Show your friend** — after each phase, share what you built

---

## Success Path

✅ Prompts 1-6 = Working real-time chat MVP  
✅ Prompts 7-10 = Professional, deployable product  
✅ Prompts 11-13 = Feature-rich platform  

By Prompt 13, you'll have built a real application with:
- Backend
- Frontend
- Database
- Authentication
- Multiple rooms
- Advanced features
- Deployed to the web

**That's a portfolio piece that gets you jobs.**

