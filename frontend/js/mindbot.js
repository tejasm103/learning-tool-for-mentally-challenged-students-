/**
 * MINDVERSE — INCLUSIVE LEARNING LAB
 * MindBot Friendly AI Learning Assistant Component
 */

const MindBotWidget = (function() {
  let isDrawerOpen = false;
  let recognition = null;

  function init() {
    createDOM();
    bindEvents();
    initSpeechRecognition();
  }

  function createDOM() {
    // 1. Floating Action Button
    const fab = document.createElement('div');
    fab.id = 'mindbot-fab';
    fab.className = 'mindbot-fab';
    fab.setAttribute('role', 'button');
    fab.setAttribute('aria-label', 'Open MindBot Learning Assistant');
    fab.setAttribute('tabindex', '0');
    fab.innerHTML = '🤖';
    document.body.appendChild(fab);

    // 2. Chat Drawer
    const drawer = document.createElement('div');
    drawer.id = 'mindbot-drawer';
    drawer.className = 'mindbot-drawer';
    drawer.innerHTML = `
      <div class="mindbot-header">
        <div class="mindbot-header-info">
          <div class="mindbot-avatar">🤖</div>
          <div>
            <h4 style="margin:0; font-size:1.05rem; color:#fff;">MindBot AI</h4>
            <span style="font-size:0.75rem; color:var(--primary);">● Learning Assistant</span>
          </div>
        </div>
        <button class="btn-icon" id="mindbot-close-btn" style="width:32px; height:32px; font-size:0.9rem;" aria-label="Close Chat">✕</button>
      </div>

      <div class="mindbot-messages" id="mindbot-messages">
        <div class="chat-bubble bot">
          Hello! I am MindBot, your friendly learning teacher. What exciting concept would you like to explore together today?
        </div>
        <div class="chat-suggestions" id="mindbot-suggestions">
          <button class="chat-chip">What is the letter A?</button>
          <button class="chat-chip">Tell me about Kannada vowels</button>
          <button class="chat-chip">What does Red light mean?</button>
          <button class="chat-chip">What is 5 × 4?</button>
          <button class="chat-chip">I need a calm break</button>
        </div>
      </div>

      <div class="mindbot-input-area">
        <button class="btn-icon" id="mindbot-mic-btn" title="Speak with microphone" style="width:36px; height:36px;">🎙️</button>
        <input type="text" id="mindbot-input" class="mindbot-input" placeholder="Ask MindBot anything..." aria-label="Message to MindBot">
        <button class="btn btn-primary" id="mindbot-send-btn" style="padding:0.6rem 1rem; border-radius:var(--radius-full);">Send</button>
      </div>
    `;
    document.body.appendChild(drawer);
  }

  function bindEvents() {
    const fab = document.getElementById('mindbot-fab');
    const drawer = document.getElementById('mindbot-drawer');
    const closeBtn = document.getElementById('mindbot-close-btn');
    const sendBtn = document.getElementById('mindbot-send-btn');
    const input = document.getElementById('mindbot-input');
    const micBtn = document.getElementById('mindbot-mic-btn');
    const suggestions = document.getElementById('mindbot-suggestions');

    fab.addEventListener('click', toggleDrawer);
    closeBtn.addEventListener('click', toggleDrawer);

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    if (suggestions) {
      suggestions.addEventListener('click', (e) => {
        if (e.target.classList.contains('chat-chip')) {
          input.value = e.target.textContent;
          sendMessage();
        }
      });
    }

    if (micBtn) {
      micBtn.addEventListener('click', toggleMic);
    }
  }

  function toggleDrawer() {
    isDrawerOpen = !isDrawerOpen;
    const drawer = document.getElementById('mindbot-drawer');
    if (drawer) {
      drawer.classList.toggle('active', isDrawerOpen);
      if (isDrawerOpen) {
        document.getElementById('mindbot-input').focus();
        if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.playClickSound();
      }
    }
  }

  async function sendMessage() {
    const input = document.getElementById('mindbot-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    appendMessage(text, 'user');

    // Bot typing placeholder
    const typingBubble = appendMessage('MindBot is thinking...', 'bot');

    try {
      let replyData;
      if (typeof MindVerseAPI !== 'undefined') {
        replyData = await MindVerseAPI.chatWithMindBot(text);
      } else {
        replyData = { reply: 'That is wonderful! In MindVerse we learn step by step: Show, Explain, Practice!' };
      }

      typingBubble.remove();
      const botMsg = appendMessage(replyData.reply, 'bot', replyData.suggestions);

      // Speak response if voice enabled
      if (typeof MindVerseAudio !== 'undefined') {
        MindVerseAudio.speak(replyData.audio_text || replyData.reply);
      }
    } catch (e) {
      typingBubble.textContent = 'I am here with you! Let us explore letters, numbers, and games together.';
    }
  }

  function appendMessage(text, sender = 'bot', suggestions = []) {
    const messagesContainer = document.getElementById('mindbot-messages');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.textContent = text;
    messagesContainer.appendChild(bubble);

    if (suggestions && suggestions.length > 0) {
      const chipContainer = document.createElement('div');
      chipContainer.className = 'chat-suggestions';
      suggestions.forEach(s => {
        const chip = document.createElement('button');
        chip.className = 'chat-chip';
        chip.textContent = s;
        chip.onclick = () => {
          document.getElementById('mindbot-input').value = s;
          sendMessage();
        };
        chipContainer.appendChild(chip);
      });
      messagesContainer.appendChild(chipContainer);
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return bubble;
  }

  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('mindbot-input');
        if (input) {
          input.value = transcript;
          sendMessage();
        }
      };

      recognition.onend = () => {
        const mic = document.getElementById('mindbot-mic-btn');
        if (mic) mic.style.background = '';
      };
    }
  }

  function toggleMic() {
    if (!recognition) {
      alert('Speech input is supported in Google Chrome, Microsoft Edge, and modern browsers.');
      return;
    }
    const mic = document.getElementById('mindbot-mic-btn');
    try {
      recognition.start();
      if (mic) mic.style.background = 'var(--accent-pink)';
    } catch (e) {
      recognition.stop();
      if (mic) mic.style.background = '';
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    open: () => { if (!isDrawerOpen) toggleDrawer(); },
    close: () => { if (isDrawerOpen) toggleDrawer(); },
    ask: (q) => {
      if (!isDrawerOpen) toggleDrawer();
      const input = document.getElementById('mindbot-input');
      if (input) {
        input.value = q;
        sendMessage();
      }
    }
  };
})();
