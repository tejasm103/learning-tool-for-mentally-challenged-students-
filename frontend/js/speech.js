/**
 * MINDVERSE — INCLUSIVE LEARNING LAB
 * Enhanced Speech Synthesis & Web Audio Teaching Sounds Module
 * Fully compatible with Chrome, Edge, Safari, Firefox Autoplay Policies
 */

const MindVerseAudio = (function() {
  let isMuted = false;
  let speechRate = 0.95;
  let speechPitch = 1.05; // Friendly, warm educator pitch
  let audioCtx = null;
  let isUnlocked = false;
  let cachedVoices = [];
  let currentUtterance = null;

  // 1. Initialize & Unlock Web Audio Context
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  // 2. Global User Gesture Unlocker (Satisfies Browser Autoplay Policy)
  function unlock() {
    if (isUnlocked) return;
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.resume();
      }
      isUnlocked = true;
      updateSoundPillUI(true);
      console.log('[MindVerseAudio] AudioContext & SpeechSynthesis unlocked.');
    } catch (e) {
      console.warn('[MindVerseAudio] Unlock attempt warning:', e);
    }
  }

  // Auto-bind one-time user interaction listeners to unlock sound immediately
  if (typeof window !== 'undefined') {
    const unlockEvents = ['click', 'touchstart', 'keydown'];
    const unlockHandler = function() {
      unlock();
      unlockEvents.forEach(evt => window.removeEventListener(evt, unlockHandler, { capture: true }));
    };
    unlockEvents.forEach(evt => window.addEventListener(evt, unlockHandler, { capture: true, once: true }));

    // Preload speech voices
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        cachedVoices = window.speechSynthesis.getVoices() || [];
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  // 3. Select Best Educator / Teacher Voice
  function getBestVoice(targetLang = 'en-US') {
    if (!('speechSynthesis' in window)) return null;
    if (cachedVoices.length === 0) {
      cachedVoices = window.speechSynthesis.getVoices() || [];
    }

    const langLower = targetLang.toLowerCase();

    // Specific match for Hindi
    if (langLower.startsWith('hi')) {
      const hiVoice = cachedVoices.find(v => v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('kalpana') || v.name.toLowerCase().includes('hemant'));
      if (hiVoice) return hiVoice;
      // Fallback for Indian English if native Hindi TTS is missing in OS
      const inEnVoice = cachedVoices.find(v => v.lang.toLowerCase() === 'en-in' || v.name.toLowerCase().includes('india'));
      if (inEnVoice) return inEnVoice;
    }

    // Specific match for Kannada
    if (langLower.startsWith('kn')) {
      const knVoice = cachedVoices.find(v => v.lang.toLowerCase().startsWith('kn') || v.name.toLowerCase().includes('kannada'));
      if (knVoice) return knVoice;
      const inVoice = cachedVoices.find(v => v.lang.toLowerCase().startsWith('en-in') || v.lang.toLowerCase().startsWith('hi'));
      if (inVoice) return inVoice;
    }

    // English: Prefer warm, pleasant female teacher voices
    const preferredEnglishVoices = [
      'google us english',
      'microsoft jenny online',
      'microsoft aria online',
      'microsoft zira',
      'samantha',
      'karen',
      'victoria',
      'en-us'
    ];

    for (const pref of preferredEnglishVoices) {
      const found = cachedVoices.find(v => v.name.toLowerCase().includes(pref) || v.lang.toLowerCase().includes(pref));
      if (found) return found;
    }

    // Generic English voice fallback
    const anyEn = cachedVoices.find(v => v.lang.toLowerCase().startsWith('en'));
    if (anyEn) return anyEn;

    return cachedVoices[0] || null;
  }

  // 4. Update On-Screen Sound Pill (If present)
  function updateSoundPillUI(active) {
    const pill = document.getElementById('mv-floating-sound-pill');
    if (pill) {
      if (active && !isMuted) {
        pill.innerHTML = `<span>🔊</span> Sound Active`;
        pill.style.borderColor = 'var(--primary)';
        pill.style.color = 'var(--primary)';
      } else if (isMuted) {
        pill.innerHTML = `<span>🔇</span> Sound Muted`;
        pill.style.borderColor = 'var(--border-light)';
        pill.style.color = 'var(--text-muted)';
      }
    }
  }

  return {
    isMuted: () => isMuted,
    setMuted: (val) => { 
      isMuted = val; 
      if (isMuted) {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      }
      updateSoundPillUI(!isMuted);
    },
    setRate: (rate) => { speechRate = rate; },
    setPitch: (pitch) => { speechPitch = pitch; },
    unlock: unlock,

    // Robust Spoken Text Narration via Web Speech API
    speak(text, lang = 'en-US', onEnd = null) {
      if (isMuted || !text || !('speechSynthesis' in window)) return;

      unlock();

      try {
        // Fix Chromium paused synthesis bug
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        // Cancel pending utterances with a tiny buffer to avoid canceling current
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
        }

        setTimeout(() => {
          try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = speechRate;
            utterance.pitch = speechPitch;

            // Normalize language
            if (lang.startsWith('kn')) utterance.lang = 'kn-IN';
            else if (lang.startsWith('hi')) utterance.lang = 'hi-IN';
            else utterance.lang = 'en-US';

            const bestVoice = getBestVoice(utterance.lang);
            if (bestVoice) {
              utterance.voice = bestVoice;
            }

            // Retain reference on window to prevent Chromium GC cancellation bug
            currentUtterance = utterance;
            window._mvActiveUtterance = utterance;

            utterance.onend = () => {
              currentUtterance = null;
              if (typeof onEnd === 'function') onEnd();
            };

            utterance.onerror = (err) => {
              console.warn('[MindVerseAudio] Speech error event:', err);
              currentUtterance = null;
              if (typeof onEnd === 'function') onEnd();
            };

            window.speechSynthesis.speak(utterance);
          } catch (innerErr) {
            console.warn('[MindVerseAudio] Speech execution fallback:', innerErr);
          }
        }, 15);

      } catch (err) {
        console.warn('[MindVerseAudio] Speech synthesize failed:', err);
      }
    },

    // Stop all speech immediately
    stopSpeech() {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      currentUtterance = null;
    },

    // Teacher Voice with Prior Marimba Cue Chime
    speakTeacher(text, lang = 'en-US', onEnd = null) {
      this.playTeacherChime();
      setTimeout(() => {
        this.speak(text, lang, onEnd);
      }, 350);
    },

    // Procedural Synthesized Sounds (Web Audio API)
    playTeacherChime() {
      if (isMuted) return;
      unlock();
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        // Warm two-tone marimba chime (G4 -> C5)
        [392.00, 523.25].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.4);
        });
      } catch (e) {}
    },

    playClassroomBell() {
      if (isMuted) return;
      unlock();
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        // School bell dual tubular chime (E5 -> C5)
        const notes = [659.25, 523.25];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.2);

          gain.gain.setValueAtTime(0, now + idx * 0.2);
          gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.2 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.2 + 0.7);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.2);
          osc.stop(now + idx * 0.2 + 0.75);
        });
      } catch (e) {}
    },

    playSuccessSound() {
      if (isMuted) return;
      unlock();
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        // Uplifting major chord: C5 -> E5 -> G5 -> C6
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.08);

          gain.gain.setValueAtTime(0, now + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.5);
        });
      } catch (e) {}
    },

    playStarSound() {
      if (isMuted) return;
      unlock();
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.28);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.42);
      } catch (e) {}
    },

    playClickSound() {
      if (isMuted) return;
      unlock();
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } catch (e) {}
    },

    playGentleTryAgain() {
      if (isMuted) return;
      unlock();
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392.00, now); // G4
        osc.frequency.linearRampToValueAtTime(329.63, now + 0.22); // E4

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } catch (e) {}
    },

    // 1-Click Test Teacher Sound & Voice
    testSoundAndVoice() {
      unlock();
      this.playClassroomBell();
      setTimeout(() => {
        this.speak("Hello! MindVerse sound and teacher voice are now active and ready!");
      }, 500);
    }
  };
})();

// Inject Interactive Sound Test Control into page footer or bottom bar
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('mv-floating-sound-pill')) {
    const pill = document.createElement('button');
    pill.id = 'mv-floating-sound-pill';
    pill.setAttribute('aria-label', 'Toggle or test teaching sound and voice');
    pill.title = 'Click to test and enable teacher voice & classroom sound';
    pill.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(15, 23, 42, 0.92);
      border: 1px solid var(--border-glow, #00f0ff);
      color: #00f0ff;
      padding: 0.55rem 1.1rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      z-index: 10000;
      transition: all 0.3s ease;
    `;
    pill.innerHTML = `<span>🔊</span> Test Teacher Sound`;
    pill.onmouseenter = () => { pill.style.transform = 'scale(1.05)'; };
    pill.onmouseleave = () => { pill.style.transform = 'scale(1)'; };
    pill.onclick = () => {
      MindVerseAudio.testSoundAndVoice();
      pill.innerHTML = `<span>✅</span> Sound Ready!`;
      setTimeout(() => {
        pill.innerHTML = `<span>🔊</span> Sound Active`;
      }, 3000);
    };
    document.body.appendChild(pill);
  }
});
