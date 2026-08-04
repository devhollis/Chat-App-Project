# Installation

## System Requirements

- Python 3.8 or later
- pip (bundled with Python)
- A modern browser (Chrome, Firefox, Safari, Edge)

## Setup

1. **Get the code**

   Clone the repository, or download and unzip it into a folder.

2. **Create a virtual environment**

   From the project folder:

   ```
   python -m venv venv
   ```

3. **Activate the virtual environment**

   Windows (PowerShell or Git Bash):

   ```
   venv\Scripts\activate
   ```

   macOS / Linux:

   ```
   source venv/bin/activate
   ```

   Your terminal prompt should now show `(venv)` at the start of the line.

4. **Install dependencies**

   ```
   pip install -r requirements.txt
   ```

   This installs Flask, Flask-SocketIO, and their supporting packages.

5. **Run the server**

   ```
   python app.py
   ```

   On first run, this also creates `chat.db` (the SQLite database) automatically. You should see:

   ```
   Server running on http://localhost:5000
   ```

6. **Open the app**

   Go to [http://localhost:5000](http://localhost:5000) in your browser. Enter a name and start chatting. Open the same URL in a second tab to see messages sync in real time.

## Troubleshooting

- **Port already in use**: another process is using port 5000. Stop it, or change the port in the `socketio.run(...)` call at the bottom of `app.py`.
- **`ModuleNotFoundError`**: the virtual environment isn't activated, or `pip install -r requirements.txt` didn't complete. Re-run step 3, then step 4.
- **Old messages missing**: chat history is stored in `chat.db` in the project folder. Deleting that file starts a fresh, empty chat history.
