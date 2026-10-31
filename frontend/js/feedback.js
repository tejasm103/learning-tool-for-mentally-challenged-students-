/**
 * MINDVERSE — INCLUSIVE LEARNING LAB
 * Community Feedback Modal System (Google Form & Quick In-App)
 */

(function() {
  'use strict';

  // Inject Styles for Feedback Trigger & Modal
  const style = document.createElement('style');
  style.id = 'mv-feedback-styles';
  style.textContent = `
    .mv-feedback-trigger {
      position: fixed;
      bottom: 74px;
      right: 24px;
      z-index: 9998;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #0f172a;
      font-weight: 800;
      font-size: 0.95rem;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-radius: 9999px;
      padding: 0.65rem 1.25rem;
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
    }
    .mv-feedback-trigger:hover {
      transform: translateY(-3px) scale(1.03);
      box-shadow: 0 12px 28px rgba(245, 158, 11, 0.6);
      background: linear-gradient(135deg, #fbbf24 0%, #b45309 100%);
    }
    .mv-feedback-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(10, 15, 30, 0.85);
      backdrop-filter: blur(8px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    .mv-feedback-modal-backdrop.active {
      opacity: 1;
      pointer-events: auto;
    }
    .mv-feedback-modal {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      width: 100%;
      max-width: 580px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 2rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      color: #f8fafc;
      transform: translateY(20px) scale(0.97);
      transition: all 0.25s ease;
    }
    .mv-feedback-modal-backdrop.active .mv-feedback-modal {
      transform: translateY(0) scale(1);
    }
    .mv-star-rating {
      display: flex;
      gap: 0.5rem;
      margin: 0.5rem 0 1rem;
    }
    .mv-star-btn {
      background: none;
      border: none;
      font-size: 1.8rem;
      cursor: pointer;
      color: #475569;
      transition: transform 0.15s, color 0.15s;
    }
    .mv-star-btn.active, .mv-star-btn:hover {
      color: #fbbf24;
      transform: scale(1.2);
    }
    .mv-field-group {
      margin-bottom: 1.25rem;
    }
    .mv-field-group label {
      display: block;
      font-size: 0.9rem;
      font-weight: 700;
      margin-bottom: 0.4rem;
      color: #94a3b8;
    }
    .mv-input, .mv-select, .mv-textarea {
      width: 100%;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 10px;
      padding: 0.75rem 1rem;
      color: #fff;
      font-family: inherit;
      font-size: 0.95rem;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.2s;
    }
    .mv-input:focus, .mv-select:focus, .mv-textarea:focus {
      border-color: #38bdf8;
      box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
    }
  `;
  document.head.appendChild(style);

  function createModal() {
    if (document.getElementById('mv-feedback-modal-container')) return;

    const container = document.createElement('div');
    container.id = 'mv-feedback-modal-container';
    container.innerHTML = `
      <!-- Floating Trigger Button -->
      <button id="mv-feedback-btn" class="mv-feedback-trigger" title="Give Feedback">
        <span>📋</span>
        <span>Feedback</span>
      </button>

      <!-- Modal Backdrop -->
      <div id="mv-feedback-backdrop" class="mv-feedback-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="mv-modal-title">
        <div class="mv-feedback-modal" style="max-width: 680px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div>
              <div style="display: inline-block; background: rgba(245, 158, 11, 0.2); color: #fbbf24; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem;">
                MindVerse Community
              </div>
              <h2 id="mv-modal-title" style="margin: 0; font-size: 1.5rem; font-weight: 800; color: #fff;">
                📋 Feedback
              </h2>
              <p style="margin: 0.4rem 0 0; color: #94a3b8; font-size: 0.9rem;">
                We appreciate your feedback and suggestions to make MindVerse better for all learners!
              </p>
            </div>
            <button id="mv-feedback-close" style="background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; padding: 0.25rem;" aria-label="Close feedback modal">✖</button>
          </div>

          <!-- Official Google Form Highlight Card -->
          <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(59, 130, 246, 0.15)); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 12px; padding: 0.85rem 1.15rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <div>
              <div style="font-weight: 800; color: #fff; font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem;">
                <span>📋</span> Official Google Feedback Form
              </div>
              <div style="font-size: 0.8rem; color: #cbd5e1; margin-top: 0.15rem;">
                Submit your feedback directly through our official Google Form.
              </div>
            </div>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSfb-2O-TEctAq7829dByeEHdkf_Xn2EbVHKvghs1v46WKe1xA/viewform?usp=publish-editor" target="_blank" rel="noopener noreferrer" class="btn btn-accent" style="padding: 0.5rem 1rem; font-size: 0.85rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem; white-space: nowrap; font-weight: 800;">
              <span>📝</span> Open Full Form ↗
            </a>
          </div>

          <!-- Mode Switcher Tabs: Google Form is Main -->
          <div style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.75rem;">
            <button type="button" id="tab-btn-gform" style="background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #fbbf24; font-weight: 800; padding: 0.45rem 1rem; border-radius: 8px; cursor: pointer;">
              📋 Official Google Form (Main)
            </button>
            <button type="button" id="tab-btn-quick" style="background: transparent; border: 1px solid #475569; color: #94a3b8; font-weight: 700; padding: 0.45rem 1rem; border-radius: 8px; cursor: pointer;">
              ⚡ Quick In-App Form
            </button>
          </div>

          <!-- Google Form Embedded Container (Primary View) -->
          <div id="mv-gform-container" style="display: block; margin-bottom: 1rem;">
            <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSfb-2O-TEctAq7829dByeEHdkf_Xn2EbVHKvghs1v46WKe1xA/viewform?embedded=true" width="100%" height="480" frameborder="0" marginheight="0" marginwidth="0" style="border-radius: 10px; background: #fff; width: 100%;">
              Loading Google Feedback Form…
            </iframe>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.6rem; flex-wrap: wrap; gap: 0.5rem;">
              <span style="font-size: 0.8rem; color: #94a3b8;">Direct form responses saved securely</span>
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSfb-2O-TEctAq7829dByeEHdkf_Xn2EbVHKvghs1v46WKe1xA/viewform?usp=publish-editor" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; font-size: 0.85rem; text-decoration: underline;">
                Open Google Form in a new tab ↗
              </a>
            </div>
          </div>

          <form id="mv-feedback-form" style="display: none;">
            <!-- Category Picker -->
            <div class="mv-field-group">
              <label for="mv-category-select">Feedback Category</label>
              <select id="mv-category-select" class="mv-select" required>
                <option value="General Feedback & Suggestions" selected>💡 General Feedback & Suggestions</option>
                <option value="Teaching Sound & Voice Narration">🔊 Teaching Sound & Voice (Volume, Pronunciation, Pace)</option>
                <option value="Curriculum & Lessons">📚 Curriculum & Lessons (New topics, stories, worksheets)</option>
                <option value="YouTube Video Library & Shorts">🎥 YouTube Video Library & Shorts (Player, subtitles, captions)</option>
                <option value="3D Classroom & Visuals">🪐 3D Classroom & Visuals (Sensory calm, colors, desks)</option>
                <option value="Mini-Games & Interactive Quizzes">🎮 Mini-Games & Quizzes (Puzzles, stars, reward chimes)</option>
                <option value="Accessibility & Special Needs">♿ Accessibility & Special Needs (Dyslexia font, contrast)</option>
              </select>
            </div>

            <!-- Star Rating -->
            <div class="mv-field-group">
              <label>How is your overall experience so far?</label>
              <div class="mv-star-rating" id="mv-star-container">
                <button type="button" class="mv-star-btn active" data-rating="1" aria-label="1 star">★</button>
                <button type="button" class="mv-star-btn active" data-rating="2" aria-label="2 stars">★</button>
                <button type="button" class="mv-star-btn active" data-rating="3" aria-label="3 stars">★</button>
                <button type="button" class="mv-star-btn active" data-rating="4" aria-label="4 stars">★</button>
                <button type="button" class="mv-star-btn active" data-rating="5" aria-label="5 stars">★</button>
              </div>
              <input type="hidden" id="mv-rating-val" value="5">
            </div>

            <!-- Feedback Field -->
            <div class="mv-field-group">
              <label for="mv-feedback-text">Your Feedback & Suggestions <span style="color: #ef4444;">*</span></label>
              <textarea id="mv-feedback-text" class="mv-textarea" rows="4" required placeholder="Share your experience, thoughts, and suggestions for MindVerse..." minlength="3"></textarea>
            </div>

            <!-- Role and User Information -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
              <div>
                <label for="mv-role-select" style="display: block; font-size: 0.9rem; font-weight: 700; margin-bottom: 0.4rem; color: #94a3b8;">Your Role</label>
                <select id="mv-role-select" class="mv-select">
                  <option value="student">Student Learner 🎒</option>
                  <option value="teacher">Educator / Teacher 👩‍🏫</option>
                  <option value="caregiver">Parent / Caregiver 🏡</option>
                  <option value="visitor" selected>Visitor / Explorer 🚀</option>
                </select>
              </div>
              <div>
                <label for="mv-user-name" style="display: block; font-size: 0.9rem; font-weight: 700; margin-bottom: 0.4rem; color: #94a3b8;">Your Name / Nickname</label>
                <input type="text" id="mv-user-name" class="mv-input" placeholder="e.g. Aarav, Teacher Maya">
              </div>
            </div>

            <div class="mv-field-group">
              <label for="mv-email-input">Email (Optional, if you'd like an update on your idea):</label>
              <input type="email" id="mv-email-input" class="mv-input" placeholder="you@example.com">
            </div>

            <div id="mv-feedback-msg" style="display: none; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem;"></div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
              <button type="button" id="mv-cancel-btn" style="background: transparent; border: 1px solid #475569; color: #94a3b8; padding: 0.75rem 1.25rem; border-radius: 10px; cursor: pointer; font-weight: 600;">Cancel</button>
              <button type="submit" id="mv-submit-btn" style="background: linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%); color: #0f172a; font-weight: 800; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem;">
                <span>🚀</span> Send Feedback
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Event Listeners
    const btn = document.getElementById('mv-feedback-btn');
    const backdrop = document.getElementById('mv-feedback-backdrop');
    const closeBtn = document.getElementById('mv-feedback-close');
    const cancelBtn = document.getElementById('mv-cancel-btn');
    const form = document.getElementById('mv-feedback-form');
    const starBtns = document.querySelectorAll('.mv-star-btn');
    const ratingInput = document.getElementById('mv-rating-val');
    const msgBox = document.getElementById('mv-feedback-msg');

    function openModal() {
      backdrop.classList.add('active');
      document.getElementById('mv-feedback-text').focus();
    }

    function closeModal() {
      backdrop.classList.remove('active');
      msgBox.style.display = 'none';
    }

    btn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.classList.contains('active')) {
        closeModal();
      }
    });

    // Tab switching between Quick Form and Google Form
    const tabQuick = document.getElementById('tab-btn-quick');
    const tabGForm = document.getElementById('tab-btn-gform');
    const gformContainer = document.getElementById('mv-gform-container');

    tabQuick.addEventListener('click', () => {
      form.style.display = 'block';
      gformContainer.style.display = 'none';
      tabQuick.style.background = 'rgba(0, 240, 255, 0.15)';
      tabQuick.style.borderColor = 'var(--border-glow)';
      tabQuick.style.color = '#00f0ff';
      tabGForm.style.background = 'transparent';
      tabGForm.style.borderColor = '#475569';
      tabGForm.style.color = '#94a3b8';
    });

    tabGForm.addEventListener('click', () => {
      form.style.display = 'none';
      gformContainer.style.display = 'block';
      tabGForm.style.background = 'rgba(245, 158, 11, 0.2)';
      tabGForm.style.borderColor = '#f59e0b';
      tabGForm.style.color = '#fbbf24';
      tabQuick.style.background = 'transparent';
      tabQuick.style.borderColor = '#475569';
      tabQuick.style.color = '#94a3b8';
    });

    // Star rating interactions
    starBtns.forEach(star => {
      star.addEventListener('click', () => {
        const rating = parseInt(star.getAttribute('data-rating'), 10);
        ratingInput.value = rating;
        starBtns.forEach(s => {
          const r = parseInt(s.getAttribute('data-rating'), 10);
          if (r <= rating) {
            s.classList.add('active');
          } else {
            s.classList.remove('active');
          }
        });
      });
    });

    // Pre-fill user if logged in
    if (window.MindVerseAPI && typeof window.MindVerseAPI.getCurrentUser === 'function') {
      window.MindVerseAPI.getCurrentUser().then(res => {
        if (res && res.user) {
          const nameInput = document.getElementById('mv-user-name');
          const roleSelect = document.getElementById('mv-role-select');
          if (nameInput) nameInput.value = res.user.display_name || '';
          if (roleSelect && res.user.role) roleSelect.value = res.user.role;
        }
      }).catch(() => {});
    }

    // Form Submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('mv-submit-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳</span> Sending...';

      const payload = {
        category: document.getElementById('mv-category-select').value,
        rating: parseInt(ratingInput.value, 10) || 5,
        what_to_change: document.getElementById('mv-feedback-text').value.trim(),
        role: document.getElementById('mv-role-select').value,
        user_name: document.getElementById('mv-user-name').value.trim() || 'Curious Learner',
        email: document.getElementById('mv-email-input').value.trim() || null
      };

      try {
        let result;
        if (window.MindVerseAPI && typeof window.MindVerseAPI.submitFeedback === 'function') {
          result = await window.MindVerseAPI.submitFeedback(payload);
        } else {
          const res = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          result = await res.json();
        }

        // Play auditory reward chime
        if (window.MindVerseSpeech && typeof window.MindVerseSpeech.playRewardSound === 'function') {
          window.MindVerseSpeech.playRewardSound();
        } else if (window.MindVerseSpeech && typeof window.MindVerseSpeech.playTeacherChime === 'function') {
          window.MindVerseSpeech.playTeacherChime();
        }

        msgBox.style.display = 'block';
        msgBox.style.background = 'rgba(16, 185, 129, 0.2)';
        msgBox.style.color = '#34d399';
        msgBox.style.border = '1px solid rgba(16, 185, 129, 0.4)';
        msgBox.innerHTML = `
          <strong>🎉 Thank you, ${escapeHtml(payload.user_name)}!</strong><br>
          Your idea has been recorded! ${result.mongo_synced ? 'Synced to Cloud MongoDB Atlas.' : 'Saved to MindVerse Learning Lab database.'} Our education team reviews all ideas.
        `;

        form.reset();
        ratingInput.value = 5;
        starBtns.forEach(s => s.classList.add('active'));

        setTimeout(() => {
          closeModal();
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>🚀</span> Send Feedback';
        }, 2200);

      } catch (err) {
        msgBox.style.display = 'block';
        msgBox.style.background = 'rgba(239, 68, 68, 0.2)';
        msgBox.style.color = '#f87171';
        msgBox.style.border = '1px solid rgba(239, 68, 68, 0.4)';
        msgBox.textContent = `Error: ${err.message || 'Could not submit feedback. Please try again.'}`;
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>🚀</span> Send Feedback';
      }
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createModal);
  } else {
    createModal();
  }

  window.openMindVerseFeedback = function() {
    const backdrop = document.getElementById('mv-feedback-backdrop');
    if (backdrop) backdrop.classList.add('active');
  };
})();

