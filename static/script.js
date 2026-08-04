// Connect to the WebSocket server (same host that served this page).
const socket = io();

const MAX_MESSAGE_LENGTH = 500;

let username = "";
let messageCount = 0;

// Message-grouping state: consecutive messages from the same sender collapse
// into one visual group (avatar + name shown once), like iMessage/Discord.
let lastGroupEl = null;
let lastGroupSender = null;

// Typing indicator state
const TYPING_TIMEOUT_MS = 1000;
let isTyping = false;
let typingTimeoutId = null;
const typingUsers = new Set(); // usernames other than us currently typing

const usernameScreen = document.getElementById("username-screen");
const usernameForm = document.getElementById("username-form");
const usernameInput = document.getElementById("username-input");

const chatScreen = document.getElementById("chat-screen");
const messageArea = document.getElementById("message-area");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");

const connectionStatus = document.getElementById("connection-status");
const messageCountEl = document.getElementById("message-count");
const onlineSummaryEl = document.getElementById("online-summary");
const userListEl = document.getElementById("user-list");

const sidebar = document.getElementById("sidebar");
const sidebarOpenBtn = document.getElementById("sidebar-open");
const sidebarCloseBtn = document.getElementById("sidebar-close");
const sidebarBackdrop = document.getElementById("sidebar-backdrop");

const typingIndicatorEl = document.getElementById("typing-indicator");
const typingTextEl = document.getElementById("typing-text");

const themeToggleBtn = document.getElementById("theme-toggle");

// --- Light/dark theme toggle ---
// The <head> inline script already set data-theme before first paint
// (saved choice, or OS preference as a fallback); this just keeps the
// button's icon in sync and handles switching it from here on.
const THEME_STORAGE_KEY = "paperplane-theme";

const SUN_ICON = `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
  <circle cx="12" cy="12" r="4.5"/>
  <path d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12H5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"/>
</svg>`;

const MOON_ICON = `<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
  <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>
</svg>`;

function getTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  // Icon shows the mode a click will switch TO, not the current one.
  themeToggleBtn.innerHTML = theme === "dark" ? SUN_ICON : MOON_ICON;
}

setTheme(getTheme());

themeToggleBtn.addEventListener("click", () => {
  setTheme(getTheme() === "dark" ? "light" : "dark");
});

// --- Username entry ---
usernameForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const value = usernameInput.value.trim();
  if (!value) return; // guard against blank/whitespace-only names

  username = value;
  usernameScreen.classList.add("hidden");
  chatScreen.classList.remove("hidden");

  socket.emit("join", { username: username });
  messageInput.focus();
});

// --- Sending a message ---
messageForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = messageInput.value.trim();
  if (!text) return; // guard against blank messages
  if (text.length > MAX_MESSAGE_LENGTH) return; // guard against overlong messages

  try {
    socket.emit("send_message", { username: username, message: text });
  } catch (err) {
    console.log("Failed to send message:", err);
  }

  messageInput.value = "";
  messageForm.classList.remove("has-text");
  stopTyping(); // sending counts as done typing, no need to wait out the debounce
  messageInput.focus(); // keep focus in the box so the user can keep typing
});

// Only light up the send button once there's something to send, and let the
// other clients know whether we're actively typing.
messageInput.addEventListener("input", () => {
  const hasText = messageInput.value.trim().length > 0;
  messageForm.classList.toggle("has-text", hasText);

  if (hasText) {
    startTyping();
  } else {
    stopTyping();
  }
});

function startTyping() {
  if (!isTyping) {
    isTyping = true;
    socket.emit("user_typing", { username: username });
  }
  // Reset the "went quiet" timer on every keystroke.
  clearTimeout(typingTimeoutId);
  typingTimeoutId = setTimeout(stopTyping, TYPING_TIMEOUT_MS);
}

function stopTyping() {
  clearTimeout(typingTimeoutId);
  typingTimeoutId = null;
  if (isTyping) {
    isTyping = false;
    socket.emit("user_stopped_typing", { username: username });
  }
}

// --- Mobile sidebar drawer ---
sidebarOpenBtn.addEventListener("click", () => setSidebarOpen(true));
sidebarCloseBtn.addEventListener("click", () => setSidebarOpen(false));
sidebarBackdrop.addEventListener("click", () => setSidebarOpen(false));

function setSidebarOpen(open) {
  sidebar.classList.toggle("open", open);
  sidebarBackdrop.classList.toggle("hidden", !open);
}

// --- Receiving a message from the server ---
socket.on("receive_message", (data) => {
  appendMessage(data);
});

// --- Server-side validation errors (e.g. blank message, too long) ---
socket.on("error_message", (data) => {
  console.log("Server rejected message:", data.error);
});

// --- Presence: the server sends this to everyone whenever who's online changes ---
socket.on("online_users", (data) => {
  renderUserList(data.users || []);
});

// --- Typing indicator: server already excludes us from our own broadcasts ---
socket.on("user_typing", (data) => {
  typingUsers.add(data.username);
  renderTypingIndicator();
});

socket.on("user_stopped_typing", (data) => {
  typingUsers.delete(data.username);
  renderTypingIndicator();
});

