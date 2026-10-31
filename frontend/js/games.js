/**
 * MINDVERSE — INCLUSIVE LEARNING LAB
 * Top 30 Educational Games Engine & Interactive Activities
 */

const MindVerseGames = (function() {
  // Web Audio Tone Synthesizer for Zero-Latency Sound Effects
  function playSynthTone(freq = 440, duration = 0.25, type = 'sine') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // AudioContext fallback
    }
  }

  // Confetti Particle System
  function fireConfetti() {
    let canvas = document.getElementById('confetti-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'confetti-canvas';
      document.body.appendChild(canvas);
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    
    const colors = ['#00f0ff', '#10b981', '#fbbf24', '#f43f5e', '#a855f7', '#38bdf8'];
    const particles = Array.from({ length: 65 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -100,
      size: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3 + 2.5,
      speedX: (Math.random() - 0.5) * 3,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10
    }));

    let animationFrame;
    const start = Date.now();

    function update() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let allFallen = true;

      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;

        if (p.y < canvas.height) allFallen = false;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
        ctx.restore();
      });

      if (!allFallen && Date.now() - start < 3500) {
        animationFrame = requestAnimationFrame(update);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationFrame);
      }
    }

    update();
  }

  // Active Global State
  let currentStreak = 0;
  let isZenMode = false;
  let activeGameId = 'alphabet_adventure';

  // MindBot Hints for all 30 games
  const GAME_HINTS = {
    'alphabet_adventure': "Look at the letter shapes. Capital A has two tall diagonal lines, and lowercase a has a little round belly!",
    'number_catcher': "Count the apples one by one as they fall. Take your time, there is no hurry!",
    'shape_puzzle': "Notice the edges! A square has 4 straight sides, while a circle is completely smooth and round.",
    'animal_memory': "Try remembering the position of one animal at a time, like where the lion or dolphin was hiding.",
    'color_sorting': "Match by colors! Strawberries and apples are bright red, and leaves are green.",
    'sound_picture_match': "Click 'Listen Again' to hear the word clearly, then find the image that matches it.",
    'jigsaw_builder': "Start by finding the top-left tile of the smiling sun, then swap its neighbors into place.",
    'mini_supermarket': "Check your shopping list on the left! We need milk, bread, and crunchy apples.",
    'daily_routine': "Think about how your morning begins: first we wake up, then brush our teeth!",
    'emotion_explorer': "When feelings feel too big or stormy, taking 3 slow deep breaths helps our mind feel calm.",
    'road_safety': "Red means stop completely and wait. When the walking signal turns green, we can cross safely!",
    'animal_home_finder': "Think about where each friend sleeps! Dolphins swim in the ocean, and birds rest in nests.",
    'music_rhythm': "Try tapping from red C all the way up to pink C to hear the complete musical scale!",
    'magic_garden': "Plants need four things: soil, seeds, cool fresh water, and warm golden sunshine.",
    'little_chef': "Start with the bottom slice of bread, layer lettuce and tomato, then top it with the second bread slice!",
    'time_clock': "Morning hours like 8:00 AM are breakfast time, and 8:00 PM is for evening bedtime.",
    'fruit_math_market': "Count all the fruits in the first basket, then keep counting up with the second basket!",
    'interactive_story_world': "There are no wrong choices! Follow your curiosity and see where Pip's adventure takes you.",
    'letter_tracing': "Start at the very top of the letter and follow the dashed arrow lines downwards smoothly.",
    'word_builder': "Cat starts with the 'Cuh' sound for C, then 'Aa' for A, and ends with 'Tuh' for T.",
    'weather_explorer': "When rain clouds appear, we open our umbrella and put on our boots to stay dry.",
    'clean_planet': "Food scraps like apple cores and banana peels go into the green Compost bin to help plants grow.",
    'find_in_classroom': "Scan the classroom gently with your eyes from top to bottom to spot the yellow pencil.",
    'friendly_maze': "Look ahead a few steps to check which path is open before moving Bear towards the gold trophy.",
    'pop_and_discover': "Tap each floating yellow star to pop it! Let other shapes float safely by.",
    'everyday_matcher': "Which items belong together? Shoes need warm socks, and toothbrushes need minty toothpaste.",
    'virtual_pet_care': "Puppy loves being cared for! Start by feeding crunchy food, then give a bowl of fresh water.",
    'community_helpers': "Doctors help heal people in hospitals, and brave firefighters drive bright red fire engines.",
    'direction_detective': "Listen carefully: 'Up' goes toward the top of the screen, and 'Right' goes towards your right hand.",
    'my_learning_adventure': "Every island is a fun world! Pick any island to review your skills and collect stars."
  };

  function triggerMindBotHint() {
    const hint = GAME_HINTS[activeGameId] || "Take your time! You are doing fantastic, keep exploring!";
    const hintBubble = document.getElementById('arena-hint-bubble');
    const hintText = document.getElementById('arena-hint-text');

    if (hintBubble && hintText) {
      hintText.textContent = hint;
      hintBubble.style.display = 'flex';
      hintBubble.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    playSynthTone(523.25, 0.2);
    if (typeof MindVerseAudio !== 'undefined') {
      MindVerseAudio.speak(hint);
    }
  }

  // Celebration Modal
  function showCelebration(title, score, stars = 3, onRestart = null) {
    if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.playSuccessSound();
    fireConfetti();

    // Increment streak
    currentStreak++;
    const streakEl = document.getElementById('arena-streak-val');
    if (streakEl) streakEl.textContent = `${currentStreak} Streak 🔥`;

    let overlay = document.getElementById('celebration-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'celebration-overlay';
      overlay.className = 'celebration-overlay';
      document.body.appendChild(overlay);
    }

    const starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    const bonusMessage = currentStreak >= 3 ? `<div style="background:rgba(251,191,36,0.2); border:1px solid #fbbf24; border-radius:var(--radius-md); padding:0.5rem; margin-bottom:1rem; color:#fbbf24; font-weight:700;">🔥 ${currentStreak}x Victory Streak! 2x Star Bonus!</div>` : '';

    overlay.innerHTML = `
      <div class="celebration-card">
        <h2 style="font-size:2rem; color:var(--primary); margin-bottom:0.5rem;">🎉 Fantastic Work!</h2>
        <h3 style="color:#fff; font-size:1.4rem; margin-bottom:0.75rem;">${title}</h3>
        ${bonusMessage}
        <div class="star-rating">${starStr}</div>
        <p style="font-size:1.15rem; color:var(--text-muted); margin-bottom:1.5rem;">Score: <strong style="color:var(--primary); font-size:1.4rem;">${score}</strong> Points</p>
        <div style="display:flex; justify-content:center; gap:1rem;">
          <button class="btn btn-secondary" id="celebrate-close-btn">Close</button>
          <button class="btn btn-primary" id="celebrate-replay-btn">Play Again</button>
        </div>
      </div>
    `;

    overlay.classList.add('active');

    document.getElementById('celebrate-close-btn').onclick = () => overlay.classList.remove('active');
    document.getElementById('celebrate-replay-btn').onclick = () => {
      overlay.classList.remove('active');
      if (onRestart) onRestart();
    };
  }

  function saveGameProgress(gameId, score, stars, timeSpent = 45) {
    if (typeof MindVerseAPI !== 'undefined') {
      MindVerseAPI.saveGameResult(gameId, score, stars, timeSpent);
    }
  }

  // =========================================================================
  // 1. ALPHABET ADVENTURE (Match uppercase with lowercase & phonics)
  // =========================================================================
  function initAlphabetAdventure(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const letterPairs = [
      { upper: 'A', lower: 'a', word: 'Apple', icon: '🍎' },
      { upper: 'B', lower: 'b', word: 'Ball', icon: '⚽' },
      { upper: 'C', lower: 'c', word: 'Cat', icon: '🐱' },
      { upper: 'D', lower: 'd', word: 'Duck', icon: '🦆' }
    ];

    let selectedUpper = null;
    let matches = 0;
    let score = 0;

    const uppers = [...letterPairs].sort(() => Math.random() - 0.5);
    const lowers = [...letterPairs].sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div class="game-hud">
        <div class="hud-stat"><span>Letters Matched:</span> <span id="aa-count">0</span> / 4</div>
        <div class="hud-stat"><span>Score:</span> <span id="aa-score">0</span></div>
        <button class="btn btn-secondary" id="aa-reset-btn">🔄 Reset</button>
      </div>
      <p style="color:var(--text-muted); margin-bottom:1rem;">Click a capital letter on the left, then find its lowercase partner on the right!</p>
      <div class="matching-board">
        <div class="matching-col" id="aa-left"></div>
        <div class="matching-col" id="aa-right"></div>
      </div>
    `;

    const leftCol = document.getElementById('aa-left');
    const rightCol = document.getElementById('aa-right');

    uppers.forEach(item => {
      const el = document.createElement('div');
      el.className = 'matching-item';
      el.innerHTML = `<span style="font-size:2.4rem; font-weight:800; color:var(--primary);">${item.upper}</span> <span>Capital</span>`;
      el.onclick = () => {
        if (el.classList.contains('matched')) return;
        playSynthTone(440, 0.15);
        if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.speak(`Capital ${item.upper}`);
        leftCol.querySelectorAll('.matching-item').forEach(x => x.classList.remove('selected'));
        el.classList.add('selected');
        selectedUpper = { el, item };
      };
      leftCol.appendChild(el);
    });

    lowers.forEach(item => {
      const el = document.createElement('div');
      el.className = 'matching-item';
      el.innerHTML = `<span style="font-size:2.4rem; font-weight:800; color:#fbbf24;">${item.lower}</span> <span>${item.icon} ${item.word}</span>`;
      el.onclick = () => {
        if (el.classList.contains('matched') || !selectedUpper) return;

        if (selectedUpper.item.upper === item.upper) {
          el.classList.add('matched');
          selectedUpper.el.classList.add('matched');
          selectedUpper.el.classList.remove('selected');
          matches++;
          score += 25;
          document.getElementById('aa-count').textContent = matches;
          document.getElementById('aa-score').textContent = score;

          playSynthTone(587, 0.2);
          if (typeof MindVerseAudio !== 'undefined') {
            MindVerseAudio.playStarSound();
            MindVerseAudio.speak(`Great! ${item.upper} and ${item.lower} for ${item.word}!`);
          }

          if (matches === letterPairs.length) {
            saveGameProgress('alphabet_adventure', score, 3);
            showCelebration('Alphabet Adventure Mastered!', score, 3, () => initAlphabetAdventure(containerId));
          }
        } else {
          playSynthTone(220, 0.25, 'sawtooth');
          selectedUpper.el.classList.remove('selected');
          if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.playGentleTryAgain();
        }
        selectedUpper = null;
      };
      rightCol.appendChild(el);
    });

    document.getElementById('aa-reset-btn').onclick = () => initAlphabetAdventure(containerId);
  }

  // =========================================================================
  // 2. NUMBER CATCHER (Catch/count items into basket)
  // =========================================================================
  function initNumberCatcher(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const targetCount = Math.floor(Math.random() * 4) + 3; // 3 to 6
    let caughtCount = 0;
    const basketSvg = (typeof GameGraphics !== 'undefined') ? GameGraphics.basket(200) : '<div style="font-size:4rem;">🧺</div>';

    container.innerHTML = `
      <div class="game-hud">
        <div class="hud-stat"><span>Target:</span> <strong style="color:var(--primary); font-size:1.2rem;">Catch ${targetCount} Apples</strong></div>
        <div class="hud-stat"><span>In Basket:</span> <span id="nc-caught">0</span> / ${targetCount}</div>
        <button class="btn btn-secondary" id="nc-reset-btn">🔄 New Number</button>
      </div>
      <p style="color:var(--text-muted); margin-bottom:1rem;">Click each falling apple from the orchard tree to harvest into the woven basket!</p>
      <div style="display:grid; grid-template-columns: 1fr 280px; gap:2rem; align-items:center;">
        <div id="nc-tree-area" style="background:radial-gradient(circle at 50% 30%, #173820, #091a10 70%); border:2px solid var(--border-glow); border-radius:var(--radius-xl); height:330px; position:relative; overflow:hidden; display:flex; flex-wrap:wrap; align-content:space-around; justify-content:space-around; padding:1.5rem; box-shadow:inset 0 0 40px rgba(0,0,0,0.6);"></div>
        <div style="background:linear-gradient(180deg, #1e293b, #0f172a); border-radius:var(--radius-xl); padding:1.5rem 1rem; text-align:center; border:2px solid var(--border-glow); box-shadow:0 15px 30px rgba(0,0,0,0.6);">
          <div style="display:flex; justify-content:center; margin-bottom:0.5rem;">${basketSvg}</div>
          <h3 style="color:#fff; font-size:1.2rem; margin-top:0.5rem;">Orchard Basket</h3>
          <div id="nc-basket-contents" style="min-height:50px; display:flex; flex-wrap:wrap; justify-content:center; gap:0.25rem;"></div>
        </div>
      </div>
    `;

    const treeArea = document.getElementById('nc-tree-area');
    const basketArea = document.getElementById('nc-basket-contents');
    const appleGraphic = (typeof GameGraphics !== 'undefined') ? GameGraphics.apple(56) : '🍎';

    for (let i = 0; i < 8; i++) {
      const appleBtn = document.createElement('button');
      appleBtn.className = 'btn-icon';
      appleBtn.style.background = 'transparent';
      appleBtn.style.border = 'none';
      appleBtn.style.cursor = 'pointer';
      appleBtn.style.transition = 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      appleBtn.innerHTML = appleGraphic;
      appleBtn.title = 'Click to harvest apple';

      appleBtn.onmouseenter = () => appleBtn.style.transform = 'scale(1.15) rotate(5deg)';
      appleBtn.onmouseleave = () => appleBtn.style.transform = 'scale(1)';

      appleBtn.onclick = () => {
        if (caughtCount >= targetCount) return;
        appleBtn.style.visibility = 'hidden';
        caughtCount++;
        document.getElementById('nc-caught').textContent = caughtCount;

        const basketApple = document.createElement('span');
        basketApple.innerHTML = (typeof GameGraphics !== 'undefined') ? GameGraphics.apple(34) : '🍎';
        basketArea.appendChild(basketApple);

        playSynthTone(300 + caughtCount * 80, 0.15);
        if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.speak(`${caughtCount}`);

        if (caughtCount === targetCount) {
          setTimeout(() => {
            if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.speak(`Wonderful! Exactly ${targetCount} apples harvested!`);
            saveGameProgress('number_catcher', targetCount * 20, 3);
            showCelebration(`Harvested ${targetCount} Apples!`, targetCount * 20, 3, () => initNumberCatcher(containerId));
          }, 400);
        }
      };

      treeArea.appendChild(appleBtn);
    }

    if (typeof MindVerseAudio !== 'undefined') {
      MindVerseAudio.speak(`Can you catch ${targetCount} delicious apples?`);
    }

    document.getElementById('nc-reset-btn').onclick = () => initNumberCatcher(containerId);
  }

  // =========================================================================
  // 3. SHAPE PUZZLE WORLD (Drag / Click shapes into outlines)
  // =========================================================================
  function initShapePuzzle(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const shapes = [
      { name: 'Circle', shapeClass: 'shape-circle' },
      { name: 'Square', shapeClass: 'shape-square' },
      { name: 'Triangle', shapeClass: 'shape-triangle' },
      { name: 'Star', shapeClass: 'shape-star' }
    ];

    let selectedShape = null;
    let matched = 0;

    container.innerHTML = `
      <div class="game-hud">
        <div class="hud-stat"><span>Shapes Placed:</span> <span id="sp-count">0</span> / 4</div>
        <button class="btn btn-secondary" id="sp-reset-btn">🔄 Reset Shapes</button>
      </div>
      <p style="color:var(--text-muted); margin-bottom:1.5rem;">Click a 3D beveled shape from the tray, then click its matching recessed slot!</p>
      <div style="display:flex; justify-content:space-around; gap:1.5rem; flex-wrap:wrap; margin-bottom:2.5rem;" id="sp-targets-row">
        ${shapes.map(s => `
          <div class="sp-target" data-shape="${s.name}" style="width:125px; height:125px; border:3px dashed var(--border-light); border-radius:var(--radius-lg); display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; background:rgba(255,255,255,0.02); transition:all 0.3s ease; box-shadow:inset 0 4px 8px rgba(0,0,0,0.5);">
            <div class="sp-target-icon" style="opacity:0.25; filter:grayscale(1); transform:scale(0.85);">${(typeof GameGraphics !== 'undefined') ? GameGraphics.puzzleShape(s.name, 60) : s.name}</div>
            <span style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem; font-weight:700;">${s.name} Slot</span>
          </div>
        `).join('')}
      </div>

      <h4 style="color:#fff; margin-bottom:0.75rem;">Tactile Shape Tray</h4>
      <div style="display:flex; justify-content:center; gap:1.5rem; flex-wrap:wrap;" id="sp-tray-row">
        ${[...shapes].sort(() => Math.random() - 0.5).map(s => `
          <button class="sp-piece btn" data-shape="${s.name}" style="background:#1e293b; border:2px solid var(--border-glow); padding:0.75rem 1.25rem; border-radius:var(--radius-xl); cursor:pointer; display:flex; align-items:center; gap:0.75rem; box-shadow:0 8px 16px rgba(0,0,0,0.4); transition:transform 0.2s;">
            <div>${(typeof GameGraphics !== 'undefined') ? GameGraphics.puzzleShape(s.name, 56) : s.name}</div>
            <span style="font-size:1.1rem; color:#fff; font-weight:800;">${s.name}</span>
          </button>
        `).join('')}
      </div>
    `;

    const trayPieces = container.querySelectorAll('.sp-piece');
    const targetSlots = container.querySelectorAll('.sp-target');

    trayPieces.forEach(btn => {
      btn.onclick = () => {
        trayPieces.forEach(b => {
          b.style.borderColor = 'var(--border-glow)';
          b.style.transform = 'scale(1)';
        });
        btn.style.borderColor = 'var(--primary)';
        btn.style.transform = 'scale(1.08)';
        selectedShape = btn.dataset.shape;
        playSynthTone(400, 0.1);
        if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.speak(selectedShape);
      };
    });

    targetSlots.forEach(slot => {
      slot.onclick = () => {
        if (!selectedShape || slot.classList.contains('placed')) return;

        if (slot.dataset.shape === selectedShape) {
          slot.classList.add('placed');
          slot.style.border = '3px solid #10b981';
          slot.style.background = 'rgba(16,185,129,0.2)';
          const iconEl = slot.querySelector('.sp-target-icon');
          if (iconEl) {
            iconEl.style.opacity = '1';
            iconEl.style.filter = 'none';
            iconEl.style.transform = 'scale(1)';
          }

          const matchedBtn = Array.from(trayPieces).find(b => b.dataset.shape === selectedShape);
          if (matchedBtn) matchedBtn.style.display = 'none';

          matched++;
          document.getElementById('sp-count').textContent = matched;
          playSynthTone(600, 0.2);
          if (typeof MindVerseAudio !== 'undefined') {
            MindVerseAudio.playStarSound();
            MindVerseAudio.speak(`Correct! Placed the ${selectedShape}!`);
          }

          selectedShape = null;

          if (matched === shapes.length) {
            saveGameProgress('shape_puzzle', 100, 3);
            showCelebration('Shape World Complete!', 100, 3, () => initShapePuzzle(containerId));
          }
        } else {
          playSynthTone(220, 0.2, 'sawtooth');
          if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.playGentleTryAgain();
        }
      };
    });

    document.getElementById('sp-reset-btn').onclick = () => initShapePuzzle(containerId);
  }

  // =========================================================================
  // 4. ANIMAL MEMORY MATCH (Memory Card Pairs)
  // =========================================================================
  function initAnimalMemory(containerId, difficulty = 'easy') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const animals = [
      { id: 'lion', label: 'Lion', icon: '🦁' },
      { id: 'elephant', label: 'Elephant', icon: '🐘' },
      { id: 'dolphin', label: 'Dolphin', icon: '🐬' },
      { id: 'panda', label: 'Panda', icon: '🐼' },
      { id: 'rabbit', label: 'Rabbit', icon: '🐰' },
      { id: 'cat', label: 'Kitten', icon: '🐱' }
    ];

    const pairCount = (difficulty === 'easy') ? 4 : (difficulty === 'medium' ? 5 : 6);
    const chosen = animals.slice(0, pairCount);
    const deck = [...chosen, ...chosen].sort(() => Math.random() - 0.5);

    let flipped = [];
    let matched = 0;
    let moves = 0;

    container.innerHTML = `
      <div class="game-hud">
        <div class="hud-stat"><span>Matched:</span> <span id="am-matched">0</span> / ${pairCount}</div>
        <div class="hud-stat"><span>Moves:</span> <span id="am-moves">0</span></div>
        <button class="btn btn-secondary" id="am-reset-btn">🔄 Shuffle</button>
      </div>
      <div class="memory-grid" id="am-grid"></div>
    `;

    const grid = document.getElementById('am-grid');
    deck.forEach((card, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'memory-card';
      cardEl.innerHTML = `
        <div class="card-front">?</div>
        <div class="card-back">
          <div style="font-size:2.8rem;">${card.icon}</div>
          <div class="card-back-label">${card.label}</div>
        </div>
      `;

      cardEl.onclick = () => {
        if (flipped.length >= 2 || cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

        cardEl.classList.add('flipped');
        flipped.push({ cardEl, card });
        playSynthTone(450, 0.1);

        if (flipped.length === 2) {
          moves++;
          document.getElementById('am-moves').textContent = moves;
          const [c1, c2] = flipped;

          if (c1.card.id === c2.card.id) {
            setTimeout(() => {
              c1.cardEl.classList.add('matched');
              c2.cardEl.classList.add('matched');
              matched++;
              document.getElementById('am-matched').textContent = matched;
              if (typeof MindVerseAudio !== 'undefined') {
                MindVerseAudio.playStarSound();
                MindVerseAudio.speak(c1.card.label);
              }
              flipped = [];
              if (matched === pairCount) {
                saveGameProgress('animal_memory', 120, 3);
                showCelebration('Animal Memory Solved!', 120, 3, () => initAnimalMemory(containerId, difficulty));
              }
            }, 350);
          } else {
            setTimeout(() => {
              c1.cardEl.classList.remove('flipped');
              c2.cardEl.classList.remove('flipped');
              flipped = [];
            }, 900);
          }
        }
      };

      grid.appendChild(cardEl);
    });

    document.getElementById('am-reset-btn').onclick = () => initAnimalMemory(containerId, difficulty);
  }

  // =========================================================================
  // 5. COLOR SORTING GARDEN (Sort objects by color into flower beds)
  // =========================================================================
  function initColorSorting(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const items = [
      { name: 'Strawberry', color: 'red', icon: '🍓' },
      { name: 'Apple', color: 'red', icon: '🍎' },
      { name: 'Blueberry', color: 'blue', icon: '🫐' },
      { name: 'Ocean Wave', color: 'blue', icon: '🌊' },
      { name: 'Banana', color: 'yellow', icon: '🍌' },
      { name: 'Sun', color: 'yellow', icon: '☀️' },
      { name: 'Leaf', color: 'green', icon: '🍃' },
      { name: 'Frog', color: 'green', icon: '🐸' }
    ].sort(() => Math.random() - 0.5);

    let activeItem = null;
    let sortedCount = 0;

    container.innerHTML = `
      <div class="game-hud">
        <div class="hud-stat"><span>Sorted:</span> <span id="cs-sorted">0</span> / ${items.length}</div>
        <button class="btn btn-secondary" id="cs-reset-btn">🔄 Reset Garden</button>
      </div>
      <p style="color:var(--text-muted); margin-bottom:1rem;">Click a colorful item below, then click its matching color garden bed!</p>

      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:1rem; margin-bottom:2rem;">
        <div class="cs-bed" data-color="red" style="background:rgba(239,68,68,0.15); border:2px solid #ef4444; border-radius:var(--radius-lg); padding:1rem; text-align:center; min-height:120px; cursor:pointer;">
          <h4 style="color:#ef4444; margin:0 0 0.5rem 0;">🔴 Red Bed</h4>
          <div class="cs-bed-items" style="font-size:1.8rem; display:flex; flex-wrap:wrap; justify-content:center; gap:0.25rem;"></div>
        </div>

        <div class="cs-bed" data-color="blue" style="background:rgba(59,130,246,0.15); border:2px solid #3b82f6; border-radius:var(--radius-lg); padding:1rem; text-align:center; min-height:120px; cursor:pointer;">
          <h4 style="color:#3b82f6; margin:0 0 0.5rem 0;">🔵 Blue Bed</h4>
          <div class="cs-bed-items" style="font-size:1.8rem; display:flex; flex-wrap:wrap; justify-content:center; gap:0.25rem;"></div>
        </div>

        <div class="cs-bed" data-color="yellow" style="background:rgba(234,179,8,0.15); border:2px solid #eab308; border-radius:var(--radius-lg); padding:1rem; text-align:center; min-height:120px; cursor:pointer;">
          <h4 style="color:#eab308; margin:0 0 0.5rem 0;">🟡 Yellow Bed</h4>
          <div class="cs-bed-items" style="font-size:1.8rem; display:flex; flex-wrap:wrap; justify-content:center; gap:0.25rem;"></div>
        </div>

        <div class="cs-bed" data-color="green" style="background:rgba(34,197,94,0.15); border:2px solid #22c55e; border-radius:var(--radius-lg); padding:1rem; text-align:center; min-height:120px; cursor:pointer;">
          <h4 style="color:#22c55e; margin:0 0 0.5rem 0;">🟢 Green Bed</h4>
          <div class="cs-bed-items" style="font-size:1.8rem; display:flex; flex-wrap:wrap; justify-content:center; gap:0.25rem;"></div>
        </div>
      </div>

      <div style="background:#0b1120; border-radius:var(--radius-lg); padding:1.25rem; border:1px solid var(--border-light); display:flex; gap:1rem; flex-wrap:wrap; justify-content:center;" id="cs-tray">
        ${items.map(it => `
          <button class="cs-item-btn btn" data-color="${it.color}" data-name="${it.name}" style="background:#1e293b; border:1px solid var(--border-light); font-size:2.2rem; padding:0.6rem 1rem; border-radius:var(--radius-md); cursor:pointer;">
            ${it.icon}
          </button>
        `).join('')}
      </div>
    `;

    const itemBtns = container.querySelectorAll('.cs-item-btn');
    const beds = container.querySelectorAll('.cs-bed');

    itemBtns.forEach(btn => {
      btn.onclick = () => {
        itemBtns.forEach(b => b.style.outline = 'none');
        btn.style.outline = '3px solid var(--primary)';
        activeItem = btn;
        playSynthTone(440, 0.1);
        if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.speak(`${btn.dataset.name}, ${btn.dataset.color}`);
      };
    });

    beds.forEach(bed => {
      bed.onclick = () => {
        if (!activeItem) return;

        if (bed.dataset.color === activeItem.dataset.color) {
          const iconSpan = document.createElement('span');
          iconSpan.textContent = activeItem.textContent.trim();
          bed.querySelector('.cs-bed-items').appendChild(iconSpan);

          activeItem.remove();
          activeItem = null;
          sortedCount++;
          document.getElementById('cs-sorted').textContent = sortedCount;

          playSynthTone(600, 0.15);
          if (typeof MindVerseAudio !== 'undefined') {
            MindVerseAudio.playStarSound();
            MindVerseAudio.speak(`Correct! Put in the ${bed.dataset.color} bed.`);
          }

          if (sortedCount === items.length) {
            saveGameProgress('color_sorting', 100, 3);
            showCelebration('Garden Sorted Beautifully!', 100, 3, () => initColorSorting(containerId));
          }
        } else {
          playSynthTone(200, 0.2, 'sawtooth');
          if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.playGentleTryAgain();
        }
      };
    });

    document.getElementById('cs-reset-btn').onclick = () => initColorSorting(containerId);
  }

  // =========================================================================
  // 6. SOUND AND PICTURE MATCH (Hear audio, tap picture)
  // =========================================================================
  function initSoundPictureMatch(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const questions = [
      { word: 'Elephant', options: [{ icon: '🐘', name: 'Elephant' }, { icon: '🐱', name: 'Cat' }, { icon: '🚗', name: 'Car' }] },
      { word: 'Guitar', options: [{ icon: '🎸', name: 'Guitar' }, { icon: '🍎', name: 'Apple' }, { icon: '⚽', name: 'Ball' }] },
      { word: 'Butterfly', options: [{ icon: '🦋', name: 'Butterfly' }, { icon: '🏠', name: 'House' }, { icon: '🍌', name: 'Banana' }] }
    ];

    let currentQIdx = 0;
    let score = 0;

    function renderRound() {
      const q = questions[currentQIdx];
      container.innerHTML = `
        <div class="game-hud">
          <div class="hud-stat"><span>Round:</span> ${currentQIdx + 1} / ${questions.length}</div>
          <div class="hud-stat"><span>Score:</span> <span id="spm-score">${score}</span></div>
          <button class="btn btn-secondary" id="spm-replay-btn">🔊 Listen Again</button>
        </div>

        <div style="text-align:center; margin:2rem 0;">
          <h2 style="font-size:1.8rem; color:#fff; margin-bottom:1rem;">Listen to the word:</h2>
          <button class="btn btn-primary btn-lg" id="spm-big-audio-btn" style="font-size:1.3rem; padding:1rem 2rem;">
            <span>🔊</span> Hear Word
          </button>
        </div>

        <div style="display:flex; justify-content:center; gap:2rem; flex-wrap:wrap;" id="spm-options-row">
          ${q.options.sort(() => Math.random() - 0.5).map(opt => `
            <button class="spm-opt-card btn" data-name="${opt.name}" style="background:#1e293b; border:2px solid var(--border-light); border-radius:var(--radius-xl); padding:2rem; width:150px; text-align:center; cursor:pointer; transition:var(--transition-normal);">
              <div style="font-size:4rem; margin-bottom:0.5rem;">${opt.icon}</div>
              <div style="font-weight:700; color:#fff; font-size:1.1rem;">${opt.name}</div>
            </button>
          `).join('')}
        </div>
      `;

      const playWord = () => {
        playSynthTone(500, 0.1);
        if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.speak(q.word);
      };

      document.getElementById('spm-big-audio-btn').onclick = playWord;
      document.getElementById('spm-replay-btn').onclick = playWord;

      setTimeout(playWord, 400);

      container.querySelectorAll('.spm-opt-card').forEach(card => {
        card.onclick = () => {
          if (card.dataset.name === q.word) {
            score += 35;
            document.getElementById('spm-score').textContent = score;
            card.style.borderColor = '#10b981';
            card.style.background = 'rgba(16,185,129,0.2)';

            if (typeof MindVerseAudio !== 'undefined') {
              MindVerseAudio.playStarSound();
              MindVerseAudio.speak(`Yes! That is the ${q.word}!`);
            }

            setTimeout(() => {
              currentQIdx++;
              if (currentQIdx < questions.length) {
                renderRound();
              } else {
                saveGameProgress('sound_picture_match', score, 3);
                showCelebration('Listening Master!', score, 3, () => initSoundPictureMatch(containerId));
              }
            }, 1000);
          } else {
            card.style.borderColor = '#ef4444';
            playSynthTone(220, 0.2, 'sawtooth');
            if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.playGentleTryAgain();
          }
        };
      });
    }

    renderRound();
  }

  // =========================================================================
  // 7. EASY JIGSAW BUILDER (2-4 piece puzzle)
  // =========================================================================
  function initJigsawBuilder(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const tiles = [
      { id: 1, label: 'Top Left (Sunrays)', icon: '☀️ Top-L', order: 0 },
      { id: 2, label: 'Top Right (Sky)', icon: '🌤️ Top-R', order: 1 },
      { id: 3, label: 'Bottom Left (Smile)', icon: '😊 Bottom-L', order: 2 },
      { id: 4, label: 'Bottom Right (Flowers)', icon: '🌻 Bottom-R', order: 3 }
    ];

    let currentOrder = [2, 0, 3, 1];

    function renderGrid() {
      container.innerHTML = `
        <div class="game-hud">
          <div class="hud-stat"><span>Picture:</span> Friendly Morning Sun ☀️</div>
          <button class="btn btn-secondary" id="jb-reset-btn">🔄 Scramble</button>
        </div>
        <p style="color:var(--text-muted); margin-bottom:1.5rem;">Click any two puzzle tiles to swap their positions until the sunny picture is complete!</p>

        <div style="display:grid; grid-template-columns: 180px 180px; gap:8px; justify-content:center; margin:1.5rem auto; max-width:380px;" id="jb-puzzle-board">
          ${currentOrder.map((tileIdx, slotIdx) => {
            const tile = tiles[tileIdx];
            return `
              <div class="jb-tile" data-slot="${slotIdx}" style="background:#1e293b; border:2px solid var(--border-glow); border-radius:var(--radius-md); height:120px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; user-select:none; transition:var(--transition-fast);">
                <div style="font-size:2.5rem;">${tile.icon.split(' ')[0]}</div>
                <div style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">${tile.icon.split(' ')[1]}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      let selectedSlot = null;
      container.querySelectorAll('.jb-tile').forEach(tileEl => {
        tileEl.onclick = () => {
          const slot = parseInt(tileEl.dataset.slot);
          playSynthTone(500, 0.1);

          if (selectedSlot === null) {
            selectedSlot = slot;
            tileEl.style.borderColor = 'var(--primary)';
            tileEl.style.boxShadow = '0 0 15px var(--primary-glow)';
          } else {
            const temp = currentOrder[selectedSlot];
            currentOrder[selectedSlot] = currentOrder[slot];
            currentOrder[slot] = temp;
            selectedSlot = null;
            renderGrid();

            const isSolved = currentOrder.every((val, idx) => val === idx);
            if (isSolved) {
              setTimeout(() => {
                saveGameProgress('jigsaw_builder', 100, 3);
                showCelebration('Jigsaw Puzzle Solved!', 100, 3, () => initJigsawBuilder(containerId));
              }, 300);
            }
          }
        };
      });

      document.getElementById('jb-reset-btn').onclick = () => initJigsawBuilder(containerId);
    }

    renderGrid();
  }

  // =========================================================================
  // 8. MINI SUPERMARKET (Shopping list & basket)
  // =========================================================================
  function initMiniSupermarket(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const shoppingList = [
      { name: 'Milk', icon: '🥛', price: 2 },
      { name: 'Bread', icon: '🍞', price: 1 },
      { name: 'Apples', icon: '🍎', price: 3 }
    ];

    const shelfItems = [
      { name: 'Milk', icon: '🥛' },
      { name: 'Candy', icon: '🍬' },
      { name: 'Bread', icon: '🍞' },
      { name: 'Carrot', icon: '🥕' },
      { name: 'Apples', icon: '🍎' },
      { name: 'Juice', icon: '🧃' }
    ].sort(() => Math.random() - 0.5);

    let cart = [];

    container.innerHTML = `
      <div class="game-hud">
        <div class="hud-stat"><span>Cart Items:</span> <span id="ms-cart-count">0</span> / 3</div>
        <button class="btn btn-secondary" id="ms-reset-btn">🔄 Clear Cart</button>
      </div>

      <div style="display:grid; grid-template-columns: 280px 1fr; gap:2rem;">
        <div style="background:#0f172a; border:2px solid var(--border-glow); border-radius:var(--radius-xl); padding:1.5rem;">
          <h3 style="color:var(--primary); font-size:1.2rem; margin-bottom:1rem;">📋 Shopping List</h3>
          <ul style="list-style:none; padding:0; display:flex; flex-direction:column; gap:0.75rem;">
            ${shoppingList.map(item => `
              <li id="ms-list-${item.name}" style="background:rgba(255,255,255,0.03); border:1px solid var(--border-light); padding:0.6rem 0.8rem; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
                <span>${item.icon} ${item.name}</span>
                <span class="ms-check" style="color:var(--text-muted);">⬜</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div>
          <h3 style="color:#fff; font-size:1.2rem; margin-bottom:1rem;">🏬 Market Shelves</h3>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:1rem;" id="ms-shelves">
            ${shelfItems.map(item => `
              <button class="ms-shelf-item btn" data-name="${item.name}" style="background:#1e293b; border:1px solid var(--border-light); padding:1rem 0.5rem; border-radius:var(--radius-lg); text-align:center; cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.5rem; transition:transform 0.2s;" onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">
                <div>${(typeof GameGraphics !== 'undefined') ? GameGraphics.supermarketProduct(item.name, 60) : item.icon}</div>
                <div style="color:#fff; font-weight:700; font-size:0.95rem;">${item.name}</div>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('.ms-shelf-item').forEach(btn => {
      btn.onclick = () => {
        const name = btn.dataset.name;
        const target = shoppingList.find(i => i.name === name);

        if (target && !cart.includes(name)) {
          cart.push(name);
          document.getElementById('ms-cart-count').textContent = cart.length;
          btn.style.opacity = '0.3';
          btn.disabled = true;

          const checkEl = document.getElementById(`ms-list-${name}`).querySelector('.ms-check');
          checkEl.textContent = '✅';
          checkEl.style.color = '#10b981';

          playSynthTone(550, 0.15);
          if (typeof MindVerseAudio !== 'undefined') {
            MindVerseAudio.playStarSound();
            MindVerseAudio.speak(`Added ${name} to basket!`);
          }

          if (cart.length === shoppingList.length) {
            saveGameProgress('mini_supermarket', 100, 3);
            showCelebration('Shopping Completed!', 100, 3, () => initMiniSupermarket(containerId));
          }
        } else if (!target) {
          playSynthTone(220, 0.2, 'sawtooth');
          if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.speak(`That is not on our shopping list.`);
        }
      };
    });

    document.getElementById('ms-reset-btn').onclick = () => initMiniSupermarket(containerId);
  }

  // =========================================================================
  // 9. DAILY ROUTINE BUILDER (Order routines in sequence)
  // =========================================================================
  function initDailyRoutine(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const steps = [
      { step: 1, title: 'Wake Up', icon: '🌅', desc: 'Stretch and welcome the morning' },
      { step: 2, title: 'Brush Teeth', icon: '🪥', desc: 'Brush teeth for 2 minutes' },
      { step: 3, title: 'Eat Breakfast', icon: '🥣', desc: 'Enjoy healthy morning meal' },
      { step: 4, title: 'Go to School', icon: '🎒', desc: 'Pack bag and walk cheerfully' }
    ];

    let currentOrder = [...steps].sort(() => Math.random() - 0.5);

    function renderRoutine() {
      container.innerHTML = `
        <div class="game-hud">
          <div class="hud-stat"><span>Daily Schedule:</span> Morning Routine</div>
          <button class="btn btn-secondary" id="dr-reset-btn">🔄 Shuffle</button>
        </div>
        <p style="color:var(--text-muted); margin-bottom:1.5rem;">Click two cards to swap them until they follow the morning from start to finish!</p>

        <div style="display:flex; justify-content:center; gap:1.25rem; flex-wrap:wrap; margin:1.5rem 0;" id="dr-cards-row">
          ${currentOrder.map((s, idx) => `
            <div class="dr-card" data-idx="${idx}" style="background:#1e293b; border:2px solid var(--border-light); border-radius:var(--radius-xl); padding:1.5rem 1rem; width:160px; text-align:center; cursor:pointer; transition:var(--transition-fast);">
              <div style="font-size:3.2rem; margin-bottom:0.5rem;">${s.icon}</div>
              <div style="font-size:1.1rem; font-weight:700; color:#fff; margin-bottom:0.25rem;">${s.title}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${s.desc}</div>
            </div>
          `).join('')}
        </div>
      `;

      let selectedSlot = null;
      container.querySelectorAll('.dr-card').forEach(cardEl => {
        cardEl.onclick = () => {
          const idx = parseInt(cardEl.dataset.idx);
          playSynthTone(480, 0.1);

          if (selectedSlot === null) {
            selectedSlot = idx;
            cardEl.style.borderColor = 'var(--primary)';
            cardEl.style.boxShadow = '0 0 15px var(--primary-glow)';
          } else {
            const temp = currentOrder[selectedSlot];
            currentOrder[selectedSlot] = currentOrder[idx];
            currentOrder[idx] = temp;
            selectedSlot = null;
            renderRoutine();

            const isCorrect = currentOrder.every((st, i) => st.step === i + 1);
            if (isCorrect) {
              setTimeout(() => {
                saveGameProgress('daily_routine', 100, 3);
                showCelebration('Morning Routine Mastered!', 100, 3, () => initDailyRoutine(containerId));
              }, 300);
            }
          }
        };
      });

      document.getElementById('dr-reset-btn').onclick = () => initDailyRoutine(containerId);
    }

    renderRoutine();
  }

  // =========================================================================
  // 10. EMOTION EXPLORER (Match emotions and calm strategies)
  // =========================================================================
  function initEmotionExplorer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scenarios = [
      {
        emotion: 'Happy',
        icon: '😊',
        scenario: 'Your friend shares their favorite toy with you.',
        goodChoice: 'Smile and say "Thank you for sharing!"'
      },
      {
        emotion: 'Overwhelmed',
        icon: '😣',
        scenario: 'The classroom is loud and there is lots of noise.',
        goodChoice: 'Put on headphones or ask teacher for a quiet sensory break.'
      },
      {
        emotion: 'Frustrated',
        icon: '😤',
        scenario: 'A puzzle piece is tricky and won\'t fit right away.',
        goodChoice: 'Take 3 deep breaths and try gently again.'
      }
    ];

    let currentIdx = 0;
    let score = 0;

    function renderRound() {
      const item = scenarios[currentIdx];
      container.innerHTML = `
        <div class="game-hud">
          <div class="hud-stat"><span>Scenario:</span> ${currentIdx + 1} / ${scenarios.length}</div>
          <div class="hud-stat"><span>Score:</span> <span id="ee-score">${score}</span></div>
        </div>

        <div style="background:#1e293b; border:1px solid var(--border-glow); border-radius:var(--radius-xl); padding:2rem; text-align:center; max-width:650px; margin:0 auto;">
          <div style="font-size:4.5rem; margin-bottom:1rem;">${item.icon}</div>
          <h2 style="color:var(--primary); font-size:1.6rem; margin-bottom:0.5rem;">Feeling: ${item.emotion}</h2>
          <p style="font-size:1.15rem; color:#fff; margin-bottom:2rem;">"${item.scenario}"</p>

          <h4 style="color:var(--text-muted); font-size:1rem; margin-bottom:1rem;">What is a helpful, healthy choice?</h4>
          <div style="display:flex; flex-direction:column; gap:0.75rem;" id="ee-choices">
            <button class="btn btn-secondary ee-btn" data-correct="true" style="padding:1rem; text-align:left; font-size:1.05rem;">
              ⭐ ${item.goodChoice}
            </button>
            <button class="btn btn-secondary ee-btn" data-correct="false" style="padding:1rem; text-align:left; font-size:1.05rem;">
              ❌ Yell loudly or throw the items
            </button>
          </div>
        </div>
      `;

      container.querySelectorAll('.ee-btn').forEach(btn => {
        btn.onclick = () => {
          if (btn.dataset.correct === 'true') {
            btn.style.background = 'rgba(16,185,129,0.25)';
            btn.style.borderColor = '#10b981';
            score += 40;
            document.getElementById('ee-score').textContent = score;

            if (typeof MindVerseAudio !== 'undefined') {
              MindVerseAudio.playStarSound();
              MindVerseAudio.speak(`Wonderful thoughtful choice!`);
            }

            setTimeout(() => {
              currentIdx++;
              if (currentIdx < scenarios.length) {
                renderRound();
              } else {
                saveGameProgress('emotion_explorer', score, 3);
                showCelebration('Kindness & Empathy Star!', score, 3, () => initEmotionExplorer(containerId));
              }
            }, 1000);
          } else {
            btn.style.background = 'rgba(239,68,68,0.2)';
            playSynthTone(200, 0.2, 'sawtooth');
            if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.speak('Let us choose a calmer, safer way.');
          }
        };
      });
    }

    renderRound();
  }

  // =========================================================================
  // 11. ROAD SAFETY ADVENTURE (Pedestrian crossing choices)
  // =========================================================================
  function initRoadSafety(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let light = 'red';

    function renderStreet() {
      const trafficLightSvg = (typeof GameGraphics !== 'undefined') ? GameGraphics.trafficLight(light, 80) : `<div style="font-size:3rem;">🚦</div>`;
      const roadSvg = (typeof GameGraphics !== 'undefined') ? GameGraphics.roadCrossing(340, 150) : `<div style="height:120px; background:#334155;"></div>`;

      container.innerHTML = `
        <div class="game-hud">
          <div class="hud-stat"><span>Safety Mission:</span> Safe Street Crossing 🚦</div>
          <button class="btn btn-secondary" id="rs-reset-btn">🔄 Reset Street</button>
        </div>

        <div style="background:linear-gradient(135deg, #09101d, #141f36); border-radius:var(--radius-xl); padding:2rem; text-align:center; max-width:680px; margin:0 auto; border:2px solid var(--border-glow); box-shadow:0 15px 35px rgba(0,0,0,0.6);">
          <div style="display:flex; justify-content:center; align-items:center; gap:2.5rem; margin-bottom:1.5rem; flex-wrap:wrap;">
            <div id="rs-traffic-light-container" style="display:flex; justify-content:center;">
              ${trafficLightSvg}
            </div>

            <div style="display:flex; flex-direction:column; align-items:center;">
              <div id="rs-road-wrapper" style="position:relative; width:340px; height:150px; border-radius:16px; overflow:hidden;">
                ${roadSvg}
                <div id="rs-character" style="position:absolute; bottom:20px; left:25px; font-size:3.2rem; transition:transform 0.8s cubic-bezier(0.25, 1, 0.5, 1); filter:drop-shadow(0 4px 8px rgba(0,0,0,0.8));">🚶</div>
              </div>
              <h4 id="rs-status-text" style="color:${light === 'green' ? '#22c55e' : '#ef4444'}; margin-top:1rem; font-size:1.15rem; font-weight:800;">
                ${light === 'green' ? '🟢 GREEN SIGNAL: Cars Stopped! Safe to Walk!' : '🔴 RED SIGNAL: Traffic Moving! Stop and Wait!'}
              </h4>
            </div>
          </div>

          <div style="display:flex; justify-content:center; gap:1.25rem;">
            <button class="btn btn-primary btn-lg" id="rs-cross-btn" style="font-size:1.1rem; padding:0.8rem 1.8rem;">🚶 Cross Zebra Stripes</button>
            <button class="btn btn-secondary btn-lg" id="rs-toggle-light-btn" style="font-size:1.1rem; padding:0.8rem 1.8rem;">🚦 Push Pedestrian Button</button>
          </div>
        </div>
      `;

      const crossBtn = document.getElementById('rs-cross-btn');
      const toggleBtn = document.getElementById('rs-toggle-light-btn');
      const charEl = document.getElementById('rs-character');

      toggleBtn.onclick = () => {
        light = (light === 'red') ? 'green' : 'red';
        playSynthTone(520, 0.1);
        if (typeof MindVerseAudio !== 'undefined') {
          if (light === 'green') {
            MindVerseAudio.speak('Green light chime! The walking signal is on.');
          } else {
            MindVerseAudio.speak('Red light! Cars are driving.');
          }
        }
        renderStreet();
      };

      crossBtn.onclick = () => {
        if (light === 'green') {
          if (charEl) charEl.style.transform = 'translateX(240px)';
          playSynthTone(600, 0.2);
          if (typeof MindVerseAudio !== 'undefined') {
            MindVerseAudio.playStarSound();
            MindVerseAudio.speak('Safely crossed on the white zebra stripes! Excellent work!');
          }
          setTimeout(() => {
            saveGameProgress('road_safety', 100, 3);
            showCelebration('Road Safety Champion!', 100, 3, () => initRoadSafety(containerId));
          }, 900);
        } else {
          playSynthTone(180, 0.3, 'sawtooth');
          if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.speak('Wait! Never cross on a red light. Wait for the green walk signal.');
        }
      };

      document.getElementById('rs-reset-btn').onclick = () => initRoadSafety(containerId);
    }

    renderStreet();
  }

  // =========================================================================
  // 12. ANIMAL HOME FINDER (Match animals to habitats)
  // =========================================================================
  function initAnimalHomeFinder(containerId) {
    const pairs = [
      { id: '1', word: 'Ocean 🌊', icon: '🐬', audio: 'Dolphin swims in the ocean' },
      { id: '2', word: 'Nest 🪺', icon: '🐦', audio: 'Bird rests in the nest' },
      { id: '3', word: 'Beehive 🍯', icon: '🐝', audio: 'Honeybee makes honey in hive' },
      { id: '4', word: 'Doghouse 🏠', icon: '🐶', audio: 'Puppy sleeps in the cozy doghouse' }
    ];
    initMatchingGame(containerId, pairs);
  }

  // =========================================================================
  // 13. MUSIC & RHYTHM STUDIO (Playable 8-Key Rainbow Piano via Web Audio)
  // =========================================================================
  function initMusicRhythm(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const keys = [
      { note: 'C', freq: 261.63, color: '#ef4444', label: 'Do' },
      { note: 'D', freq: 293.66, color: '#f97316', label: 'Re' },
      { note: 'E', freq: 329.63, color: '#eab308', label: 'Mi' },
      { note: 'F', freq: 349.23, color: '#22c55e', label: 'Fa' },
      { note: 'G', freq: 392.00, color: '#06b6d4', label: 'Sol' },
      { note: 'A', freq: 440.00, color: '#3b82f6', label: 'La' },
      { note: 'B', freq: 493.88, color: '#8b5cf6', label: 'Ti' },
      { note: 'C2', freq: 523.25, color: '#ec4899', label: 'High Do' }
    ];

    container.innerHTML = `
      <div class="game-hud">
        <div class="hud-stat"><span>Studio:</span> 8-Key Musical Glockenspiel 🎶</div>
        <button class="btn btn-secondary" id="mr-song-btn">🎵 Play Demo Song</button>
      </div>
      <p style="color:var(--text-muted); margin-bottom:1.5rem;">Tap any colorful musical key to play bright sounds and compose your own gentle tune!</p>

      <div style="display:flex; justify-content:center; gap:8px; margin:2rem auto; max-width:650px;" id="mr-piano-keys">
        ${keys.map((k, idx) => {
          const chimeHeight = 220 - idx * 7;
          const keyGraphic = (typeof GameGraphics !== 'undefined') ? GameGraphics.glockenspielKey(k.note, k.color, k.label, chimeHeight) : `<span>${k.note}</span>`;
          return `
            <button class="mr-key-btn btn-icon" data-freq="${k.freq}" data-note="${k.note}" style="background:transparent; border:none; padding:0; cursor:pointer; transition:transform 0.1s; display:flex; align-items:flex-end;" title="Key ${k.note}">
              ${keyGraphic}
            </button>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('.mr-key-btn').forEach(btn => {
      btn.onclick = () => {
        const freq = parseFloat(btn.dataset.freq);
        playSynthTone(freq, 0.4, 'triangle');
        btn.style.transform = 'translateY(6px)';
        setTimeout(() => btn.style.transform = 'translateY(0)', 120);
      };
    });

    document.getElementById('mr-song-btn').onclick = () => {
      const tune = [
        { freq: 261.63, delay: 0 },
        { freq: 261.63, delay: 400 },
        { freq: 392.00, delay: 800 },
        { freq: 392.00, delay: 1200 },
        { freq: 440.00, delay: 1600 },
        { freq: 440.00, delay: 2000 },
        { freq: 392.00, delay: 2400 }
      ];
      tune.forEach(t => setTimeout(() => playSynthTone(t.freq, 0.35, 'triangle'), t.delay));
    };
  }

  // =========================================================================
  // 14. GROW A MAGIC GARDEN (Plant, water, bloom flower)
  // =========================================================================
  function initMagicGarden(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let stage = 0;
    const stages = [
      { text: 'Tap the trowel to plant tiny sunflower seeds in the warm soil.', icon: '🌰', prompt: 'Plant Seeds' },
      { text: 'Sprinkle fresh cool water from the watering can.', icon: '🌱', prompt: 'Water Garden' },
      { text: 'Give warm golden sunlight so the stem grows tall.', icon: '🌿', prompt: 'Give Sunlight' },
      { text: 'Look! A magnificent giant sunflower has bloomed! 🌻', icon: '🌻', prompt: 'Magnificent Bloom!' }
    ];

    function renderStage() {
      const cur = stages[stage];
      const plantGraphic = (typeof GameGraphics !== 'undefined') ? GameGraphics.botanicalPlant(stage, 180) : `<div style="font-size:5rem;">${cur.icon}</div>`;

      container.innerHTML = `
        <div class="game-hud">
          <div class="hud-stat"><span>Garden Stage:</span> ${stage + 1} / 4</div>
          <button class="btn btn-secondary" id="mg-reset-btn">🔄 Plant Again</button>
        </div>

        <div style="background:linear-gradient(180deg, #091a2e, #132b1e); border:2px solid var(--border-glow); border-radius:var(--radius-xl); padding:2rem; text-align:center; max-width:550px; margin:0 auto; box-shadow:0 15px 35px rgba(0,0,0,0.6);">
          <div style="margin-bottom:1rem; display:flex; justify-content:center; animation:popIn 0.3s ease;">${plantGraphic}</div>
          <p style="font-size:1.2rem; color:#fff; margin-bottom:2rem;">${cur.text}</p>
          <button class="btn btn-primary btn-lg" id="mg-action-btn" style="font-size:1.2rem; padding:0.9rem 2rem;">
            ${cur.prompt}
          </button>
        </div>
      `;

      document.getElementById('mg-action-btn').onclick = () => {
        playSynthTone(400 + stage * 100, 0.2);
        stage++;
        if (stage < stages.length) {
          renderStage();
        } else {
          stage = stages.length - 1;
          renderStage();
          saveGameProgress('magic_garden', 100, 3);
          showCelebration('Sunflower in Full Bloom!', 100, 3, () => initMagicGarden(containerId));
        }
      };

      document.getElementById('mg-reset-btn').onclick = () => initMagicGarden(containerId);
    }

    renderStage();
  }

  // =========================================================================
  // 15. LITTLE CHEF (Make a sandwich sequence)
  // =========================================================================
  function initLittleChef(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    function getSandwichSvg(name) {
      if (typeof GameGraphics === 'undefined') return '';
      if (name.includes('Bread')) return GameGraphics.sandwichLayer('bread');
      if (name.includes('Lettuce')) return GameGraphics.sandwichLayer('lettuce');
      if (name.includes('Tomato')) return GameGraphics.sandwichLayer('tomato');
      if (name.includes('Cheese')) return GameGraphics.sandwichLayer('cheese');
      return '';
    }

    const recipe = [
      { name: 'Bottom Bread', icon: '🍞' },
      { name: 'Crisp Lettuce', icon: '🥬' },
      { name: 'Juicy Tomato', icon: '🍅' },
      { name: 'Tasty Cheese', icon: '🧀' },
      { name: 'Top Bread', icon: '🍞' }
    ];

    let currentStep = 0;
    let stack = [];

    function renderChef() {
      container.innerHTML = `
        <div class="game-hud">
          <div class="hud-stat"><span>Recipe:</span> Fresh Garden Sandwich 🥪</div>
          <div class="hud-stat"><span>Progress:</span> ${currentStep} / ${recipe.length}</div>
          <button class="btn btn-secondary" id="lc-reset-btn">🔄 Clear Plate</button>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:2rem; align-items:center;">
          <div style="background:#0f172a; border-radius:var(--radius-xl); padding:2rem 1.5rem; text-align:center; min-height:280px; display:flex; flex-direction:column-reverse; align-items:center; justify-content:center; border:2px solid var(--border-glow); box-shadow:0 10px 25px rgba(0,0,0,0.5);">
            <!-- Porcelain Plate Rim -->
            <div style="width:230px; height:18px; background:linear-gradient(180deg, #94a3b8, #475569); border-radius:var(--radius-full); margin-top:12px; box-shadow:0 6px 12px rgba(0,0,0,0.6);"></div>
            ${stack.map(s => `
              <div style="margin:-10px 0; display:flex; justify-content:center; animation:popIn 0.25s ease;">
                ${getSandwichSvg(s.name) || `<span style="font-size:3rem;">${s.icon}</span>`}
              </div>
            `).join('')}
          </div>

          <div>
            <h3 style="color:#fff; font-size:1.2rem; margin-bottom:1rem;">Next ingredient: <span style="color:var(--primary); font-weight:800;">${recipe[currentStep] ? recipe[currentStep].name : 'Complete!'}</span></h3>
            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:1rem;">
              ${recipe.map(item => `
                <button class="btn btn-secondary lc-item-btn" data-name="${item.name}" style="padding:0.75rem 0.5rem; font-size:0.95rem; display:flex; flex-direction:column; align-items:center; gap:0.35rem; border-radius:var(--radius-lg); transition:transform 0.15s;" onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">
                  <div style="height:36px; display:flex; align-items:center;">${getSandwichSvg(item.name) || item.icon}</div>
                  <span style="font-weight:700;">${item.name}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      container.querySelectorAll('.lc-item-btn').forEach(btn => {
        btn.onclick = () => {
          if (currentStep >= recipe.length) return;
          if (btn.dataset.name === recipe[currentStep].name) {
            stack.push(recipe[currentStep]);
            currentStep++;
            playSynthTone(500, 0.15);
            if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.speak(`Added ${btn.dataset.name}`);
            renderChef();

            if (currentStep === recipe.length) {
              setTimeout(() => {
                saveGameProgress('little_chef', 100, 3);
                showCelebration('Master Sandwich Created!', 100, 3, () => initLittleChef(containerId));
              }, 400);
            }
          } else {
            playSynthTone(220, 0.2, 'sawtooth');
            if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.speak(`Next is ${recipe[currentStep].name}.`);
          }
        };
      });

      document.getElementById('lc-reset-btn').onclick = () => initLittleChef(containerId);
    }

    renderChef();
  }

  // =========================================================================
  // 16. TIME & ROUTINE CLOCK (Match time to daily milestones)
  // =========================================================================
  function initTimeClock(containerId) {
    const milestones = [
      {
        id: '1',
        word: 'Breakfast 🥣 (8:00 AM)',
        icon: (typeof GameGraphics !== 'undefined') ? GameGraphics.analogClock(8, 0, 85) : '⏰ 8:00 AM',
        audio: '8:00 AM is breakfast time'
      },
      {
        id: '2',
        word: 'Healthy Lunch 🥗 (12:30 PM)',
        icon: (typeof GameGraphics !== 'undefined') ? GameGraphics.analogClock(12, 30, 85) : '⏰ 12:30 PM',
        audio: '12:30 PM is lunchtime'
      },
      {
        id: '3',
        word: 'Cozy Bedtime 🛌 (8:00 PM)',
        icon: (typeof GameGraphics !== 'undefined') ? GameGraphics.analogClock(8, 0, 85) : '⏰ 8:00 PM',
        audio: '8:00 PM is bedtime'
      }
    ];
    initMatchingGame(containerId, milestones);
  }

  // =========================================================================
  // 17. FRUIT MATH MARKET (Visual addition & subtraction)
  // =========================================================================
  function initFruitMathMarket(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const a = Math.floor(Math.random() * 3) + 1;
    const b = Math.floor(Math.random() * 3) + 1;
    const correctSum = a + b;

    const appleList = Array(a).fill(null).map(() => (typeof GameGraphics !== 'undefined') ? GameGraphics.apple(48) : '🍎').join('');
    const orangeList = Array(b).fill(null).map(() => (typeof GameGraphics !== 'undefined') ? GameGraphics.orange(48) : '🍊').join('');

    container.innerHTML = `
      <div class="game-hud">
        <div class="hud-stat"><span>Market Math:</span> Addition Challenge 🧺</div>
        <button class="btn btn-secondary" id="fmm-reset-btn">🔄 New Sum</button>
      </div>

      <div style="background:#1e293b; border-radius:var(--radius-xl); padding:2.5rem; text-align:center; max-width:680px; margin:0 auto; border:2px solid var(--border-glow); box-shadow:0 15px 35px rgba(0,0,0,0.6);">
        <div style="display:flex; justify-content:center; align-items:center; gap:1.5rem; margin-bottom:1.5rem; flex-wrap:wrap;">
          <div style="display:flex; flex-direction:column; align-items:center;">
            <div style="display:flex; gap:0.25rem; min-height:55px; align-items:center;">${appleList}</div>
            <div style="font-size:1.6rem; color:var(--primary); font-weight:800; margin-top:0.35rem;">${a} Apples</div>
          </div>
          <div style="font-size:3rem; color:#fff; font-weight:900;">+</div>
          <div style="display:flex; flex-direction:column; align-items:center;">
            <div style="display:flex; gap:0.25rem; min-height:55px; align-items:center;">${orangeList}</div>
            <div style="font-size:1.6rem; color:#fb923c; font-weight:800; margin-top:0.35rem;">${b} Oranges</div>
          </div>
          <div style="font-size:3rem; color:#fff; font-weight:900;">=</div>
          <div style="font-size:3.5rem; color:#fbbf24; font-weight:800; width:70px; height:70px; background:rgba(0,0,0,0.3); border:2px dashed var(--border-light); border-radius:var(--radius-lg); display:flex; align-items:center; justify-content:center;" id="fmm-answer-box">?</div>
        </div>

        <p style="color:var(--text-muted); font-size:1.15rem; margin-bottom:1.5rem;">How many total fruits are in the baskets?</p>
        <div style="display:flex; justify-content:center; gap:1.25rem;" id="fmm-options">
          ${[correctSum - 1, correctSum, correctSum + 1].filter(n => n > 0).sort(() => Math.random() - 0.5).map(opt => `
            <button class="btn btn-primary fmm-btn" data-val="${opt}" style="font-size:1.8rem; padding:0.8rem 2rem; border-radius:var(--radius-lg); font-weight:800;">
              ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.fmm-btn').forEach(btn => {
      btn.onclick = () => {
        const val = parseInt(btn.dataset.val);
        if (val === correctSum) {
          document.getElementById('fmm-answer-box').textContent = correctSum;
          playSynthTone(600, 0.2);
          if (typeof MindVerseAudio !== 'undefined') {
            MindVerseAudio.playStarSound();
            MindVerseAudio.speak(`${a} plus ${b} equals ${correctSum}! Excellent!`);
          }
          setTimeout(() => {
            saveGameProgress('fruit_math_market', 100, 3);
            showCelebration(`Correct: ${a} + ${b} = ${correctSum}!`, 100, 3, () => initFruitMathMarket(containerId));
          }, 400);
        } else {
          playSynthTone(220, 0.2, 'sawtooth');
          if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.playGentleTryAgain();
        }
      };
    });

    document.getElementById('fmm-reset-btn').onclick = () => initFruitMathMarket(containerId);
  }

  // =========================================================================
  // 18. INTERACTIVE STORY WORLD (Choose what character does next)
  // =========================================================================
  function initInteractiveStoryWorld(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let sceneIndex = 0;
    const storyScenes = [
      {
        title: 'Pip the Little Bird',
        text: 'Pip wakes up in a leafy tree. The morning sun is bright and warm. Pip wants to explore!',
        choices: [
          { text: 'Fly to the sparkling pond 💧', next: 1 },
          { text: 'Visit the flower garden 🌻', next: 2 }
        ]
      },
      {
        title: 'At the Sparkling Pond',
        text: 'At the pond, Pip meets a friendly green frog who ribbits hello and shares fresh water!',
        choices: [
          { text: 'Sing a cheerful song together 🎶', next: 3 },
          { text: 'Rest on a smooth stone 🪨', next: 3 }
        ]
      },
      {
        title: 'In the Flower Garden',
        text: 'Bright red and yellow blossoms smell sweet. A fuzzy bumblebee waves its antennae happily.',
        choices: [
          { text: 'Help smell the sunflowers 🌻', next: 3 },
          { text: 'Fly gently back home 🏡', next: 3 }
        ]
      },
      {
        title: 'A Warm Afternoon Nap',
        text: 'Pip returns to the nest with a happy heart, ready for a restful afternoon nap. What a wonderful day!',
        choices: []
      }
    ];

    function renderScene() {
      const sc = storyScenes[sceneIndex];
      container.innerHTML = `
        <div class="game-hud">
          <div class="hud-stat"><span>Story World:</span> ${sc.title}</div>
          <button class="btn btn-secondary" id="isw-listen-btn">🔊 Read Aloud</button>
        </div>

        <div style="background:#1e293b; border-radius:var(--radius-xl); padding:2.5rem; text-align:center; max-width:650px; margin:0 auto; border:2px solid var(--border-glow);">
          <div style="font-size:4rem; margin-bottom:1rem;">🐦</div>
          <h2 style="color:var(--primary); font-size:1.6rem; margin-bottom:1rem;">${sc.title}</h2>
          <p style="font-size:1.25rem; color:#fff; line-height:1.7; margin-bottom:2rem;" id="isw-text">${sc.text}</p>

          ${sc.choices.length > 0 ? `
            <div style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
              ${sc.choices.map(c => `
                <button class="btn btn-primary isw-choice-btn" data-next="${c.next}" style="font-size:1.05rem; padding:0.9rem 1.5rem;">
                  ${c.text}
                </button>
              `).join('')}
            </div>
          ` : `
            <button class="btn btn-accent btn-lg" id="isw-finish-btn">🎉 Celebrate Story Adventure</button>
          `}
        </div>
      `;

      document.getElementById('isw-listen-btn').onclick = () => {
        if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.speak(sc.text);
      };

      container.querySelectorAll('.isw-choice-btn').forEach(btn => {
        btn.onclick = () => {
          sceneIndex = parseInt(btn.dataset.next);
          playSynthTone(520, 0.15);
          renderScene();
        };
      });

      const finishBtn = document.getElementById('isw-finish-btn');
      if (finishBtn) {
        finishBtn.onclick = () => {
          saveGameProgress('interactive_story_world', 100, 3);
          showCelebration('Story Adventure Completed!', 100, 3, () => initInteractiveStoryWorld(containerId));
        };
      }
    }

    renderScene();
  }

  // =========================================================================
  // 19. LETTER TRACING PATH (Interactive Canvas Tracing)
  // =========================================================================
  function initLetterTracing(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="game-hud">
        <div class="hud-stat"><span>Trace Letter:</span> <strong style="color:var(--primary); font-size:1.3rem;">Letter A</strong></div>
        <button class="btn btn-secondary" id="lt-clear-btn">🔄 Clear Canvas</button>
      </div>
      <p style="color:var(--text-muted); margin-bottom:1rem;">Trace over the letter outline with your mouse or finger!</p>
      
      <div style="display:flex; justify-content:center;">
        <canvas id="lt-canvas" width="400" height="350" style="background:#0b1120; border:2px solid var(--border-glow); border-radius:var(--radius-xl); cursor:crosshair; touch-action:none;"></canvas>
      </div>
      <div style="text-align:center; margin-top:1rem;">
        <button class="btn btn-primary" id="lt-done-btn">⭐ Finished Tracing!</button>
      </div>
    `;

    const canvas = document.getElementById('lt-canvas');
    const ctx = canvas.getContext('2d');

    function drawGuide() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 220px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('A', canvas.width / 2, canvas.height / 2 + 10);

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 8]);
      ctx.strokeText('A', canvas.width / 2, canvas.height / 2 + 10);
      ctx.setLineDash([]);
    }

    drawGuide();

    let isDrawing = false;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#00f0ff';

    const startDraw = (e) => {
      isDrawing = true;
      draw(e);
    };
    const endDraw = () => isDrawing = false;
    const draw = (e) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
      const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('touchstart', startDraw);
    canvas.addEventListener('touchend', endDraw);
    canvas.addEventListener('touchmove', draw);

    document.getElementById('lt-clear-btn').onclick = () => {
      ctx.beginPath();
      drawGuide();
    };

    document.getElementById('lt-done-btn').onclick = () => {
      saveGameProgress('letter_tracing', 100, 3);
      if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.playStarSound();
      showCelebration('Letter A Traced Smoothly!', 100, 3, () => initLetterTracing(containerId));
    };
  }

  // =========================================================================
  // 20. WORD BUILDER WORKSHOP (Movable letters spell words)
  // =========================================================================
  function initWordBuilder(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const targetWord = 'CAT';
    const letters = ['T', 'C', 'A'];
    let built = [];

    function renderBuilder() {
      container.innerHTML = `
        <div class="game-hud">
          <div class="hud-stat"><span>Build Word:</span> <span style="font-size:1.8rem;">🐱</span></div>
          <button class="btn btn-secondary" id="wb-reset-btn">🔄 Clear Letters</button>
        </div>
        <p style="color:var(--text-muted); margin-bottom:1.5rem;">Click the letter blocks in order to spell the word for <strong>Cat</strong>!</p>

        <div style="display:flex; justify-content:center; gap:1rem; margin-bottom:2rem;">
          ${[0, 1, 2].map(idx => `
            <div style="width:70px; height:80px; border:2px dashed var(--primary); border-radius:var(--radius-lg); display:flex; align-items:center; justify-content:center; font-size:2.4rem; font-weight:800; color:#fff; background:rgba(0,240,255,0.08);">
              ${built[idx] || ''}
            </div>
          `).join('')}
        </div>

        <div style="display:flex; justify-content:center; gap:1rem;">
          ${letters.map(ch => `
            <button class="btn btn-primary wb-letter-btn" data-char="${ch}" style="font-size:2rem; width:70px; height:70px; border-radius:var(--radius-md);">
              ${ch}
            </button>
          `).join('')}
        </div>
      `;

      container.querySelectorAll('.wb-letter-btn').forEach(btn => {
        btn.onclick = () => {
          const ch = btn.dataset.char;
          if (built.length < 3) {
            built.push(ch);
            playSynthTone(500, 0.1);
            if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.speak(ch);
            renderBuilder();

            if (built.length === 3) {
              const result = built.join('');
              if (result === targetWord) {
                setTimeout(() => {
                  saveGameProgress('word_builder', 100, 3);
                  showCelebration('C-A-T Spelled Perfectly!', 100, 3, () => initWordBuilder(containerId));
                }, 300);
              } else {
                setTimeout(() => {
                  playSynthTone(220, 0.2, 'sawtooth');
                  if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.speak('Good try. Let us try C, then A, then T.');
                  built = [];
                  renderBuilder();
                }, 800);
              }
            }
          }
        };
      });

      document.getElementById('wb-reset-btn').onclick = () => {
        built = [];
        renderBuilder();
      };
    }

    renderBuilder();
  }

  // =========================================================================
  // 21. WEATHER EXPLORER (Match weather to clothes)
  // =========================================================================
  function initWeatherExplorer(containerId) {
    const pairs = [
      {
        id: '1',
        word: 'Raincoat & Umbrella ☂️',
        icon: (typeof GameGraphics !== 'undefined') ? GameGraphics.weatherIllustration('rain', 75) : '🌧️',
        audio: 'Rainy day needs raincoat and umbrella'
      },
      {
        id: '2',
        word: 'Sunglasses & Cap 🧢',
        icon: (typeof GameGraphics !== 'undefined') ? GameGraphics.weatherIllustration('sun', 75) : '☀️',
        audio: 'Sunny day needs sunhat and glasses'
      },
      {
        id: '3',
        word: 'Warm Scarf & Coat 🧣',
        icon: (typeof GameGraphics !== 'undefined') ? GameGraphics.weatherIllustration('snow', 75) : '❄️',
        audio: 'Cold snowy day needs warm winter coat'
      }
    ];
    initMatchingGame(containerId, pairs);
  }

  // =========================================================================
  // 22. CLEAN PLANET CHALLENGE (Sort waste into recycling bins)
  // =========================================================================
  function initCleanPlanet(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const wasteItems = [
      { name: 'Water Bottle', bin: 'recycle', type: 'bottle' },
      { name: 'Banana Peel', bin: 'compost', type: 'banana' },
      { name: 'Broken Crayon', bin: 'trash', type: 'crayon' }
    ].sort(() => Math.random() - 0.5);

    let activeWaste = null;
    let sorted = 0;

    const binSvgRecycle = (typeof GameGraphics !== 'undefined') ? GameGraphics.recyclingBin('recycle', 95) : '♻️ Recycle';
    const binSvgCompost = (typeof GameGraphics !== 'undefined') ? GameGraphics.recyclingBin('compost', 95) : '🌱 Compost';
    const binSvgTrash = (typeof GameGraphics !== 'undefined') ? GameGraphics.recyclingBin('trash', 95) : '🗑️ Trash';

    container.innerHTML = `
      <div class="game-hud">
        <div class="hud-stat"><span>Planet Cleaned:</span> <span id="cp-count">0</span> / 3</div>
        <button class="btn btn-secondary" id="cp-reset-btn">🔄 Reset Bins</button>
      </div>
      <p style="color:var(--text-muted); margin-bottom:1.5rem;">Click an eco-waste item below, then tap the matching curbside recycling bin!</p>

      <div style="display:flex; justify-content:space-around; gap:1.5rem; margin-bottom:2.5rem; flex-wrap:wrap;">
        <div class="cp-bin" data-bin="recycle" style="cursor:pointer; transition:transform 0.2s;" onmouseenter="this.style.transform='scale(1.06)'" onmouseleave="this.style.transform='scale(1)'">
          ${binSvgRecycle}
        </div>
        <div class="cp-bin" data-bin="compost" style="cursor:pointer; transition:transform 0.2s;" onmouseenter="this.style.transform='scale(1.06)'" onmouseleave="this.style.transform='scale(1)'">
          ${binSvgCompost}
        </div>
        <div class="cp-bin" data-bin="trash" style="cursor:pointer; transition:transform 0.2s;" onmouseenter="this.style.transform='scale(1.06)'" onmouseleave="this.style.transform='scale(1)'">
          ${binSvgTrash}
        </div>
      </div>

      <h4 style="color:#fff; margin-bottom:0.75rem;">Discovered Waste to Sort</h4>
      <div style="display:flex; justify-content:center; gap:1.5rem;" id="cp-tray">
        ${wasteItems.map(w => `
          <button class="btn cp-item-btn" data-bin="${w.bin}" data-name="${w.name}" style="background:#1e293b; border:2px solid var(--border-glow); padding:0.8rem 1.2rem; border-radius:var(--radius-xl); cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:0.5rem; box-shadow:0 8px 16px rgba(0,0,0,0.4); transition:transform 0.2s;">
            <div>${(typeof GameGraphics !== 'undefined') ? GameGraphics.wasteObject(w.type, 56) : w.name}</div>
            <span style="font-size:0.95rem; font-weight:700; color:#fff;">${w.name}</span>
          </button>
        `).join('')}
      </div>
    `;

    const itemBtns = container.querySelectorAll('.cp-item-btn');
    const bins = container.querySelectorAll('.cp-bin');

    itemBtns.forEach(btn => {
      btn.onclick = () => {
        itemBtns.forEach(b => {
          b.style.borderColor = 'var(--border-glow)';
          b.style.transform = 'scale(1)';
        });
        btn.style.borderColor = 'var(--primary)';
        btn.style.transform = 'scale(1.08)';
        activeWaste = btn;
        playSynthTone(450, 0.1);
        if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.speak(btn.dataset.name);
      };
    });

    bins.forEach(bin => {
      bin.onclick = () => {
        if (!activeWaste) return;
        if (bin.dataset.bin === activeWaste.dataset.bin) {
          activeWaste.remove();
          activeWaste = null;
          sorted++;
          document.getElementById('cp-count').textContent = sorted;
          playSynthTone(600, 0.15);
          if (typeof MindVerseAudio !== 'undefined') {
            MindVerseAudio.playStarSound();
            MindVerseAudio.speak(`Good eco-friendly sorting choice!`);
          }
          if (sorted === wasteItems.length) {
            saveGameProgress('clean_planet', 100, 3);
            showCelebration('Planet Earth Cleaned!', 100, 3, () => initCleanPlanet(containerId));
          }
        } else {
          playSynthTone(200, 0.2, 'sawtooth');
          if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.playGentleTryAgain();
        }
      };
    });

    document.getElementById('cp-reset-btn').onclick = () => initCleanPlanet(containerId);
  }

  // =========================================================================
  // 23. FIND IT IN THE CLASSROOM (Search for school objects)
  // =========================================================================
  function initFindInClassroom(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let foundCount = 0;

    container.innerHTML = `
      <div class="game-hud">
        <div class="hud-stat"><span>Found Objects:</span> <span id="fc-count">0</span> / 3</div>
        <button class="btn btn-secondary" id="fc-reset-btn">🔄 Reset</button>
      </div>
      <p style="color:var(--text-muted); margin-bottom:1rem;">Can you spot the Yellow Pencil, School Backpack, and Classroom Clock in the room?</p>

      <div style="background:#09101d; border:2px solid var(--border-glow); border-radius:var(--radius-xl); height:330px; position:relative; overflow:hidden; padding:2rem; box-shadow:inset 0 0 40px rgba(0,0,0,0.8);">
        <!-- Classroom Decor -->
        <div style="font-size:3rem; position:absolute; top:25px; left:30px; opacity:0.6;">🏫</div>
        <div style="font-size:3rem; position:absolute; bottom:30px; left:120px; opacity:0.6;">🪑</div>
        <div style="font-size:3rem; position:absolute; bottom:30px; right:120px; opacity:0.6;">📚</div>
        
        <!-- Interactive Realistic Objects -->
        <button class="btn-icon fc-hidden" data-name="Yellow Pencil" style="position:absolute; top:80px; right:75px; background:transparent; border:none; cursor:pointer; transition:transform 0.2s;" title="Yellow Pencil">
          ${(typeof GameGraphics !== 'undefined') ? GameGraphics.schoolItem('pencil', 60) : '✏️'}
        </button>
        <button class="btn-icon fc-hidden" data-name="School Backpack" style="position:absolute; bottom:35px; left:190px; background:transparent; border:none; cursor:pointer; transition:transform 0.2s;" title="School Backpack">
          ${(typeof GameGraphics !== 'undefined') ? GameGraphics.schoolItem('backpack', 64) : '🎒'}
        </button>
        <button class="btn-icon fc-hidden" data-name="Classroom Clock" style="position:absolute; top:20px; left:50%; transform:translateX(-50%); background:transparent; border:none; cursor:pointer; transition:transform 0.2s;" title="Classroom Clock">
          ${(typeof GameGraphics !== 'undefined') ? GameGraphics.schoolItem('clock', 64) : '⏰'}
        </button>
      </div>
    `;

    container.querySelectorAll('.fc-hidden').forEach(itemBtn => {
      itemBtn.onclick = () => {
        const name = itemBtn.dataset.name;
        itemBtn.style.outline = '3px solid #10b981';
        itemBtn.style.background = 'rgba(16,185,129,0.2)';
        itemBtn.disabled = true;
        foundCount++;
        document.getElementById('fc-count').textContent = foundCount;

        playSynthTone(580, 0.2);
        if (typeof MindVerseAudio !== 'undefined') {
          MindVerseAudio.playStarSound();
          MindVerseAudio.speak(`You found the ${name}!`);
        }

        if (foundCount === 3) {
          saveGameProgress('find_in_classroom', 100, 3);
          showCelebration('Sharp Eyes! Classroom Cleared!', 100, 3, () => initFindInClassroom(containerId));
        }
      };
    });

    document.getElementById('fc-reset-btn').onclick = () => initFindInClassroom(containerId);
  }

  // =========================================================================
  // 24. FRIENDLY MAZE RUNNER (Guide mascot through grid maze)
  // =========================================================================
  function initFriendlyMaze(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let posX = 0;
    let posY = 0;
    const targetX = 3;
    const targetY = 3;

    function renderMaze() {
      container.innerHTML = `
        <div class="game-hud">
          <div class="hud-stat"><span>Goal:</span> Help Bear 🐻 reach the Trophy 🏆</div>
          <button class="btn btn-secondary" id="fm-reset-btn">🔄 Reset</button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(4, 70px); gap:6px; justify-content:center; margin:1.5rem auto;">
          ${Array(16).fill(null).map((_, idx) => {
            const x = idx % 4;
            const y = Math.floor(idx / 4);
            const isBear = (x === posX && y === posY);
            const isGoal = (x === targetX && y === targetY);
            return `
              <div style="width:70px; height:70px; background:#1e293b; border:1px solid var(--border-light); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; font-size:2.4rem;">
                ${isBear ? '🐻' : (isGoal ? '🏆' : '')}
              </div>
            `;
          }).join('')}
        </div>

        <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
          <button class="btn btn-secondary" id="fm-up" style="padding:0.6rem 1.5rem; font-size:1.2rem;">⬆️ Up</button>
          <div style="display:flex; gap:12px;">
            <button class="btn btn-secondary" id="fm-left" style="padding:0.6rem 1.5rem; font-size:1.2rem;">⬅️ Left</button>
            <button class="btn btn-secondary" id="fm-right" style="padding:0.6rem 1.5rem; font-size:1.2rem;">➡️ Right</button>
          </div>
          <button class="btn btn-secondary" id="fm-down" style="padding:0.6rem 1.5rem; font-size:1.2rem;">⬇️ Down</button>
        </div>
      `;

      const move = (dx, dy) => {
        const nx = Math.max(0, Math.min(3, posX + dx));
        const ny = Math.max(0, Math.min(3, posY + dy));
        if (nx !== posX || ny !== posY) {
          posX = nx;
          posY = ny;
          playSynthTone(400, 0.08);
          renderMaze();

          if (posX === targetX && posY === targetY) {
            saveGameProgress('friendly_maze', 100, 3);
            showCelebration('Maze Completed! Trophy Won!', 100, 3, () => initFriendlyMaze(containerId));
          }
        }
      };

      document.getElementById('fm-up').onclick = () => move(0, -1);
      document.getElementById('fm-down').onclick = () => move(0, 1);
      document.getElementById('fm-left').onclick = () => move(-1, 0);
      document.getElementById('fm-right').onclick = () => move(1, 0);
      document.getElementById('fm-reset-btn').onclick = () => initFriendlyMaze(containerId);
    }

    renderMaze();
  }

  // =========================================================================
  // 25. POP AND DISCOVER (Pop bubbles with matching targets)
  // =========================================================================
  function initPopAndDiscover(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let popped = 0;
    const bubbles = ['⭐', '⭐', '🎈', '⭐', '💎', '⭐'];

    container.innerHTML = `
      <div class="game-hud">
        <div class="hud-stat"><span>Mission:</span> Pop all Stars ⭐</div>
        <div class="hud-stat"><span>Popped:</span> <span id="pd-count">0</span> / 4</div>
        <button class="btn btn-secondary" id="pd-reset-btn">🔄 New Bubbles</button>
      </div>

      <div style="background:#0b1120; border:2px solid var(--border-glow); border-radius:var(--radius-xl); height:320px; display:flex; justify-content:space-around; align-items:center; flex-wrap:wrap; padding:1.5rem; box-shadow:inset 0 0 40px rgba(0,0,0,0.8);" id="pd-arena">
        ${bubbles.map((b, idx) => `
          <button class="btn-icon pd-bubble" data-is-star="${b === '⭐'}" style="background:transparent; border:none; cursor:pointer; transition:all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);" onmouseenter="this.style.transform='scale(1.15)'" onmouseleave="this.style.transform='scale(1)'">
            ${(typeof GameGraphics !== 'undefined') ? GameGraphics.iridescentBubble(b, 85) : b}
          </button>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.pd-bubble').forEach(bEl => {
      bEl.onclick = () => {
        if (bEl.dataset.isStar === 'true') {
          bEl.style.transform = 'scale(1.5)';
          bEl.style.opacity = '0';
          bEl.disabled = true;
          popped++;
          document.getElementById('pd-count').textContent = popped;
          playSynthTone(700, 0.1);

          if (popped === 4) {
            saveGameProgress('pop_and_discover', 100, 3);
            showCelebration('All Stars Popped!', 100, 3, () => initPopAndDiscover(containerId));
          }
        } else {
          playSynthTone(220, 0.2, 'sawtooth');
        }
      };
    });

    document.getElementById('pd-reset-btn').onclick = () => initPopAndDiscover(containerId);
  }

  // =========================================================================
  // 26. EVERYDAY OBJECT MATCHER (Pair related objects)
  // =========================================================================
  function initEverydayMatcher(containerId) {
    const pairs = [
      { id: '1', word: 'Socks 🧦', icon: '👟', audio: 'Shoes go with socks' },
      { id: '2', word: 'Toothpaste 🧴', icon: '🪥', audio: 'Toothbrush pairs with toothpaste' },
      { id: '3', word: 'Lock 🔒', icon: '🔑', audio: 'Key opens the lock' },
      { id: '4', word: 'Paper 📄', icon: '✏️', audio: 'Pencil writes on paper' }
    ];
    initMatchingGame(containerId, pairs);
  }

  // =========================================================================
  // 27. VIRTUAL PET CARE (Feed, wash, brush puppy)
  // =========================================================================
  function initVirtualPetCare(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let petState = 0;
    const steps = [
      { prompt: 'Puppy is hungry! Feed a delicious crunchy bone 🦴', action: 'Feed Bone', type: 'bone' },
      { prompt: 'Puppy is thirsty! Give a bowl of cool fresh water 💧', action: 'Give Water', type: 'water' },
      { prompt: 'Bath time! Clean puppy with warm bubbly soap 🧼', action: 'Bubbly Bath', type: 'soap' },
      { prompt: 'Puppy is cheerful, sparkling clean, and full of joy! 🐶❤️', action: 'Give Gentle Hug', type: 'heart' }
    ];

    function renderPet() {
      const cur = steps[petState];
      container.innerHTML = `
        <div class="game-hud">
          <div class="hud-stat"><span>Pet Care:</span> Step ${petState + 1} / 4</div>
          <button class="btn btn-secondary" id="vpc-reset-btn">🔄 Care Again</button>
        </div>

        <div style="background:#1e293b; border-radius:var(--radius-xl); padding:2rem; text-align:center; max-width:560px; margin:0 auto; border:2px solid var(--border-glow); box-shadow:0 15px 35px rgba(0,0,0,0.6);">
          <div style="margin-bottom:1.5rem; display:flex; justify-content:center; animation:popIn 0.3s ease;">
            ${(typeof GameGraphics !== 'undefined') ? GameGraphics.happyPuppy(170) : '<div style="font-size:6rem;">🐶</div>'}
          </div>
          <p style="font-size:1.25rem; color:#fff; margin-bottom:1.75rem;">${cur.prompt}</p>
          <button class="btn btn-primary btn-lg" id="vpc-act-btn" style="font-size:1.15rem; padding:0.8rem 2.2rem; display:inline-flex; align-items:center; gap:0.75rem; border-radius:var(--radius-xl);">
            <div>${(typeof GameGraphics !== 'undefined') ? GameGraphics.petCareItem(cur.type, 38) : ''}</div>
            <span style="font-weight:800;">${cur.action}</span>
          </button>
        </div>
      `;

      document.getElementById('vpc-act-btn').onclick = () => {
        playSynthTone(520, 0.15);
        petState++;
        if (petState < steps.length) {
          renderPet();
        } else {
          saveGameProgress('virtual_pet_care', 100, 3);
          showCelebration('Puppy is Loved and Happy!', 100, 3, () => initVirtualPetCare(containerId));
        }
      };

      document.getElementById('vpc-reset-btn').onclick = () => initVirtualPetCare(containerId);
    }

    renderPet();
  }

  // =========================================================================
  // 28. COMMUNITY HELPERS (Match worker to workplace)
  // =========================================================================
  function initCommunityHelpers(containerId) {
    const pairs = [
      { id: '1', word: 'Hospital & Stethoscope 🩺', icon: '👩‍⚕️', audio: 'Doctor works at the hospital' },
      { id: '2', word: 'Fire Engine 🚒', icon: '👨‍🚒', audio: 'Firefighter rides the fire truck' },
      { id: '3', word: 'School Blackboard 🏫', icon: '👩‍🏫', audio: 'Teacher teaches in the school' }
    ];
    initMatchingGame(containerId, pairs);
  }

  // =========================================================================
  // 29. DIRECTION DETECTIVE (Follow spoken/arrow directions)
  // =========================================================================
  function initDirectionDetective(containerId) {
    initFriendlyMaze(containerId);
  }

  // =========================================================================
  // 30. MY LEARNING ADVENTURE (Quest Map & Badge Collection)
  // =========================================================================
  function initMyLearningAdventure(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="game-hud">
        <div class="hud-stat"><span>Adventure:</span> Island Quest Map 🗺️</div>
        <div class="hud-stat"><span>Medals:</span> 6 / 6 Unlocked 🏅</div>
      </div>

      <div style="background:linear-gradient(135deg, #0f172a, #1a2238); border:2px solid var(--border-glow); border-radius:var(--radius-xl); padding:2rem; text-align:center;">
        <h2 style="color:var(--primary); font-size:1.8rem; margin-bottom:0.5rem;">🌟 MindVerse Learning Archipelago</h2>
        <p style="color:var(--text-muted); margin-bottom:2rem;">Explore islands to revisit your favorite games and collect shiny stars!</p>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1.25rem;">
          <div class="card" style="padding:1.25rem; text-align:center; border-color:var(--primary);">
            <div style="font-size:3rem;">🔤</div>
            <h4 style="color:#fff; margin:0.5rem 0;">Literacy Island</h4>
            <span class="badge badge-cyan">Alphabet & Words</span>
          </div>
          <div class="card" style="padding:1.25rem; text-align:center; border-color:#fbbf24;">
            <div style="font-size:3rem;">🔢</div>
            <h4 style="color:#fff; margin:0.5rem 0;">Math Valley</h4>
            <span class="badge badge-amber">Numbers & Market</span>
          </div>
          <div class="card" style="padding:1.25rem; text-align:center; border-color:#10b981;">
            <div style="font-size:3rem;">🌻</div>
            <h4 style="color:#fff; margin:0.5rem 0;">Nature Grove</h4>
            <span class="badge badge-green">Garden & Animals</span>
          </div>
          <div class="card" style="padding:1.25rem; text-align:center; border-color:#a855f7;">
            <div style="font-size:3rem;">💖</div>
            <h4 style="color:#fff; margin:0.5rem 0;">Kindness Town</h4>
            <span class="badge badge-purple">Emotions & Care</span>
          </div>
          <div class="card" style="padding:1.25rem; text-align:center; border-color:var(--accent);">
            <div style="font-size:3rem;">🧩</div>
            <h4 style="color:#fff; margin:0.5rem 0;">Puzzle Mountain</h4>
            <span class="badge badge-cyan">Maze & Shapes</span>
          </div>
          <div class="card" style="padding:1.25rem; text-align:center; border-color:#ec4899;">
            <div style="font-size:3rem;">🎹</div>
            <h4 style="color:#fff; margin:0.5rem 0;">Rhythm Reef</h4>
            <span class="badge badge-purple">Melodies & Piano</span>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Generic Matching & WordSearch Engines (for backward-compatibility)
  // =========================================================================
  function initMatchingGame(containerId, dataPairs = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const defaultPairs = [
      { id: '1', word: 'Apple', icon: '🍎', audio: 'Apple' },
      { id: '2', word: 'Cat', icon: '🐱', audio: 'Cat' },
      { id: '3', word: 'Sun', icon: '☀️', audio: 'Sun' },
      { id: '4', word: 'Ball', icon: '⚽', audio: 'Ball' }
    ];

    const pairs = dataPairs || defaultPairs;
    let selectedItem = null;
    let matchedCount = 0;
    let score = 0;

    const leftItems = [...pairs].sort(() => Math.random() - 0.5);
    const rightItems = [...pairs].sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div class="game-hud">
        <div class="hud-stat"><span>Score:</span> <span id="match-score">0</span></div>
        <div class="hud-stat"><span>Matched:</span> <span id="match-count">0</span> / ${pairs.length}</div>
        <button class="btn btn-secondary" id="match-reset-btn">🔄 Reset</button>
      </div>
      <div class="matching-board">
        <div class="matching-col" id="match-left"></div>
        <div class="matching-col" id="match-right"></div>
      </div>
    `;

    const leftCol = document.getElementById('match-left');
    const rightCol = document.getElementById('match-right');

    leftItems.forEach(item => {
      const el = document.createElement('div');
      el.className = 'matching-item';
      el.dataset.id = item.id;
      el.dataset.side = 'left';
      el.innerHTML = `<span style="font-size:2rem;">${item.icon}</span> <span>Picture</span>`;
      el.onclick = () => handleMatchClick(el, item);
      leftCol.appendChild(el);
    });

    rightItems.forEach(item => {
      const el = document.createElement('div');
      el.className = 'matching-item';
      el.dataset.id = item.id;
      el.dataset.side = 'right';
      el.innerHTML = `<span>${item.word}</span>`;
      el.onclick = () => handleMatchClick(el, item);
      rightCol.appendChild(el);
    });

    function handleMatchClick(element, item) {
      if (element.classList.contains('matched')) return;
      playSynthTone(400, 0.1);

      if (!selectedItem) {
        selectedItem = { element, item };
        element.classList.add('selected');
        if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.speak(item.audio || item.word);
      } else {
        if (selectedItem.element.dataset.side === element.dataset.side) {
          selectedItem.element.classList.remove('selected');
          selectedItem = { element, item };
          element.classList.add('selected');
          return;
        }

        if (selectedItem.item.id === item.id) {
          selectedItem.element.classList.remove('selected');
          selectedItem.element.classList.add('matched');
          element.classList.add('matched');
          matchedCount++;
          score += 25;
          document.getElementById('match-score').textContent = score;
          document.getElementById('match-count').textContent = matchedCount;

          playSynthTone(600, 0.2);
          if (typeof MindVerseAudio !== 'undefined') {
            MindVerseAudio.playStarSound();
            MindVerseAudio.speak(`Correct! ${item.word}`);
          }

          if (matchedCount === pairs.length) {
            saveGameProgress('matching', score, 3);
            showCelebration('Matching Completed!', score, 3, () => initMatchingGame(containerId, dataPairs));
          }
        } else {
          selectedItem.element.classList.remove('selected');
          playSynthTone(220, 0.25, 'sawtooth');
          if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.playGentleTryAgain();
        }
        selectedItem = null;
      }
    }

    document.getElementById('match-reset-btn').onclick = () => initMatchingGame(containerId, dataPairs);
  }

  function initMemoryGame(containerId, difficulty = 'easy') {
    initAnimalMemory(containerId, difficulty);
  }

  function initWordSearch(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const words = ['APPLE', 'CAT', 'STAR', 'TREE', 'SUN'];
    const gridSize = 8;
    const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));

    words.forEach(word => {
      let placed = false;
      let tries = 0;
      while (!placed && tries < 50) {
        tries++;
        const isHorizontal = Math.random() > 0.5;
        const row = Math.floor(Math.random() * (isHorizontal ? gridSize : (gridSize - word.length)));
        const col = Math.floor(Math.random() * (isHorizontal ? (gridSize - word.length) : gridSize));

        let fits = true;
        for (let i = 0; i < word.length; i++) {
          const r = isHorizontal ? row : row + i;
          const c = isHorizontal ? col + i : col;
          if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
            fits = false;
            break;
          }
        }

        if (fits) {
          for (let i = 0; i < word.length; i++) {
            const r = isHorizontal ? row : row + i;
            const c = isHorizontal ? col + i : col;
            grid[r][c] = word[i];
          }
          placed = true;
        }
      }
    });

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (!grid[r][c]) {
          grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    let foundWords = [];
    let selectedCells = [];

    container.innerHTML = `
      <div class="game-hud">
        <div class="hud-stat"><span>Found:</span> <span id="ws-found">0</span> / ${words.length}</div>
        <button class="btn btn-secondary" id="ws-reset-btn">🔄 New Puzzle</button>
      </div>
      <div class="word-search-container">
        <div class="word-search-grid" id="ws-grid" style="grid-template-columns: repeat(${gridSize}, 1fr);"></div>
        <div class="word-bank">
          <h4 style="color:#fff; margin-bottom:0.5rem;">Word Bank</h4>
          <ul class="word-bank-list" id="ws-bank">
            ${words.map(w => `<li class="word-bank-item" id="wb-${w}">⭐ ${w}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;

    const gridEl = document.getElementById('ws-grid');
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const cell = document.createElement('div');
        cell.className = 'word-search-cell';
        cell.textContent = grid[r][c];
        cell.dataset.char = grid[r][c];

        cell.onclick = () => {
          if (cell.classList.contains('found')) return;
          playSynthTone(500, 0.08);

          cell.classList.toggle('selected');
          if (cell.classList.contains('selected')) {
            selectedCells.push(cell);
          } else {
            selectedCells = selectedCells.filter(c => c !== cell);
          }

          const currentWord = selectedCells.map(c => c.dataset.char).join('');
          if (words.includes(currentWord) && !foundWords.includes(currentWord)) {
            foundWords.push(currentWord);
            selectedCells.forEach(c => {
              c.classList.remove('selected');
              c.classList.add('found');
            });
            selectedCells = [];

            const item = document.getElementById(`wb-${currentWord}`);
            if (item) item.classList.add('found');

            document.getElementById('ws-found').textContent = foundWords.length;
            playSynthTone(600, 0.2);
            if (typeof MindVerseAudio !== 'undefined') {
              MindVerseAudio.playStarSound();
              MindVerseAudio.speak(`Found ${currentWord}!`);
            }

            if (foundWords.length === words.length) {
              saveGameProgress('word_search', 120, 3);
              showCelebration('Word Search Solved!', 120, 3, () => initWordSearch(containerId));
            }
          }
        };

        gridEl.appendChild(cell);
      }
    }

    document.getElementById('ws-reset-btn').onclick = () => initWordSearch(containerId);
  }

  // Master Game Launcher
  function launchGame(gameId, containerId) {
    activeGameId = gameId;
    const hintBubble = document.getElementById('arena-hint-bubble');
    if (hintBubble) hintBubble.style.display = 'none';

    const gameMap = {
      'alphabet_adventure': initAlphabetAdventure,
      'number_catcher': initNumberCatcher,
      'shape_puzzle': initShapePuzzle,
      'animal_memory': initAnimalMemory,
      'color_sorting': initColorSorting,
      'sound_picture_match': initSoundPictureMatch,
      'jigsaw_builder': initJigsawBuilder,
      'mini_supermarket': initMiniSupermarket,
      'daily_routine': initDailyRoutine,
      'emotion_explorer': initEmotionExplorer,
      'road_safety': initRoadSafety,
      'animal_home_finder': initAnimalHomeFinder,
      'music_rhythm': initMusicRhythm,
      'magic_garden': initMagicGarden,
      'little_chef': initLittleChef,
      'time_clock': initTimeClock,
      'fruit_math_market': initFruitMathMarket,
      'interactive_story_world': initInteractiveStoryWorld,
      'letter_tracing': initLetterTracing,
      'word_builder': initWordBuilder,
      'weather_explorer': initWeatherExplorer,
      'clean_planet': initCleanPlanet,
      'find_in_classroom': initFindInClassroom,
      'friendly_maze': initFriendlyMaze,
      'pop_and_discover': initPopAndDiscover,
      'everyday_matcher': initEverydayMatcher,
      'virtual_pet_care': initVirtualPetCare,
      'community_helpers': initCommunityHelpers,
      'direction_detective': initDirectionDetective,
      'my_learning_adventure': initMyLearningAdventure,
      // aliases
      'matching': initMatchingGame,
      'memory': initAnimalMemory,
      'wordsearch': initWordSearch
    };

    const fn = gameMap[gameId] || initAlphabetAdventure;
    fn(containerId);
  }

  return {
    showCelebration,
    launchGame,
    triggerMindBotHint,
    fireConfetti,
    initMatchingGame,
    initMemoryGame,
    initWordSearch,
    initAlphabetAdventure,
    initNumberCatcher,
    initShapePuzzle,
    initAnimalMemory,
    initColorSorting,
    initSoundPictureMatch,
    initJigsawBuilder,
    initMiniSupermarket,
    initDailyRoutine,
    initEmotionExplorer,
    initRoadSafety,
    initAnimalHomeFinder,
    initMusicRhythm,
    initMagicGarden,
    initLittleChef,
    initTimeClock,
    initFruitMathMarket,
    initInteractiveStoryWorld,
    initLetterTracing,
    initWordBuilder,
    initWeatherExplorer,
    initCleanPlanet,
    initFindInClassroom,
    initFriendlyMaze,
    initPopAndDiscover,
    initEverydayMatcher,
    initVirtualPetCare,
    initCommunityHelpers,
    initDirectionDetective,
    initMyLearningAdventure
  };
})();
