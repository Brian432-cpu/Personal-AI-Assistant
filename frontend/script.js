const sendBtn = document.getElementById("sendBtn");
const input = document.getElementById("messageInput");
const messagesDiv = document.getElementById("messages");
const micBtn = document.getElementById("micBtn");
const speakToggle = document.getElementById("speakToggle");

let recognition = null;
let recognizing = false;
let speakReplies = true;

// Auto-detect backend URL
const isDocker = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
const BACKEND_URL = isDocker ? "http://backend:5000" : ""; // empty string = same origin
const API_URL = `${BACKEND_URL}/api/chat`;
const HISTORY_URL = `${BACKEND_URL}/api/history`;

// SpeechRecognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = navigator.language || "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.addEventListener("start", () => {
    recognizing = true;
    micBtn.classList.add("recording");
    micBtn.setAttribute("aria-pressed", "true");
  });

  recognition.addEventListener("end", () => {
    recognizing = false;
    micBtn.classList.remove("recording");
    micBtn.setAttribute("aria-pressed", "false");
  });

  recognition.addEventListener("result", (evt) => {
    const transcript = Array.from(evt.results)
      .map(r => r[0]?.transcript)
      .join("");
    if (transcript && transcript.trim().length > 0) {
      input.value = transcript;
      // Optionally auto-send voice input
      // sendMessage();
    }
  });

  recognition.addEventListener("error", (e) => {
    console.warn("Speech recognition error:", e);
    recognizing = false;
    micBtn.classList.remove("recording");
    micBtn.setAttribute("aria-pressed", "false");
  });
} else {
  micBtn.title = "Voice input not supported in this browser";
  micBtn.style.opacity = "0.5";
  micBtn.disabled = true;
}

// Speak toggle
speakToggle.title = "Toggle voice replies";
speakToggle.addEventListener("click", () => {
  speakReplies = !speakReplies;
  speakToggle.style.opacity = speakReplies ? "1" : "0.5";
  speakToggle.textContent = speakReplies ? "🔊" : "🔈";
});

// Load conversation history
async function loadHistory() {
  try {
    const r = await fetch(HISTORY_URL);
    if (!r.ok) return;
    const j = await r.json();
    messagesDiv.innerHTML = "";
    (j.history || []).forEach(m => appendMessage(m.role, m.content));
    scrollBottom();
  } catch (e) {
    console.error("history error", e);
  }
}

function appendMessage(role, content) {
  const wrap = document.createElement("div");
  wrap.className = "msg " + (role === "user" ? "user" : "assistant");
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = content;
  wrap.appendChild(bubble);
  messagesDiv.appendChild(wrap);

  if (role === "assistant" && speakReplies) speakText(content);
}

function scrollBottom() {
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Send message
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  appendMessage("user", text);
  input.value = "";
  scrollBottom();

  // thinking bubble
  const thinkingWrap = document.createElement("div");
  thinkingWrap.className = "msg assistant";
  thinkingWrap.innerHTML = `<div class="bubble">…thinking</div>`;
  messagesDiv.appendChild(thinkingWrap);
  scrollBottom();

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    if (!res.ok) {
      appendMessage("assistant", `Error: server returned ${res.status}`);
      return;
    }
    const j = await res.json();

    const lastBubble = messagesDiv.querySelector(".msg.assistant:last-child .bubble");
    if (lastBubble && lastBubble.textContent === "…thinking") {
      lastBubble.textContent = j.reply || "No reply";
    } else {
      appendMessage("assistant", j.reply || "No reply");
    }

    scrollBottom();
  } catch (e) {
    console.error(e);
    appendMessage("assistant", "Error: could not reach server.");
    scrollBottom();
  }
}

// Event listeners
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => { if (e.key === 'Enter') sendMessage(); });

micBtn.addEventListener("click", () => {
  if (!recognition) return;
  try {
    if (recognizing) recognition.stop();
    else recognition.start();
  } catch (err) {
    console.warn("Speech recognition toggle error:", err);
  }
});

// Text-to-speech
function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const lang = navigator.language || 'en-US';
  utter.lang = lang;
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length) {
    const v = voices.find(vo => vo.lang && vo.lang.startsWith(lang));
    if (v) utter.voice = v;
  }
  utter.rate = 1;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

// Initialize
loadHistory();
