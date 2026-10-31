/**
 * MINDVERSE — INCLUSIVE LEARNING LAB
 * High-Definition Realistic Vector Graphics Engine (GameGraphics)
 * Generates photorealistic, tactile SVG illustrations with lighting, gradients,
 * textures, bevels, and specular highlights for all 30 games.
 */

const GameGraphics = (function() {

  // 1. Realistic 3D Apple
  function apple(size = 64) {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="real-graphic-svg" style="filter: drop-shadow(0 6px 8px rgba(0,0,0,0.4));">
        <defs>
          <radialGradient id="appleGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#ff6b6b"/>
            <stop offset="40%" stop-color="#e02424"/>
            <stop offset="85%" stop-color="#991b1b"/>
            <stop offset="100%" stop-color="#580d0d"/>
          </radialGradient>
          <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#854d0e"/>
            <stop offset="100%" stop-color="#451a03"/>
          </linearGradient>
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4ade80"/>
            <stop offset="100%" stop-color="#15803d"/>
          </linearGradient>
        </defs>
        <!-- Stem -->
        <path d="M50 25 C 50 12, 60 8, 64 6 C 62 10, 56 16, 52 25 Z" fill="url(#stemGrad)" />
        <!-- Leaf -->
        <path d="M53 18 C 65 10, 80 14, 82 22 C 75 28, 60 25, 53 18 Z" fill="url(#leafGrad)" />
        <path d="M54 18 Q 67 19 79 21" stroke="#86efac" stroke-width="1" fill="none" opacity="0.6"/>
        <!-- Apple Body -->
        <path d="M50 28 C 30 26, 12 36, 12 60 C 12 82, 30 95, 50 94 C 70 95, 88 82, 88 60 C 88 36, 70 26, 50 28 Z" fill="url(#appleGrad)"/>
        <!-- Specular Gloss Highlight -->
        <ellipse cx="32" cy="44" rx="12" ry="18" transform="rotate(-20 32 44)" fill="#ffffff" opacity="0.32" />
        <ellipse cx="30" cy="42" rx="5" ry="8" transform="rotate(-20 30 42)" fill="#ffffff" opacity="0.55" />
      </svg>
    `;
  }

  // 2. Realistic 3D Citrus Orange
  function orange(size = 64) {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="real-graphic-svg" style="filter: drop-shadow(0 6px 8px rgba(0,0,0,0.4));">
        <defs>
          <radialGradient id="orangeGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#fed7aa"/>
            <stop offset="30%" stop-color="#fb923c"/>
            <stop offset="80%" stop-color="#ea580c"/>
            <stop offset="100%" stop-color="#9a3412"/>
          </radialGradient>
          <radialGradient id="dimpleGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#7c2d12"/>
            <stop offset="100%" stop-color="#ea580c"/>
          </radialGradient>
        </defs>
        <!-- Leaf -->
        <path d="M50 20 C 65 8, 80 14, 80 24 C 70 28, 55 24, 50 20 Z" fill="#16a34a"/>
        <!-- Orange Body -->
        <circle cx="50" cy="56" r="38" fill="url(#orangeGrad)"/>
        <!-- Citrus Stem Dimple -->
        <circle cx="50" cy="22" r="3" fill="url(#dimpleGrad)"/>
        <!-- Specular Highlight -->
        <ellipse cx="35" cy="44" rx="11" ry="15" transform="rotate(-25 35 44)" fill="#ffffff" opacity="0.3"/>
      </svg>
    `;
  }

  // 3. Realistic Woven Wicker Basket
  function basket(size = 180) {
    return `
      <svg width="${size}" height="${size * 0.8}" viewBox="0 0 200 160" class="real-graphic-svg" style="filter: drop-shadow(0 12px 20px rgba(0,0,0,0.6));">
        <defs>
          <linearGradient id="handleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#d97706"/>
            <stop offset="100%" stop-color="#78350f"/>
          </linearGradient>
          <linearGradient id="basketBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#b45309"/>
            <stop offset="50%" stop-color="#92400e"/>
            <stop offset="100%" stop-color="#451a03"/>
          </linearGradient>
          <pattern id="wicker" width="16" height="12" patternUnits="userSpaceOnUse">
            <path d="M0 6 L16 6 M8 0 L8 12" stroke="#78350f" stroke-width="2"/>
            <path d="M0 0 L16 12 M0 12 L16 0" stroke="#d97706" stroke-width="1.2" opacity="0.4"/>
          </pattern>
        </defs>
        <!-- Wicker Handle -->
        <path d="M40 75 C 40 10, 160 10, 160 75" fill="none" stroke="url(#handleGrad)" stroke-width="12" stroke-linecap="round"/>
        <path d="M40 75 C 40 12, 160 12, 160 75" fill="none" stroke="#fde68a" stroke-width="2" opacity="0.35"/>
        <!-- Basket Rim -->
        <ellipse cx="100" cy="75" rx="75" ry="20" fill="#78350f" stroke="#d97706" stroke-width="4"/>
        <ellipse cx="100" cy="74" rx="68" ry="14" fill="#291204"/>
        <!-- Basket Bowl -->
        <path d="M25 75 Q 35 145 100 148 Q 165 145 175 75 Z" fill="url(#basketBody)"/>
        <!-- Wicker Texture Overlay -->
        <path d="M25 75 Q 35 145 100 148 Q 165 145 175 75 Z" fill="url(#wicker)"/>
        <!-- Front Rim Lip -->
        <path d="M25 75 Q 100 95 175 75" fill="none" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>
      </svg>
    `;
  }

  // 4. Realistic Metal Traffic Light with Hoods and Fresnel Lenses
  function trafficLight(active = 'red', size = 90) {
    const isRed = active === 'red';
    const isGreen = active === 'green';
    const isYellow = active === 'yellow';

    return `
      <svg width="${size}" height="${size * 2.3}" viewBox="0 0 100 230" class="real-graphic-svg" style="filter: drop-shadow(0 10px 25px rgba(0,0,0,0.8));">
        <defs>
          <linearGradient id="casingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="30%" stop-color="#334155"/>
            <stop offset="70%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
          <radialGradient id="redGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="35%" stop-color="#ff4444"/>
            <stop offset="70%" stop-color="#dc2626"/>
            <stop offset="100%" stop-color="#7f1d1d"/>
          </radialGradient>
          <radialGradient id="greenGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="35%" stop-color="#4ade80"/>
            <stop offset="70%" stop-color="#16a34a"/>
            <stop offset="100%" stop-color="#14532d"/>
          </radialGradient>
        </defs>
        <!-- Signal Housing Box -->
        <rect x="15" y="10" width="70" height="210" rx="18" fill="url(#casingGrad)" stroke="#475569" stroke-width="3"/>
        
        <!-- Hood 1 & Red Lamp -->
        <path d="M 22 45 Q 50 18 78 45" fill="none" stroke="#0f172a" stroke-width="6"/>
        <circle cx="50" cy="50" r="24" fill="#180505" stroke="#334155" stroke-width="2"/>
        <circle cx="50" cy="50" r="22" fill="${isRed ? 'url(#redGlow)' : '#450a0a'}" ${isRed ? 'style="filter: drop-shadow(0 0 16px #ef4444);"' : 'opacity="0.4"'}/>
        <circle cx="45" cy="45" r="7" fill="#ffffff" opacity="${isRed ? '0.6' : '0.1'}"/>

        <!-- Hood 2 & Yellow Lamp -->
        <path d="M 22 110 Q 50 83 78 110" fill="none" stroke="#0f172a" stroke-width="6"/>
        <circle cx="50" cy="115" r="24" fill="#1c1602" stroke="#334155" stroke-width="2"/>
        <circle cx="50" cy="115" r="22" fill="${isYellow ? '#facc15' : '#713f12'}" ${isYellow ? 'style="filter: drop-shadow(0 0 16px #eab308);"' : 'opacity="0.35"'}/>
        <circle cx="45" cy="110" r="7" fill="#ffffff" opacity="${isYellow ? '0.6' : '0.1'}"/>

        <!-- Hood 3 & Green Lamp -->
        <path d="M 22 175 Q 50 148 78 175" fill="none" stroke="#0f172a" stroke-width="6"/>
        <circle cx="50" cy="180" r="24" fill="#031a0b" stroke="#334155" stroke-width="2"/>
        <circle cx="50" cy="180" r="22" fill="${isGreen ? 'url(#greenGlow)' : '#064e3b'}" ${isGreen ? 'style="filter: drop-shadow(0 0 16px #22c55e);"' : 'opacity="0.4"'}/>
        <circle cx="45" cy="175" r="7" fill="#ffffff" opacity="${isGreen ? '0.6' : '0.1'}"/>
      </svg>
    `;
  }

  // 5. Realistic Asphalt Road & White Painted Zebra Stripes
  function roadCrossing(width = 320, height = 150) {
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 320 150" class="real-graphic-svg" style="border-radius:16px; overflow:hidden; box-shadow:inset 0 0 30px rgba(0,0,0,0.8), 0 10px 25px rgba(0,0,0,0.5);">
        <defs>
          <linearGradient id="asphaltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1e2430"/>
            <stop offset="50%" stop-color="#2a303c"/>
            <stop offset="100%" stop-color="#191e28"/>
          </linearGradient>
        </defs>
        <!-- Asphalt Body -->
        <rect width="320" height="150" fill="url(#asphaltGrad)"/>
        <!-- Texture Specks -->
        <rect width="320" height="150" fill="#ffffff" opacity="0.04"/>
        
        <!-- Painted White Zebra Stripes -->
        <g fill="#f8fafc" style="filter: drop-shadow(0 3px 5px rgba(0,0,0,0.5));">
          <rect x="25" y="20" width="36" height="110" rx="3"/>
          <rect x="85" y="20" width="36" height="110" rx="3"/>
          <rect x="145" y="20" width="36" height="110" rx="3"/>
          <rect x="205" y="20" width="36" height="110" rx="3"/>
          <rect x="265" y="20" width="36" height="110" rx="3"/>
        </g>
        <!-- Curb Yellow Marking Line -->
        <line x1="0" y1="8" x2="320" y2="8" stroke="#eab308" stroke-width="4" stroke-dasharray="14 6"/>
        <line x1="0" y1="142" x2="320" y2="142" stroke="#eab308" stroke-width="4" stroke-dasharray="14 6"/>
      </svg>
    `;
  }

  // 6. Realistic Analog Clock
  function analogClock(hours = 8, minutes = 0, size = 150) {
    const hrAngle = (hours % 12) * 30 + minutes * 0.5;
    const minAngle = minutes * 6;

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 160 160" class="real-graphic-svg" style="filter: drop-shadow(0 8px 16px rgba(0,0,0,0.5));">
        <defs>
          <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f8fafc"/>
            <stop offset="35%" stop-color="#94a3b8"/>
            <stop offset="70%" stop-color="#475569"/>
            <stop offset="100%" stop-color="#cbd5e1"/>
          </linearGradient>
          <radialGradient id="dialGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="85%" stop-color="#f1f5f9"/>
            <stop offset="100%" stop-color="#e2e8f0"/>
          </radialGradient>
        </defs>
        <!-- Chrome Bezel Outer Ring -->
        <circle cx="80" cy="80" r="76" fill="url(#bezelGrad)" stroke="#334155" stroke-width="2"/>
        <circle cx="80" cy="80" r="68" fill="#1e293b"/>
        <!-- Inner Clock Face -->
        <circle cx="80" cy="80" r="66" fill="url(#dialGrad)"/>
        
        <!-- Hour Markers (12, 3, 6, 9) -->
        <text x="80" y="32" text-anchor="middle" font-size="14" font-weight="800" fill="#0f172a" font-family="sans-serif">12</text>
        <text x="132" y="85" text-anchor="middle" font-size="14" font-weight="800" fill="#0f172a" font-family="sans-serif">3</text>
        <text x="80" y="138" text-anchor="middle" font-size="14" font-weight="800" fill="#0f172a" font-family="sans-serif">6</text>
        <text x="28" y="85" text-anchor="middle" font-size="14" font-weight="800" fill="#0f172a" font-family="sans-serif">9</text>

        <!-- Hour Hand -->
        <line x1="80" y1="80" x2="80" y2="46" stroke="#0f172a" stroke-width="5" stroke-linecap="round" transform="rotate(${hrAngle} 80 80)"/>
        <!-- Minute Hand -->
        <line x1="80" y1="80" x2="80" y2="34" stroke="#2563eb" stroke-width="3.5" stroke-linecap="round" transform="rotate(${minAngle} 80 80)"/>
        <!-- Center Pin -->
        <circle cx="80" cy="80" r="4.5" fill="#ef4444"/>
        <!-- Glass Glare Arc -->
        <path d="M 30 50 A 60 60 0 0 1 130 50" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.35"/>
      </svg>
    `;
  }

  // 7. Realistic 3D Wooden Cutout Puzzle Shapes
  function puzzleShape(shapeName, size = 80) {
    const s = shapeName.toLowerCase();
    let shapePath = '';
    let c1 = '#38bdf8', c2 = '#0284c7';

    if (s.includes('circle')) {
      shapePath = `<circle cx="50" cy="50" r="38" fill="url(#shGrad_${shapeName})" filter="url(#shDepth)"/>`;
      c1 = '#34d399'; c2 = '#059669';
    } else if (s.includes('square')) {
      shapePath = `<rect x="16" y="16" width="68" height="68" rx="8" fill="url(#shGrad_${shapeName})" filter="url(#shDepth)"/>`;
      c1 = '#818cf8'; c2 = '#4338ca';
    } else if (s.includes('triangle')) {
      shapePath = `<polygon points="50,14 88,84 12,84" fill="url(#shGrad_${shapeName})" filter="url(#shDepth)"/>`;
      c1 = '#f43f5e'; c2 = '#be123c';
    } else { // Star
      shapePath = `<polygon points="50,10 61,38 91,38 67,56 76,84 50,67 24,84 33,56 9,38 39,38" fill="url(#shGrad_${shapeName})" filter="url(#shDepth)"/>`;
      c1 = '#fbbf24'; c2 = '#d97706';
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="real-graphic-svg">
        <defs>
          <linearGradient id="shGrad_${shapeName}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${c1}"/>
            <stop offset="100%" stop-color="${c2}"/>
          </linearGradient>
          <filter id="shDepth">
            <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="rgba(0,0,0,0.5)"/>
          </filter>
        </defs>
        ${shapePath}
        <!-- Top Rim Chamfer Highlight -->
        <circle cx="46" cy="36" r="14" fill="#ffffff" opacity="0.25"/>
      </svg>
    `;
  }

  // 8. Realistic Metallic Glockenspiel Key
  function glockenspielKey(note, colorHex, label = '', height = 210) {
    return `
      <svg width="68" height="${height}" viewBox="0 0 68 210" class="real-graphic-svg" style="filter: drop-shadow(0 8px 14px rgba(0,0,0,0.5));">
        <defs>
          <linearGradient id="metalChime_${note}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${colorHex}"/>
            <stop offset="30%" stop-color="#ffffff"/>
            <stop offset="55%" stop-color="${colorHex}"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
        </defs>
        <!-- Bar Body -->
        <rect x="4" y="6" width="60" height="198" rx="8" fill="url(#metalChime_${note})" stroke="#ffffff" stroke-width="1.2" opacity="0.95"/>
        <!-- Mounting Screws with Rubber Grommets -->
        <circle cx="34" cy="32" r="7" fill="#1e293b"/>
        <circle cx="34" cy="32" r="4.5" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
        <circle cx="34" cy="178" r="7" fill="#1e293b"/>
        <circle cx="34" cy="178" r="4.5" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
        <!-- Engraved Note Letter -->
        <text x="34" y="112" text-anchor="middle" font-size="20" font-weight="800" fill="#ffffff" font-family="sans-serif" style="filter:drop-shadow(0 2px 2px rgba(0,0,0,0.8));">${note}</text>
        <text x="34" y="130" text-anchor="middle" font-size="11" font-weight="700" fill="#f1f5f9" font-family="sans-serif" opacity="0.85">${label}</text>
      </svg>
    `;
  }

  // 9. Realistic Sandwich Layer Component
  function sandwichLayer(layerType) {
    switch (layerType) {
      case 'bread':
        return `
          <svg width="180" height="42" viewBox="0 0 180 42" class="real-graphic-svg" style="filter:drop-shadow(0 4px 6px rgba(0,0,0,0.4));">
            <defs>
              <linearGradient id="breadCrust" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#b45309"/>
                <stop offset="100%" stop-color="#78350f"/>
              </linearGradient>
              <linearGradient id="breadCrumb" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#fef3c7"/>
                <stop offset="100%" stop-color="#fde68a"/>
              </linearGradient>
            </defs>
            <path d="M12 28 C 12 12, 40 4, 90 4 C 140 4, 168 12, 168 28 C 168 36, 140 38, 90 38 C 40 38, 12 36, 12 28 Z" fill="url(#breadCrust)"/>
            <path d="M16 26 C 16 15, 42 8, 90 8 C 138 8, 164 15, 164 26 C 164 33, 138 35, 90 35 C 42 35, 16 33, 16 26 Z" fill="url(#breadCrumb)"/>
          </svg>
        `;
      case 'lettuce':
        return `
          <svg width="190" height="30" viewBox="0 0 190 30" class="real-graphic-svg">
            <path d="M 5 15 Q 25 2, 45 15 Q 65 28, 85 15 Q 105 2, 125 15 Q 145 28, 165 15 Q 180 5, 185 15 Q 170 25, 145 22 Q 105 28, 65 22 Q 25 28, 5 15 Z" fill="#22c55e" stroke="#15803d" stroke-width="2"/>
            <path d="M 25 15 Q 65 10 105 15 Q 145 12 170 15" stroke="#86efac" stroke-width="1.5" fill="none" opacity="0.6"/>
          </svg>
        `;
      case 'tomato':
        return `
          <svg width="170" height="28" viewBox="0 0 170 28" class="real-graphic-svg">
            <ellipse cx="85" cy="14" rx="80" ry="11" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
            <ellipse cx="65" cy="13" rx="14" ry="5" fill="#ef4444"/>
            <ellipse cx="105" cy="13" rx="14" ry="5" fill="#ef4444"/>
            <circle cx="62" cy="13" r="2.5" fill="#fef08a"/>
            <circle cx="108" cy="13" r="2.5" fill="#fef08a"/>
          </svg>
        `;
      case 'cheese':
        return `
          <svg width="175" height="26" viewBox="0 0 175 26" class="real-graphic-svg">
            <polygon points="10,8 165,8 155,22 20,22" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
            <path d="M 35 15 C 38 24, 45 24, 48 15" fill="#f59e0b"/>
          </svg>
        `;
      default:
        return '';
    }
  }

  // 10. Realistic Translucent Iridescent Bubble
  function iridescentBubble(contentHtml = '⭐', size = 80) {
    return `
      <div style="position:relative; width:${size}px; height:${size}px; display:flex; align-items:center; justify-content:center;">
        <svg width="${size}" height="${size}" viewBox="0 0 100 100" style="position:absolute; top:0; left:0; filter:drop-shadow(0 6px 12px rgba(0,240,255,0.3));">
          <defs>
            <radialGradient id="bubbleBody" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stop-color="rgba(255,255,255,0.4)"/>
              <stop offset="50%" stop-color="rgba(0,240,255,0.12)"/>
              <stop offset="85%" stop-color="rgba(168,85,247,0.2)"/>
              <stop offset="100%" stop-color="rgba(0,240,255,0.35)"/>
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="46" fill="url(#bubbleBody)" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
          <!-- Specular Curved Glare -->
          <path d="M 28 32 A 30 30 0 0 1 68 22" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
          <circle cx="34" cy="68" r="4" fill="#ffffff" opacity="0.5"/>
        </svg>
        <span style="position:relative; z-index:2; font-size:${size * 0.42}px;">${contentHtml}</span>
      </div>
    `;
  }

  // 11. Realistic Friendly Puppy Illustration
  function happyPuppy(size = 140) {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 160 160" class="real-graphic-svg" style="filter: drop-shadow(0 8px 16px rgba(0,0,0,0.5));">
        <defs>
          <linearGradient id="furGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fde047"/>
            <stop offset="50%" stop-color="#eab308"/>
            <stop offset="100%" stop-color="#ca8a04"/>
          </linearGradient>
          <linearGradient id="earGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ca8a04"/>
            <stop offset="100%" stop-color="#854d0e"/>
          </linearGradient>
        </defs>
        <!-- Floppy Ears -->
        <path d="M 35 45 C 10 65, 15 110, 32 105 C 45 100, 48 70, 42 45 Z" fill="url(#earGrad)"/>
        <path d="M 125 45 C 150 65, 145 110, 128 105 C 115 100, 112 70, 118 45 Z" fill="url(#earGrad)"/>
        <!-- Head -->
        <circle cx="80" cy="75" r="52" fill="url(#furGrad)"/>
        <!-- Snout Muzzle -->
        <ellipse cx="80" cy="95" rx="26" ry="20" fill="#fef08a"/>
        <!-- Nose -->
        <path d="M 72 86 Q 80 82 88 86 Q 80 98 72 86 Z" fill="#0f172a"/>
        <!-- Mouth & Tongue -->
        <path d="M 74 98 Q 80 104 86 98" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 77 101 C 77 114, 83 114, 83 101 Z" fill="#f43f5e"/>
        <!-- Eyes -->
        <ellipse cx="60" cy="65" rx="8" ry="11" fill="#0f172a"/>
        <circle cx="58" cy="62" r="3.5" fill="#ffffff"/>
        <circle cx="62" cy="69" r="1.5" fill="#ffffff"/>
        <ellipse cx="100" cy="65" rx="8" ry="11" fill="#0f172a"/>
        <circle cx="98" cy="62" r="3.5" fill="#ffffff"/>
        <circle cx="102" cy="69" r="1.5" fill="#ffffff"/>
        <!-- Blue Collar with Gold Tag -->
        <path d="M 45 125 Q 80 140 115 125" fill="none" stroke="#0284c7" stroke-width="9" stroke-linecap="round"/>
        <circle cx="80" cy="136" r="8" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
        <text x="80" y="139" text-anchor="middle" font-size="8" font-weight="900" fill="#78350f">★</text>
      </svg>
    `;
  }

  // 12. Botanical Plant Growth Stages (Magic Garden)
  function botanicalPlant(stage = 0, size = 150) {
    if (stage === 0) { // Seed in Soil Mound
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 160 160" class="real-graphic-svg">
          <defs>
            <linearGradient id="soilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#78350f"/>
              <stop offset="100%" stop-color="#291204"/>
            </linearGradient>
          </defs>
          <ellipse cx="80" cy="120" rx="65" ry="24" fill="url(#soilGrad)"/>
          <ellipse cx="80" cy="115" rx="10" ry="14" fill="#d97706" stroke="#92400e" stroke-width="2"/>
          <circle cx="78" cy="112" r="2" fill="#fde68a"/>
        </svg>
      `;
    } else if (stage === 1) { // Sprout
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 160 160" class="real-graphic-svg">
          <ellipse cx="80" cy="130" rx="65" ry="22" fill="#451a03"/>
          <path d="M 80 130 Q 80 85 80 75" stroke="#22c55e" stroke-width="6" fill="none" stroke-linecap="round"/>
          <path d="M 80 85 C 65 75, 60 90, 80 90 Z" fill="#4ade80"/>
          <path d="M 80 75 C 95 65, 100 80, 80 80 Z" fill="#22c55e"/>
        </svg>
      `;
    } else if (stage === 2) { // Tall Stem with Leaves
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 160 160" class="real-graphic-svg">
          <ellipse cx="80" cy="140" rx="65" ry="18" fill="#451a03"/>
          <path d="M 80 140 Q 76 90 80 45" stroke="#16a34a" stroke-width="7" fill="none" stroke-linecap="round"/>
          <!-- Big Leaves -->
          <path d="M 78 100 C 40 85, 45 115, 78 108 Z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
          <path d="M 82 75 C 120 60, 115 90, 82 83 Z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
          <!-- Bud -->
          <circle cx="80" cy="45" r="14" fill="#15803d"/>
          <circle cx="80" cy="45" r="8" fill="#facc15"/>
        </svg>
      `;
    } else { // Full Blooming Giant Sunflower
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 160 160" class="real-graphic-svg" style="filter: drop-shadow(0 10px 20px rgba(0,0,0,0.6));">
          <defs>
            <radialGradient id="sunDisk" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stop-color="#92400e"/>
              <stop offset="70%" stop-color="#451a03"/>
              <stop offset="100%" stop-color="#1c0a02"/>
            </radialGradient>
            <linearGradient id="petalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#fef08a"/>
              <stop offset="40%" stop-color="#facc15"/>
              <stop offset="100%" stop-color="#ea580c"/>
            </linearGradient>
          </defs>
          <ellipse cx="80" cy="150" rx="55" ry="12" fill="#451a03"/>
          <path d="M 80 150 Q 82 105 80 75" stroke="#15803d" stroke-width="8" fill="none" stroke-linecap="round"/>
          <path d="M 78 115 C 45 105, 50 130, 78 122 Z" fill="#22c55e"/>
          <path d="M 82 95 C 115 85, 110 110, 82 102 Z" fill="#22c55e"/>
          
          <!-- Radiating Golden Petals -->
          <g transform="translate(80, 55)">
            ${Array(12).fill(null).map((_, i) => `
              <ellipse cx="0" cy="-34" rx="9" ry="20" fill="url(#petalGrad)" transform="rotate(${i * 30})" stroke="#ca8a04" stroke-width="1"/>
            `).join('')}
            <!-- Center Seed Disk -->
            <circle cx="0" cy="0" r="24" fill="url(#sunDisk)"/>
            <circle cx="0" cy="0" r="23" stroke="#fef08a" stroke-width="2" stroke-dasharray="2 4" fill="none" opacity="0.6"/>
          </g>
        </svg>
      `;
    }
  }

  // 13. Realistic Classroom / School Tools
  function schoolItem(itemName, size = 64) {
    if (itemName === 'pencil') {
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="real-graphic-svg" style="filter:drop-shadow(0 4px 8px rgba(0,0,0,0.4));">
          <g transform="rotate(-35 50 50)">
            <!-- Eraser -->
            <rect x="42" y="10" width="16" height="15" rx="3" fill="#f43f5e"/>
            <!-- Metal Ferrule -->
            <rect x="41" y="25" width="18" height="10" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
            <line x1="41" y1="28" x2="59" y2="28" stroke="#cbd5e1" stroke-width="1"/>
            <!-- Yellow Pencil Body -->
            <rect x="42" y="35" width="16" height="42" fill="#fbbf24"/>
            <line x1="47" y1="35" x2="47" y2="77" stroke="#f59e0b" stroke-width="2"/>
            <line x1="53" y1="35" x2="53" y2="77" stroke="#d97706" stroke-width="2"/>
            <!-- Cedar Wood Tip -->
            <polygon points="42,77 58,77 50,92" fill="#fde68a"/>
            <!-- Graphite Core -->
            <polygon points="48,87 52,87 50,92" fill="#1e293b"/>
          </g>
        </svg>
      `;
    } else if (itemName === 'backpack') {
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="real-graphic-svg" style="filter:drop-shadow(0 6px 12px rgba(0,0,0,0.5));">
          <defs>
            <linearGradient id="packGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#3b82f6"/>
              <stop offset="100%" stop-color="#1d4ed8"/>
            </linearGradient>
          </defs>
          <!-- Top Grab Loop -->
          <path d="M 40 25 C 40 10, 60 10, 60 25" stroke="#1e3a8a" stroke-width="5" fill="none"/>
          <!-- Main Body -->
          <rect x="22" y="24" width="56" height="64" rx="16" fill="url(#packGrad)" stroke="#1e40af" stroke-width="2"/>
          <!-- Front Pocket -->
          <rect x="30" y="52" width="40" height="30" rx="8" fill="#1e40af" stroke="#60a5fa" stroke-width="1.5"/>
          <!-- Zipper -->
          <line x1="32" y1="58" x2="68" y2="58" stroke="#facc15" stroke-width="2"/>
          <!-- Buckles -->
          <circle cx="36" cy="40" r="3" fill="#cbd5e1"/>
          <circle cx="64" cy="40" r="3" fill="#cbd5e1"/>
        </svg>
      `;
    } else { // Classroom Clock
      return analogClock(10, 10, size);
    }
  }

  // 14. Eco-friendly Recycling Bins
  function recyclingBin(binType, size = 110) {
    let color = '#3b82f6', dark = '#1d4ed8', emblem = '♻️', label = 'Recycle';
    if (binType === 'compost') {
      color = '#22c55e'; dark = '#15803d'; emblem = '🌱'; label = 'Compost';
    } else if (binType === 'trash') {
      color = '#64748b'; dark = '#334155'; emblem = '🗑️'; label = 'Trash';
    }

    return `
      <svg width="${size}" height="${size * 1.3}" viewBox="0 0 100 130" class="real-graphic-svg" style="filter:drop-shadow(0 8px 16px rgba(0,0,0,0.5));">
        <defs>
          <linearGradient id="binGrad_${binType}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${color}"/>
            <stop offset="40%" stop-color="#ffffff" stop-opacity="0.3"/>
            <stop offset="70%" stop-color="${color}"/>
            <stop offset="100%" stop-color="${dark}"/>
          </linearGradient>
        </defs>
        <!-- Bin Lid -->
        <rect x="15" y="14" width="70" height="14" rx="6" fill="${dark}" stroke="#cbd5e1" stroke-width="1"/>
        <rect x="38" y="8" width="24" height="8" rx="3" fill="${dark}"/>
        <!-- Tapered Bin Body -->
        <polygon points="20,28 80,28 72,118 28,118" fill="url(#binGrad_${binType})" stroke="${dark}" stroke-width="2"/>
        <!-- Texture Grooves -->
        <line x1="38" y1="35" x2="38" y2="105" stroke="${dark}" stroke-width="2" opacity="0.4"/>
        <line x1="50" y1="35" x2="50" y2="105" stroke="${dark}" stroke-width="2" opacity="0.4"/>
        <line x1="62" y1="35" x2="62" y2="105" stroke="${dark}" stroke-width="2" opacity="0.4"/>
        <!-- Emblem -->
        <text x="50" y="75" text-anchor="middle" font-size="20">${emblem}</text>
        <text x="50" y="96" text-anchor="middle" font-size="10" font-weight="800" fill="#ffffff" font-family="sans-serif">${label}</text>
      </svg>
    `;
  }

  // 15. Realistic Waste Objects (Clean Planet)
  function wasteObject(itemType, size = 64) {
    if (itemType === 'bottle') {
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 80 80" class="real-graphic-svg">
          <defs>
            <linearGradient id="petGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.6"/>
              <stop offset="35%" stop-color="#ffffff" stop-opacity="0.9"/>
              <stop offset="70%" stop-color="#0284c7" stop-opacity="0.5"/>
              <stop offset="100%" stop-color="#0369a1" stop-opacity="0.7"/>
            </linearGradient>
          </defs>
          <!-- Blue Cap -->
          <rect x="34" y="6" width="12" height="8" rx="2" fill="#2563eb"/>
          <!-- Neck -->
          <rect x="36" y="14" width="8" height="6" fill="url(#petGrad)"/>
          <!-- Bottle Body -->
          <rect x="26" y="20" width="28" height="52" rx="7" fill="url(#petGrad)" stroke="#bae6fd" stroke-width="1.5"/>
          <line x1="28" y1="36" x2="52" y2="36" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
          <line x1="28" y1="52" x2="52" y2="52" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
        </svg>
      `;
    } else if (itemType === 'banana') {
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 80 80" class="real-graphic-svg">
          <path d="M 20 60 C 25 30, 50 15, 68 20 C 60 35, 45 65, 20 60 Z" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
          <path d="M 68 20 L 74 16" stroke="#854d0e" stroke-width="4" stroke-linecap="round"/>
          <circle cx="20" cy="60" r="3" fill="#854d0e"/>
        </svg>
      `;
    } else { // Broken Crayon
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 80 80" class="real-graphic-svg">
          <rect x="22" y="28" width="36" height="20" fill="#f43f5e" stroke="#be123c" stroke-width="1.5"/>
          <!-- Crayon Wrapper Label -->
          <rect x="28" y="28" width="24" height="20" fill="#1e293b"/>
          <ellipse cx="40" cy="38" rx="6" ry="6" fill="#f43f5e"/>
          <!-- Broken Jagged Tip -->
          <polygon points="58,28 72,38 58,48" fill="#e11d48"/>
        </svg>
      `;
    }
  }

  // 16. Realistic Supermarket Products
  function supermarketProduct(productName, size = 70) {
    const p = productName.toLowerCase();
    if (p.includes('milk')) {
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 80 80" class="real-graphic-svg">
          <defs>
            <linearGradient id="milkCarton" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#f8fafc"/>
              <stop offset="100%" stop-color="#cbd5e1"/>
            </linearGradient>
          </defs>
          <polygon points="26,20 40,8 54,20" fill="#38bdf8"/>
          <rect x="26" y="20" width="28" height="50" rx="3" fill="url(#milkCarton)" stroke="#94a3b8" stroke-width="1.5"/>
          <rect x="26" y="38" width="28" height="14" fill="#0284c7"/>
          <text x="40" y="48" text-anchor="middle" font-size="8" font-weight="800" fill="#ffffff">MILK</text>
        </svg>
      `;
    } else if (p.includes('bread')) {
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 80 80" class="real-graphic-svg">
          <path d="M 16 45 C 16 25, 64 25, 64 45 C 64 58, 16 58, 16 45 Z" fill="#b45309" stroke="#78350f" stroke-width="2"/>
          <ellipse cx="40" cy="46" rx="20" ry="8" fill="#fde68a"/>
          <!-- Crust Score Cuts -->
          <line x1="28" y1="32" x2="34" y2="42" stroke="#78350f" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="40" y1="30" x2="44" y2="42" stroke="#78350f" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="50" y1="32" x2="54" y2="42" stroke="#78350f" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      `;
    } else if (p.includes('apple')) {
      return apple(size);
    } else if (p.includes('carrot')) {
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 80 80" class="real-graphic-svg">
          <polygon points="28,25 52,25 40,70" fill="#ea580c" stroke="#c2410c" stroke-width="1.5"/>
          <path d="M 38 25 C 32 10, 36 6, 38 6" stroke="#16a34a" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M 40 25 C 40 8, 42 6, 44 8" stroke="#22c55e" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M 42 25 C 48 10, 46 6, 44 6" stroke="#16a34a" stroke-width="3" fill="none" stroke-linecap="round"/>
        </svg>
      `;
    } else if (p.includes('candy')) {
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 80 80" class="real-graphic-svg">
          <!-- Wrapper Twists -->
          <polygon points="12,30 26,40 12,50" fill="#f43f5e"/>
          <polygon points="68,30 54,40 68,50" fill="#f43f5e"/>
          <!-- Sweet Center -->
          <circle cx="40" cy="40" r="16" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
          <path d="M 32 30 Q 40 40 48 50" stroke="#f43f5e" stroke-width="3" fill="none"/>
        </svg>
      `;
    } else { // Juice
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 80 80" class="real-graphic-svg">
          <rect x="28" y="24" width="24" height="46" rx="4" fill="#fb923c" stroke="#ea580c" stroke-width="1.5"/>
          <line x1="38" y1="12" x2="38" y2="24" stroke="#fde047" stroke-width="3" stroke-linecap="round"/>
          <ellipse cx="40" cy="45" rx="8" ry="8" fill="#ffffff" opacity="0.3"/>
        </svg>
      `;
    }
  }

  // 17. Realistic Pet Care Items
  function petCareItem(itemType, size = 70) {
    if (itemType.includes('bone')) {
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 80 80" class="real-graphic-svg">
          <rect x="24" y="34" width="32" height="12" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
          <circle cx="22" cy="33" r="7" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
          <circle cx="22" cy="47" r="7" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
          <circle cx="58" cy="33" r="7" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
          <circle cx="58" cy="47" r="7" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        </svg>
      `;
    } else if (itemType.includes('water')) {
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 80 80" class="real-graphic-svg">
          <ellipse cx="40" cy="48" rx="32" ry="16" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
          <ellipse cx="40" cy="44" rx="26" ry="11" fill="#38bdf8"/>
          <circle cx="34" cy="42" r="3" fill="#ffffff" opacity="0.6"/>
        </svg>
      `;
    } else if (itemType.includes('soap')) {
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 80 80" class="real-graphic-svg">
          <rect x="20" y="30" width="40" height="24" rx="8" fill="#f472b6" stroke="#db2777" stroke-width="2"/>
          <ellipse cx="36" cy="38" rx="8" ry="4" fill="#ffffff" opacity="0.4"/>
          <!-- Bubbles -->
          <circle cx="48" cy="22" r="6" fill="#38bdf8" opacity="0.5"/>
          <circle cx="58" cy="18" r="4" fill="#38bdf8" opacity="0.5"/>
        </svg>
      `;
    } else { // Hug Heart
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 80 80" class="real-graphic-svg" style="filter:drop-shadow(0 4px 10px rgba(244,63,94,0.6));">
          <path d="M 40 68 C 15 48, 10 24, 25 18 C 35 14, 40 24, 40 24 C 40 24, 45 14, 55 18 C 70 24, 65 48, 40 68 Z" fill="#f43f5e" stroke="#be123c" stroke-width="2"/>
          <ellipse cx="28" cy="24" rx="4" ry="7" transform="rotate(-30 28 24)" fill="#ffffff" opacity="0.4"/>
        </svg>
      `;
    }
  }

  // 18. Realistic Weather Illustrations
  function weatherIllustration(weatherType, size = 90) {
    const w = weatherType.toLowerCase();
    if (w.includes('rain')) {
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="real-graphic-svg">
          <defs>
            <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#94a3b8"/>
              <stop offset="100%" stop-color="#475569"/>
            </linearGradient>
          </defs>
          <!-- Dark Storm Cloud -->
          <ellipse cx="50" cy="40" rx="30" ry="16" fill="url(#cloudGrad)"/>
          <circle cx="36" cy="34" r="14" fill="url(#cloudGrad)"/>
          <circle cx="56" cy="30" r="18" fill="url(#cloudGrad)"/>
          <!-- Glowing Raindrops -->
          <line x1="36" y1="62" x2="30" y2="76" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
          <line x1="50" y1="62" x2="44" y2="76" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
          <line x1="64" y1="62" x2="58" y2="76" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
        </svg>
      `;
    } else if (w.includes('snow') || w.includes('cold')) {
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="real-graphic-svg">
          <!-- Snowflake -->
          <g stroke="#38bdf8" stroke-width="3" stroke-linecap="round" transform="translate(50,50)">
            <line x1="0" y1="-32" x2="0" y2="32"/>
            <line x1="-28" y1="-16" x2="28" y2="16"/>
            <line x1="-28" y1="16" x2="28" y2="-16"/>
            <circle cx="0" cy="0" r="4" fill="#ffffff"/>
          </g>
        </svg>
      `;
    } else { // Sunny
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="real-graphic-svg" style="filter:drop-shadow(0 0 18px rgba(251,191,36,0.6));">
          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#fef08a"/>
              <stop offset="60%" stop-color="#facc15"/>
              <stop offset="100%" stop-color="#ea580c"/>
            </radialGradient>
          </defs>
          <!-- Radiating Solar Rays -->
          <g stroke="#f59e0b" stroke-width="3" stroke-linecap="round">
            ${Array(8).fill(null).map((_, i) => `
              <line x1="50" y1="12" x2="50" y2="22" transform="rotate(${i * 45} 50 50)"/>
            `).join('')}
          </g>
          <!-- Core Sphere -->
          <circle cx="50" cy="50" r="22" fill="url(#sunGlow)"/>
          <circle cx="44" cy="44" r="5" fill="#ffffff" opacity="0.6"/>
        </svg>
      `;
    }
  }

  return {
    apple,
    orange,
    basket,
    trafficLight,
    roadCrossing,
    analogClock,
    puzzleShape,
    glockenspielKey,
    sandwichLayer,
    iridescentBubble,
    happyPuppy,
    botanicalPlant,
    schoolItem,
    recyclingBin,
    wasteObject,
    supermarketProduct,
    petCareItem,
    weatherIllustration
  };
})();