function renderTypingIndicator() {
  const names = Array.from(typingUsers);

  if (names.length === 0) {
    typingIndicatorEl.classList.add("hidden");
    return;
  }

  let text;
  if (names.length === 1) {
    text = `${names[0]} is typing…`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing…`;
  } else {
    text = "Several people are typing…";
  }

  typingTextEl.textContent = text;
  typingIndicatorEl.classList.remove("hidden");
  messageArea.scrollTo({ top: messageArea.scrollHeight, behavior: "smooth" });
}

function appendMessage(data) {
  const isOwn = data.username === username;
  const side = isOwn ? "own" : "other";
  const displayTime = formatTime(data.timestamp);

  const sameGroup = lastGroupEl && lastGroupSender === data.username;

  let groupEl;
  let contentEl;

  if (sameGroup) {
    groupEl = lastGroupEl;
    contentEl = groupEl.querySelector(".message-group-content");
  } else {
    groupEl = document.createElement("div");
    groupEl.className = `message-group ${side}`;

    if (!isOwn) {
      groupEl.appendChild(renderAvatar(data.username));
    }

    contentEl = document.createElement("div");
    contentEl.className = "message-group-content";

    if (!isOwn) {
      const nameEl = document.createElement("div");
      nameEl.className = "sender-name";
      nameEl.textContent = data.username;
      contentEl.appendChild(nameEl);
    }

    groupEl.appendChild(contentEl);
    messageArea.appendChild(groupEl);
  }

  // Drop any previous timestamp label so a new bubble can be inserted above it,
  // then re-append a fresh one reflecting the latest message in the group.
  const existingTime = contentEl.querySelector(".group-time");
  if (existingTime) existingTime.remove();

  // Only the newest bubble in a group gets the tail nub / flattened corner.
  const previousTailBubble = contentEl.querySelector(".bubble.has-tail");
  if (previousTailBubble) previousTailBubble.classList.remove("has-tail");

  const bubbleEl = document.createElement("div");
  bubbleEl.className = "bubble has-tail";
  bubbleEl.textContent = data.message;
  contentEl.appendChild(bubbleEl);

  const timeEl = document.createElement("div");
  timeEl.className = "group-time";
  timeEl.textContent = displayTime;
  contentEl.appendChild(timeEl);

  lastGroupEl = groupEl;
  lastGroupSender = data.username;

  updateMessageCount(messageCount + 1);

  // Smooth scroll to the newest message.
  messageArea.scrollTo({ top: messageArea.scrollHeight, behavior: "smooth" });
}

// Converts the server's "HH:MM:SS" (24h) into a friendlier "h:mm AM/PM" for display.
function formatTime(timeStr) {
  const [hourStr, minuteStr] = timeStr.split(":");
  const hour24 = parseInt(hourStr, 10);
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minuteStr} ${period}`;
}

function renderAvatar(name) {
  const avatarEl = document.createElement("div");
  avatarEl.className = "avatar";
  avatarEl.style.backgroundColor = colorForName(name);
  avatarEl.textContent = name.trim().charAt(0);
  return avatarEl;
}

// Deterministic grayscale tone per username (kept saturation-free to match
// the logo's black-on-gray monochrome mark), so the same person always gets
// the same avatar shade.
function colorForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const lightness = 35 + (Math.abs(hash) % 31); // 35%-65%, stays legible with white text
  return `hsl(0, 0%, ${lightness}%)`;
}

function updateMessageCount(count) {
  messageCount = count;
  messageCountEl.textContent = `${messageCount} message${messageCount === 1 ? "" : "s"}`;
}

function renderUserList(users) {
  userListEl.innerHTML = "";

  Array.from(users)
    .sort((a, b) => a.localeCompare(b))
    .forEach((name) => {
      const item = document.createElement("li");
      item.className = "user-item";

      const avatarWrap = document.createElement("div");
      avatarWrap.className = "user-avatar-wrap";
      avatarWrap.appendChild(renderAvatar(name));

      const statusDot = document.createElement("span");
      statusDot.className = "status-dot";
      avatarWrap.appendChild(statusDot);

      const nameEl = document.createElement("span");
      nameEl.className = "user-name";
      nameEl.textContent = name;

      item.appendChild(avatarWrap);
      item.appendChild(nameEl);
      userListEl.appendChild(item);
    });

  onlineSummaryEl.textContent = `Currently online: ${users.length} user${users.length === 1 ? "" : "s"}`;
}

function setConnectionStatus(isConnected, label) {
  connectionStatus.classList.toggle("connected", isConnected);
  connectionStatus.classList.toggle("disconnected", !isConnected);
  connectionStatus.innerHTML = `<span class="dot"></span> ${label}`;
}

// --- Connection status + error handling ---
socket.on("connect", () => {
  setConnectionStatus(true, "Connected");

  // The server replays full chat history on every (re)connect. Clear what's
  // already rendered first so a reconnect doesn't duplicate every message.
  messageArea.innerHTML = "";
  updateMessageCount(0);
  lastGroupEl = null;
  lastGroupSender = null;

  typingUsers.clear();
  renderTypingIndicator();
  isTyping = false;
  clearTimeout(typingTimeoutId);

  // If we already have a username (e.g. after a reconnect), rejoin so the
  // server can log/track this connection under the right name. The server
  // broadcasts the refreshed online list to everyone as part of that.
  if (username) {
    socket.emit("join", { username: username });
  }
});

socket.on("connect_error", (err) => {
  console.log("WebSocket connection error:", err);
  setConnectionStatus(false, "Connection error");
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected from server:", reason);
  setConnectionStatus(false, "Disconnected");
  renderUserList([]);
});
