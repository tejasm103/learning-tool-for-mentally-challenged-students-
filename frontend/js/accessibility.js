/**
 * MINDVERSE — INCLUSIVE LEARNING LAB
 * Accessibility Controller Module
 */

const MindVerseA11y = (function() {
  const defaults = {
    textSize: 'text-md',
    dyslexiaFont: false,
    highContrast: false,
    sensoryCalm: false,
    reducedMotion: false,
    narration: true,
    speechRate: 0.95
  };

  let settings = { ...defaults };

  function init() {
    // Load from localStorage
    try {
      const saved = localStorage.getItem('mindverse_a11y');
      if (saved) {
        settings = { ...defaults, ...JSON.parse(saved) };
      }
    } catch (e) {}

    applySettings();
    bindModalEvents();
  }

  function applySettings() {
    const html = document.documentElement;
    const body = document.body;

    // 1. Text Size
    html.classList.remove('text-sm', 'text-md', 'text-lg', 'text-xl');
    html.classList.add(settings.textSize || 'text-md');

    // 2. Dyslexia font
    if (settings.dyslexiaFont) {
      body.classList.add('font-dyslexic');
    } else {
      body.classList.remove('font-dyslexic');
    }

    // 3. High Contrast
    if (settings.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }

    // 4. Sensory Calm
    if (settings.sensoryCalm) {
      body.classList.add('sensory-calm');
    } else {
      body.classList.remove('sensory-calm');
    }

    // 5. Reduced Motion
    if (settings.reducedMotion) {
      body.classList.add('reduced-motion');
    } else {
      body.classList.remove('reduced-motion');
    }

    // 6. Speech Narration
    if (typeof MindVerseAudio !== 'undefined') {
      MindVerseAudio.setMuted(!settings.narration);
      MindVerseAudio.setRate(settings.speechRate || 0.95);
    }

    updateUIControls();
  }

  function saveSettings() {
    try {
      localStorage.setItem('mindverse_a11y', JSON.stringify(settings));
    } catch (e) {}
    
    // Sync to backend if logged in
    if (typeof MindVerseAPI !== 'undefined') {
      MindVerseAPI.savePreferences(settings).catch(() => {});
    }
  }

  function updateUIControls() {
    // Update active states on modal buttons
    document.querySelectorAll('[data-a11y-action]').forEach(btn => {
      const action = btn.dataset.a11yAction;
      const value = btn.dataset.a11yValue;

      if (action === 'text-size') {
        btn.classList.toggle('active', settings.textSize === value);
      } else if (action === 'dyslexia') {
        btn.classList.toggle('active', settings.dyslexiaFont);
      } else if (action === 'contrast') {
        btn.classList.toggle('active', settings.highContrast);
      } else if (action === 'calm') {
        btn.classList.toggle('active', settings.sensoryCalm);
      } else if (action === 'motion') {
        btn.classList.toggle('active', settings.reducedMotion);
      } else if (action === 'narration') {
        btn.classList.toggle('active', settings.narration);
      }
    });
  }

  function bindModalEvents() {
    document.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('#open-a11y-btn, .btn-a11y-trigger');
      if (toggleBtn) {
        openModal();
        return;
      }

      const closeBtn = e.target.closest('#close-a11y-btn, .a11y-modal-backdrop');
      if (closeBtn) {
        closeModal();
        return;
      }

      const actionBtn = e.target.closest('[data-a11y-action]');
      if (actionBtn) {
        handleAction(actionBtn.dataset.a11yAction, actionBtn.dataset.a11yValue);
      }
    });
  }

  function handleAction(action, value) {
    if (action === 'text-size') {
      settings.textSize = value;
    } else if (action === 'dyslexia') {
      settings.dyslexiaFont = !settings.dyslexiaFont;
    } else if (action === 'contrast') {
      settings.highContrast = !settings.highContrast;
    } else if (action === 'calm') {
      settings.sensoryCalm = !settings.sensoryCalm;
    } else if (action === 'motion') {
      settings.reducedMotion = !settings.reducedMotion;
    } else if (action === 'narration') {
      settings.narration = !settings.narration;
    }

    applySettings();
    saveSettings();
  }

  function openModal() {
    let modal = document.getElementById('a11y-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'a11y-modal';
      modal.className = 'a11y-modal';
      modal.innerHTML = `
        <div class="a11y-modal-backdrop"></div>
        <div class="a11y-panel" role="dialog" aria-label="Accessibility Settings">
          <div class="a11y-header">
            <h3>♿ Accessibility & Sensory Tools</h3>
            <button class="btn-icon" id="close-a11y-btn" aria-label="Close settings">✕</button>
          </div>
          
          <div class="a11y-section">
            <div class="a11y-section-title"><span>🔤</span> Text Size</div>
            <div class="a11y-toggle-group">
              <button class="a11y-btn" data-a11y-action="text-size" data-a11y-value="text-sm">Standard (14px)</button>
              <button class="a11y-btn" data-a11y-action="text-size" data-a11y-value="text-md">Medium (16px)</button>
              <button class="a11y-btn" data-a11y-action="text-size" data-a11y-value="text-lg">Large (19px)</button>
              <button class="a11y-btn" data-a11y-action="text-size" data-a11y-value="text-xl">Extra Large (22px)</button>
            </div>
          </div>

          <div class="a11y-section">
            <div class="a11y-section-title"><span>📖</span> Reading & Visual Comfort</div>
            <div class="a11y-toggle-group">
              <button class="a11y-btn" data-a11y-action="dyslexia">
                <span>🔡</span> Dyslexia Font
              </button>
              <button class="a11y-btn" data-a11y-action="contrast">
                <span>🌓</span> High Contrast
              </button>
              <button class="a11y-btn" data-a11y-action="calm">
                <span>🕊️</span> Sensory Calm
              </button>
              <button class="a11y-btn" data-a11y-action="motion">
                <span>🛑</span> Reduce Motion
              </button>
            </div>
          </div>

          <div class="a11y-section">
            <div class="a11y-section-title"><span>🔊</span> Voice & Audio Narration</div>
            <div class="a11y-toggle-group">
              <button class="a11y-btn" data-a11y-action="narration">
                <span>🗣️</span> Voice Narration On/Off
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    updateUIControls();
    modal.classList.add('active');
  }

  function closeModal() {
    const modal = document.getElementById('a11y-modal');
    if (modal) modal.classList.remove('active');
  }

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    openModal,
    closeModal,
    getSettings: () => ({ ...settings })
  };
})();
