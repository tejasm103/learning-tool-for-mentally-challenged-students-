/**
 * MINDVERSE — INCLUSIVE LEARNING LAB
 * Interactive 3D WebGL Virtual Classroom
 * Faithful recreation of the 3D Classroom aesthetic:
 * - Soft pastel mint green walls
 * - Warm terracotta/peach wooden plank floor
 * - Front chalkboard with physics, chemistry & math diagrams
 * - Teacher desk with red apple and rotating globe
 * - Astronomical brass telescope on wooden tripod
 * - Right wall tall windows with white Venetian blinds and sunbeams
 * - Left wall orange-brown door and colorful coat hook rack with backpacks
 * - Foreground blue student backpack on the floor
 * - Rows of wooden student desks with under-desk cubby shelves, chairs, notebooks & pencil cases
 * - Full interactive navigation to all 15 MindVerse learning stations!
 */

function initClassroom3D() {
  const canvas = document.getElementById('classroom-canvas');
  if (!canvas) return;

  if (typeof THREE === 'undefined') {
    console.warn('[MindVerse 3D] Three.js not loaded, switching to 2D Classroom');
    toggle2DFallback(true);
    return;
  }

  const container = canvas.parentElement;
  let width = container.clientWidth || window.innerWidth;
  let height = container.clientHeight || window.innerHeight;

  // 1. Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd7eee8); // Soft warm ambient mint sky tint

  const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
  // Match the student back-row perspective of the reference image:
  // Elevated slightly, looking straight towards chalkboard, teacher desk and windows
  camera.position.set(-1.5, 6.8, 17.5);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  } catch (e) {
    console.warn('[MindVerse 3D] WebGL not supported, activating 2D Classroom fallback.');
    toggle2DFallback(true);
    return;
  }

  // 2. Orbit Controls
  let controls;
  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.02; // Prevent going below floor
    controls.minDistance = 4;
    controls.maxDistance = 35;
    controls.target.set(0, 5.0, -4.0); // Target center of the classroom desks & chalkboard
  }

  // 3. Lighting (Warm sunny classroom atmosphere as in reference image)
  const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.95); // Warm cream ambient fill
  scene.add(ambientLight);

  // Warm golden sun streaming in from right wall windows
  const sunLight = new THREE.DirectionalLight(0xffecd1, 1.4);
  sunLight.position.set(28, 22, -2);
  sunLight.target.position.set(-2, 2, 4);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 60;
  sunLight.shadow.camera.left = -20;
  sunLight.shadow.camera.right = 20;
  sunLight.shadow.camera.top = 20;
  sunLight.shadow.camera.bottom = -20;
  sunLight.shadow.bias = -0.001;
  scene.add(sunLight);
  scene.add(sunLight.target);

  // Soft sky fill light from top-left
  const fillLight = new THREE.DirectionalLight(0xcce7e1, 0.45);
  fillLight.position.set(-20, 16, 12);
  scene.add(fillLight);

  // 4. Procedural Textures (Wooden Floor & Chalkboard)
  function createWoodFloorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base warm peach/terracotta tone
    ctx.fillStyle = '#dc845f';
    ctx.fillRect(0, 0, 1024, 1024);

    const plankColors = ['#d57a55', '#dc845f', '#cc704b', '#e28d67', '#cf734f'];
    const plankHeight = 64;

    for (let y = 0; y < 1024; y += plankHeight) {
      const col = plankColors[Math.floor((y / plankHeight) % plankColors.length)];
      ctx.fillStyle = col;
      ctx.fillRect(0, y, 1024, plankHeight);

      // Subtle wood grain lines
      ctx.strokeStyle = 'rgba(120, 53, 15, 0.12)';
      ctx.lineWidth = 1.5;
      for (let g = 0; g < 4; g++) {
        const gy = y + 8 + g * 14;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.bezierCurveTo(300, gy + Math.sin(y) * 4, 700, gy - Math.cos(y) * 4, 1024, gy);
        ctx.stroke();
      }

      // Dark plank seam line
      ctx.strokeStyle = '#853e1d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 4);
    return texture;
  }

  function createChalkboardTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Deep matte chalkboard green
    ctx.fillStyle = '#214e3b';
    ctx.fillRect(0, 0, 2048, 1024);

    // Subtle natural chalk dust smudges
    const grad = ctx.createRadialGradient(1024, 512, 100, 1024, 512, 900);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.12)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Subtle eraser streaks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 60;
    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(200 + i * 280, 200);
      ctx.bezierCurveTo(300 + i * 280, 500, 150 + i * 280, 700, 250 + i * 280, 900);
      ctx.stroke();
    }

    // Chalk line style
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Organic Chemical Molecule (Top Left)
    ctx.font = '24px sans-serif';
    function drawHexagon(cx, cy, r) {
      ctx.beginPath();
      for (let a = 0; a < 6; a++) {
        const angle = (a * Math.PI) / 3;
        const hx = cx + r * Math.cos(angle);
        const hy = cy + r * Math.sin(angle);
        if (a === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
    }

    drawHexagon(240, 220, 60);
    drawHexagon(330, 270, 50);
    ctx.beginPath();
    ctx.moveTo(240, 160);
    ctx.lineTo(240, 110);
    ctx.stroke();
    ctx.fillText('OH', 225, 95);

    ctx.beginPath();
    ctx.moveTo(190, 250);
    ctx.lineTo(140, 280);
    ctx.stroke();
    ctx.fillText('CH₃', 90, 290);

    // 2. Physics Inclined Plane & Kinematic Formula (Center)
    // Triangle wedge
    ctx.beginPath();
    ctx.moveTo(560, 480);
    ctx.lineTo(1050, 480);
    ctx.lineTo(1050, 240);
    ctx.closePath();
    ctx.stroke();

    // Sliding Block on incline
    ctx.save();
    ctx.translate(780, 370);
    ctx.rotate(-0.45);
    ctx.strokeRect(-40, -30, 80, 50);
    // Force arrow
    ctx.strokeStyle = '#fef08a';
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(60, 0);
    ctx.stroke();
    ctx.fillText('mg sin θ', 70, 5);
    ctx.restore();

    // Kinematics formulas
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Segoe UI", sans-serif';
    ctx.fillText('s = ut + ½ at²', 720, 560);
    ctx.font = '26px "Segoe UI", sans-serif';
    ctx.fillText('v² = u² + 2as', 750, 615);
    ctx.fillText('F = m · a', 780, 665);

    // 3. Horseshoe Magnet with Magnetic Field Lines (Lower Center)
    ctx.strokeStyle = '#f87171'; // Red magnet arm
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(600, 780, 50, Math.PI, 0, false);
    ctx.lineTo(650, 860);
    ctx.moveTo(550, 780);
    ctx.lineTo(550, 860);
    ctx.stroke();

    // Silver poles
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(550, 860);
    ctx.lineTo(550, 885);
    ctx.moveTo(650, 860);
    ctx.lineTo(650, 885);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('N', 542, 880);
    ctx.fillText('S', 642, 880);

    // Magnetic flux dotted lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 8]);
    for (let m = 1; m <= 3; m++) {
      ctx.beginPath();
      ctx.bezierCurveTo(550, 890 + m * 20, 600, 930 + m * 30, 650, 890 + m * 20);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 4. Geometry & Science Equations (Right Area)
    ctx.strokeStyle = '#67e8f9';
    ctx.fillStyle = '#67e8f9';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(1350, 360);
    ctx.lineTo(1650, 360);
    ctx.lineTo(1520, 180);
    ctx.closePath();
    ctx.stroke();
    ctx.fillText('α', 1380, 345);
    ctx.fillText('β', 1610, 345);
    ctx.fillText('γ', 1510, 230);
    ctx.fillText('α + β + γ = 180°', 1380, 420);

    // Coordinate sine wave
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(1350, 620);
    ctx.lineTo(1750, 620);
    ctx.moveTo(1400, 500);
    ctx.lineTo(1400, 740);
    ctx.stroke();

    ctx.strokeStyle = '#facc15';
    ctx.beginPath();
    for (let x = 0; x <= 300; x += 10) {
      const y = Math.sin((x / 300) * Math.PI * 4) * 60;
      if (x === 0) ctx.moveTo(1400 + x, 620 - y);
      else ctx.lineTo(1400 + x, 620 - y);
    }
    ctx.stroke();
    ctx.fillText('y = A sin(ωt)', 1520, 710);

    // Top Header Banner
    ctx.fillStyle = '#a7f3d0';
    ctx.font = 'bold 38px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌟 MINDVERSE INCLUSIVE LEARNING LAB 🌟', 1024, 80);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // 5. Build Room Shell (Floor, Ceiling, Walls, Trim)
  const roomGroup = new THREE.Group();
  scene.add(roomGroup);

  // A. Floor
  const floorGeo = new THREE.PlaneGeometry(28, 30);
  const floorMat = new THREE.MeshStandardMaterial({
    map: createWoodFloorTexture(),
    roughness: 0.55,
    metalness: 0.1
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  roomGroup.add(floor);

  // B. Soft Mint Walls
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x9ec8b9, // Exact mint green from image
    roughness: 0.85,
    metalness: 0.05
  });

  // Front Wall (Chalkboard Wall)
  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(28, 13), wallMat);
  frontWall.position.set(0, 6.5, -15);
  frontWall.receiveShadow = true;
  roomGroup.add(frontWall);

  // Left Wall (Door & Coat Hooks)
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(30, 13), wallMat);
  leftWall.position.set(-14, 6.5, 0);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.receiveShadow = true;
  roomGroup.add(leftWall);

  // Right Wall (Window Wall)
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(30, 13), wallMat);
  rightWall.position.set(14, 6.5, 0);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.receiveShadow = true;
  roomGroup.add(rightWall);

  // C. Ceiling
  const ceilingGeo = new THREE.PlaneGeometry(28, 30);
  const ceilingMat = new THREE.MeshStandardMaterial({
    color: 0xfceee0, // Soft warm cream ceiling
    roughness: 0.95
  });
  const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
  ceiling.position.y = 13;
  ceiling.rotation.x = Math.PI / 2;
  roomGroup.add(ceiling);

  // D. Baseboards / Skirting
  const baseboardMat = new THREE.MeshStandardMaterial({ color: 0x9a4d2c, roughness: 0.6 });
  const bbFront = new THREE.Mesh(new THREE.BoxGeometry(28, 0.4, 0.1), baseboardMat);
  bbFront.position.set(0, 0.2, -14.95);
  roomGroup.add(bbFront);

  const bbLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 30), baseboardMat);
  bbLeft.position.set(-13.95, 0.2, 0);
  roomGroup.add(bbLeft);

  const bbRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 30), baseboardMat);
  bbRight.position.set(13.95, 0.2, 0);
  roomGroup.add(bbRight);

  // E. Ceiling Light Fixtures (3 pairs as in image)
  const fixtureWoodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.8
  });

  const lightPositions = [-7, 0, 7];
  lightPositions.forEach(x => {
    const fixtureGroup = new THREE.Group();
    fixtureGroup.position.set(x, 12.8, -4);

    // Wood mount block
    const mount = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.3, 3.8), fixtureWoodMat);
    fixtureGroup.add(mount);

    // Two white glowing tubes
    const tube1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.4, 16), tubeMat);
    tube1.rotation.x = Math.PI / 2;
    tube1.position.set(-0.4, -0.22, 0);
    fixtureGroup.add(tube1);

    const tube2 = tube1.clone();
    tube2.position.set(0.4, -0.22, 0);
    fixtureGroup.add(tube2);

    roomGroup.add(fixtureGroup);

    // Gentle overhead point light
    const overheadLight = new THREE.PointLight(0xfff7ed, 0.35, 12);
    overheadLight.position.set(x, 12, -4);
    scene.add(overheadLight);
  });

  // 6. Large Green Chalkboard with Warm Oak Frame
  const boardGroup = new THREE.Group();
  boardGroup.position.set(0, 7.2, -14.85);

  // Oak Frame
  const frameGeo = new THREE.BoxGeometry(16.4, 8.4, 0.25);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xc26a38, roughness: 0.6 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.castShadow = true;
  boardGroup.add(frame);

  // Chalkboard Surface Canvas
  const boardCanvasMat = new THREE.MeshStandardMaterial({
    map: createChalkboardTexture(),
    roughness: 0.85,
    metalness: 0.05
  });
  const boardSurface = new THREE.Mesh(new THREE.PlaneGeometry(15.8, 7.8), boardCanvasMat);
  boardSurface.position.z = 0.14;
  boardSurface.userData = { id: 'chalkboard', name: 'Smart Chalkboard & 115-Q Master Quiz', url: 'quiz.html' };
  boardGroup.add(boardSurface);

  // Chalk Tray on Bottom Frame
  const trayGeo = new THREE.BoxGeometry(16.0, 0.15, 0.6);
  const tray = new THREE.Mesh(trayGeo, frameMat);
  tray.position.set(0, -4.15, 0.3);
  boardGroup.add(tray);

  // Chalk sticks & Felt eraser in tray
  const eraser = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.12, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 })
  );
  eraser.position.set(2.5, -4.0, 0.3);
  boardGroup.add(eraser);

  const whiteChalk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.4),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  whiteChalk.rotation.z = Math.PI / 2;
  whiteChalk.position.set(1.2, -4.0, 0.3);
  boardGroup.add(whiteChalk);

  scene.add(boardGroup);

  // 7. Teacher Desk, Apple & Educational Globe (Front-Right of Chalkboard)
  const teacherArea = new THREE.Group();
  teacherArea.position.set(3.8, 0, -10.5);

  const deskWoodMat = new THREE.MeshStandardMaterial({ color: 0xdca072, roughness: 0.65 });

  // Main Desktop
  const tDesktop = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.28, 2.6), deskWoodMat);
  tDesktop.position.y = 3.6;
  tDesktop.castShadow = true;
  tDesktop.receiveShadow = true;
  teacherArea.add(tDesktop);

  // Front Modesty Panel
  const tFrontPanel = new THREE.Mesh(new THREE.BoxGeometry(5.4, 3.4, 0.15), deskWoodMat);
  tFrontPanel.position.set(0, 1.7, -1.15);
  tFrontPanel.castShadow = true;
  teacherArea.add(tFrontPanel);

  // Side Support Legs
  const tSideLeft = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.4, 2.4), deskWoodMat);
  tSideLeft.position.set(-2.6, 1.7, 0);
  tSideLeft.castShadow = true;
  teacherArea.add(tSideLeft);

  const tSideRight = tSideLeft.clone();
  tSideRight.position.set(2.6, 1.7, 0);
  teacherArea.add(tSideRight);

  // A. Glossy Red Apple on Teacher's Desk (Exact detail from image)
  const appleGroup = new THREE.Group();
  appleGroup.position.set(-1.2, 3.75, 0.2);

  const appleMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.25,
    metalness: 0.1
  });
  const appleBody = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 24), appleMat);
  appleBody.scale.set(1, 0.9, 1);
  appleBody.castShadow = true;
  appleGroup.add(appleBody);

  const appleStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x78350f })
  );
  appleStem.position.set(0, 0.26, 0);
  appleStem.rotation.z = -0.2;
  appleGroup.add(appleStem);

  const appleLeaf = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0x22c55e })
  );
  appleLeaf.scale.set(1.5, 0.3, 0.7);
  appleLeaf.position.set(0.08, 0.28, 0);
  appleLeaf.rotation.z = 0.4;
  appleGroup.add(appleLeaf);

  appleGroup.userData = { id: 'health', name: 'Nutrition & Health Station', url: 'body_parts.html' };
  teacherArea.add(appleGroup);

  // B. Educational Globe on Rotating Stand
  const globeGroup = new THREE.Group();
  globeGroup.position.set(0.8, 3.75, 0.1);

  // Brass Base & Curved Meridian Arc
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.75, roughness: 0.3 });
  const globeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.08, 24), brassMat);
  globeBase.position.y = 0.04;
  globeGroup.add(globeBase);

  const globeStem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.35), brassMat);
  globeStem.position.y = 0.24;
  globeGroup.add(globeStem);

  const meridianArc = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.04, 16, 32, Math.PI * 1.2), brassMat);
  meridianArc.rotation.z = 0.4;
  meridianArc.position.set(0, 0.85, 0);
  globeGroup.add(meridianArc);

  // Earth Globe Sphere
  const globeSphereMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Oceans
    roughness: 0.5,
    metalness: 0.1
  });
  const globeSphere = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), globeSphereMat);
  globeSphere.position.set(0, 0.85, 0);
  globeSphere.castShadow = true;

  // Continents on globe
  const continentMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 });
  for (let c = 0; c < 5; c++) {
    const cont = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), continentMat);
    cont.scale.set(1.2, 0.8, 0.15);
    cont.position.set(Math.sin(c * 1.3) * 0.48, Math.cos(c * 1.5) * 0.4, Math.cos(c * 1.3) * 0.48);
    globeSphere.add(cont);
  }
  globeGroup.add(globeSphere);
  globeGroup.globeSphere = globeSphere;

  globeGroup.userData = { id: 'geography', name: 'World Geography & Vocabulary', url: 'alphabet.html#vocab' };
  teacherArea.add(globeGroup);

  scene.add(teacherArea);

  // 8. Astronomical Telescope on Wooden Tripod (Behind Teacher Desk)
  const telescopeGroup = new THREE.Group();
  telescopeGroup.position.set(8.2, 0, -11.5);

  const legWoodMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.6 });
  const tubeGoldMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.2 });
  const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.25 });

  // 3 Tripod Legs
  for (let l = 0; l < 3; l++) {
    const angle = (l * Math.PI * 2) / 3;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 4.4), legWoodMat);
    leg.position.set(Math.sin(angle) * 0.85, 2.1, Math.cos(angle) * 0.85);
    leg.rotation.x = Math.cos(angle) * 0.25;
    leg.rotation.z = -Math.sin(angle) * 0.25;
    leg.castShadow = true;
    telescopeGroup.add(leg);
  }

  // Telescope Mount & Head
  const mountHead = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.4), goldTrimMat);
  mountHead.position.y = 4.2;
  telescopeGroup.add(mountHead);

  // Telescope Barrel (Angled upwards toward the right windows)
  const barrelGroup = new THREE.Group();
  barrelGroup.position.set(0, 4.4, 0);
  barrelGroup.rotation.z = -0.35;
  barrelGroup.rotation.y = 0.3;

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 3.2, 24), tubeGoldMat);
  barrel.rotation.z = Math.PI / 2;
  barrel.castShadow = true;
  barrelGroup.add(barrel);

  // Gold Trim Rings
  const ring1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.15, 24), goldTrimMat);
  ring1.rotation.z = Math.PI / 2;
  ring1.position.x = 0.8;
  barrelGroup.add(ring1);

  const ring2 = ring1.clone();
  ring2.position.x = -0.8;
  barrelGroup.add(ring2);

  // Front Objective Lens Hood
  const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.19, 0.5, 24), goldTrimMat);
  hood.rotation.z = Math.PI / 2;
  hood.position.x = 1.6;
  barrelGroup.add(hood);

  // Eyepiece
  const eyepiece = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5), goldTrimMat);
  eyepiece.rotation.z = Math.PI / 2;
  eyepiece.position.x = -1.75;
  barrelGroup.add(eyepiece);

  telescopeGroup.add(barrelGroup);
  telescopeGroup.userData = { id: 'science', name: 'Astronomy & Stories Station', url: 'stories.html' };
  scene.add(telescopeGroup);

  // 9. Left Wall: Orange-Brown Door & Colorful Coat Hook Rack
  // A. Classroom Door
  const doorGroup = new THREE.Group();
  doorGroup.position.set(-13.9, 0, -6.0);

  const doorWoodMat = new THREE.MeshStandardMaterial({ color: 0xb44820, roughness: 0.65 });
  const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.7 });

  // Outer Casing
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 9.4, 4.6), doorFrameMat);
  doorFrame.position.set(0, 4.7, 0);
  doorGroup.add(doorFrame);

  // Door Panel
  const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 9.0, 4.2), doorWoodMat);
  doorPanel.position.set(0.02, 4.6, 0);
  doorGroup.add(doorPanel);

  // Recessed Vertical Window Pane
  const doorGlass = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 4.0, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.7 })
  );
  doorGlass.position.set(0.02, 5.6, 0);
  doorGroup.add(doorGlass);

  // Silver Door Knob
  const doorKnob = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 })
  );
  doorKnob.position.set(0.12, 4.2, 1.5);
  doorGroup.add(doorKnob);

  doorGroup.userData = { id: 'door', name: 'School Corridor & Routine Portal', url: 'index.html' };
  scene.add(doorGroup);

  // B. Colorful Coat Hook Peg Rack (Yellow/Red/Cyan board as in image)
  const rackGroup = new THREE.Group();
  rackGroup.position.set(-13.9, 7.5, 4.5);

  const yellowBoard = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.9, 1.4),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.6 })
  );
  yellowBoard.position.z = -1.4;
  rackGroup.add(yellowBoard);

  const redBoard = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.9, 1.4),
    new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.6 })
  );
  redBoard.position.z = 0;
  rackGroup.add(redBoard);

  const blueBoard = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.9, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.6 })
  );
  blueBoard.position.z = 1.4;
  rackGroup.add(blueBoard);

  // Hanging Purple Shirt/Hoodie on Hook
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.8 });
  const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.8, 1.0), shirtMat);
  shirt.position.set(0.18, -1.0, -1.4);
  shirt.castShadow = true;
  rackGroup.add(shirt);

  // Hanging Teal Backpack on Hook
  const tealPack = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 1.9, 1.1),
    new THREE.MeshStandardMaterial({ color: 0x0d9488, roughness: 0.7 })
  );
  tealPack.position.set(0.24, -1.0, 0);
  tealPack.castShadow = true;
  rackGroup.add(tealPack);

  rackGroup.userData = { id: 'wardrobe', name: 'Daily Routine & Self-Care', url: 'body_parts.html' };
  scene.add(rackGroup);

  // C. Blue Student Backpack on Floor in Foreground Corner (Exact image detail)
  const floorBagGroup = new THREE.Group();
  floorBagGroup.position.set(-10.5, 0, 11.5);
  floorBagGroup.rotation.y = 0.35;

  const bagBlueMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.7 });
  const bagYellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.6 });

  // Main Bag Body
  const bagBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 0.9), bagBlueMat);
  bagBody.position.y = 0.8;
  bagBody.castShadow = true;
  floorBagGroup.add(bagBody);

  // Front Pocket
  const bagFrontPocket = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.35), bagYellowMat);
  bagFrontPocket.position.set(0, 0.55, 0.55);
  bagFrontPocket.castShadow = true;
  floorBagGroup.add(bagFrontPocket);

  // Top Handle Loop
  const bagLoop = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.05, 12, 16, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x1e3a8a })
  );
  bagLoop.position.set(0, 1.6, 0);
  floorBagGroup.add(bagLoop);

  floorBagGroup.userData = { id: 'backpack', name: 'School Bag & Safety Station', url: 'traffic.html' };
  scene.add(floorBagGroup);

  // 10. Right Wall: Two Tall Windows with White Venetian Blinds & Sunlight
  const windowGroup = new THREE.Group();
  windowGroup.position.set(13.9, 6.5, 0);

  const windowWoodMat = new THREE.MeshStandardMaterial({ color: 0xc26a38, roughness: 0.6 });
  const blindMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.5,
    metalness: 0.1
  });

  const windowZPositions = [-6.5, 4.5];
  windowZPositions.forEach(wz => {
    // Window Casing Frame
    const wFrame = new THREE.Mesh(new THREE.BoxGeometry(0.3, 7.8, 4.8), windowWoodMat);
    wFrame.position.set(0, 0, wz);
    windowGroup.add(wFrame);

    // Window Inner Glass (Showing outdoor sunny daylight)
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 7.4),
      new THREE.MeshBasicMaterial({ color: 0xe0f2fe })
    );
    glass.rotation.y = -Math.PI / 2;
    glass.position.set(-0.02, 0, wz);
    windowGroup.add(glass);

    // Venetian Blind Slats (Horizontal white slats angled down)
    const slatsCount = 20;
    for (let s = 0; s < slatsCount; s++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 4.2), blindMat);
      slat.rotation.z = -0.3; // Angle catching sunlight
      slat.position.set(-0.08, 3.4 - (s * 0.36), wz);
      slat.castShadow = true;
      windowGroup.add(slat);
    }
  });

  scene.add(windowGroup);

  // 11. Student Desks & Chairs (Arranged in authentic 3x3 classroom rows)
  const deskLocations = [
    // Front Row
    { x: -7.5, z: -3.5, noteColor: 0x3b82f6, pencilBox: true, stationId: 'math', stationName: 'Math & Numbers Desk', url: 'math.html' },
    { x: -0.5, z: -3.5, noteColor: 0x10b981, pencilBox: false, stationId: 'multiplication', stationName: 'Multiplication Station', url: 'multiplication.html' },
    { x: 6.5, z: -3.5, noteColor: 0xef4444, pencilBox: true, stationId: 'alphabet', stationName: 'English Alphabet Desk', url: 'alphabet.html' },
    
    // Middle Row
    { x: -7.5, z: 3.5, noteColor: 0x8b5cf6, pencilBox: false, stationId: 'kannada', stationName: 'Kannada Language Desk', url: 'kannada.html' },
    { x: -0.5, z: 3.5, noteColor: 0xf59e0b, pencilBox: true, stationId: 'hindi', stationName: 'Hindi Language Desk', url: 'hindi.html' },
    { x: 6.5, z: 3.5, noteColor: 0x06b6d4, pencilBox: false, stationId: 'stories', stationName: 'Rhymes & Reading Desk', url: 'stories.html' },

    // Back Row (Closest to camera view)
    { x: -7.5, z: 10.5, noteColor: 0xec4899, pencilBox: true, stationId: 'games', stationName: 'Memory & Games Desk', url: 'games.html' },
    { x: -0.5, z: 10.5, noteColor: 0x3b82f6, pencilBox: false, stationId: 'chess', stationName: 'Playable Chess Desk', url: 'chess.html' },
    { x: 6.5, z: 10.5, noteColor: 0x10b981, pencilBox: true, stationId: 'emotions', stationName: 'Emotions & Values Desk', url: 'emotions.html' }
  ];

  const studentWoodMat = new THREE.MeshStandardMaterial({ color: 0xdba174, roughness: 0.65 });
  const cubbyDarkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const tubeMetalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.35 });

  const clickableObjects = [];

  deskLocations.forEach(loc => {
    const studentStation = new THREE.Group();
    studentStation.position.set(loc.x, 0, loc.z);

    // A. Desk Tabletop
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.22, 2.5), studentWoodMat);
    deskTop.position.y = 3.0;
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    studentStation.add(deskTop);

    // B. Under-Desk Book Storage Cubby
    const cubby = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.55, 2.3), cubbyDarkMat);
    cubby.position.y = 2.55;
    cubby.castShadow = true;
    studentStation.add(cubby);

    // C. 4 Tubular Steel Legs
    const legRadius = 0.055;
    const legPositions = [
      { x: -1.9, z: -1.05 },
      { x: 1.9, z: -1.05 },
      { x: -1.9, z: 1.05 },
      { x: 1.9, z: 1.05 }
    ];
    legPositions.forEach(lp => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(legRadius, legRadius, 2.9, 16), tubeMetalMat);
      leg.position.set(lp.x, 1.45, lp.z);
      leg.castShadow = true;
      studentStation.add(leg);

      // Rubber floor glide
      const glide = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06), cubbyDarkMat);
      glide.position.set(lp.x, 0.03, lp.z);
      studentStation.add(glide);
    });

    // D. Ergonomic Wooden Chair (Placed behind desk facing chalkboard)
    const chairGroup = new THREE.Group();
    chairGroup.position.set(0, 0, 1.8);

    // Curved Wooden Seat
    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.16, 1.9), studentWoodMat);
    chairSeat.position.y = 1.85;
    chairSeat.castShadow = true;
    chairGroup.add(chairSeat);

    // Curved Backrest
    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.0, 0.15), studentWoodMat);
    chairBack.position.set(0, 3.2, 0.85);
    chairBack.rotation.x = -0.1;
    chairBack.castShadow = true;
    chairGroup.add(chairBack);

    // Chair Tubular Metal Legs & Back Uprights
    const chairLegPositions = [
      { x: -0.9, z: -0.8 },
      { x: 0.9, z: -0.8 },
      { x: -0.9, z: 0.8 },
      { x: 0.9, z: 0.8 }
    ];
    chairLegPositions.forEach(cp => {
      const cleg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.8, 16), tubeMetalMat);
      cleg.position.set(cp.x, 0.9, cp.z);
      cleg.castShadow = true;
      chairGroup.add(cleg);
    });

    // Backrest Uprights
    const backLeftTube = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.5, 16), tubeMetalMat);
    backLeftTube.position.set(-0.85, 2.5, 0.8);
    chairGroup.add(backLeftTube);

    const backRightTube = backLeftTube.clone();
    backRightTube.position.set(0.85, 2.5, 0.8);
    chairGroup.add(backRightTube);

    studentStation.add(chairGroup);

    // E. Colorful School Supplies on Tabletop (Notebooks & Pencil Case)
    // Blue/colorful notebook
    const notebook = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.08, 1.6),
      new THREE.MeshStandardMaterial({ color: loc.noteColor, roughness: 0.5 })
    );
    notebook.position.set(-0.8, 3.15, 0.1);
    notebook.rotation.y = 0.08;
    notebook.castShadow = true;
    studentStation.add(notebook);

    // White paper edges of notebook
    const paperSide = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.06, 1.55),
      new THREE.MeshBasicMaterial({ color: 0xf8fafc })
    );
    paperSide.position.set(-0.8, 3.14, 0.1);
    paperSide.rotation.y = 0.08;
    studentStation.add(paperSide);

    // Pencil Case (Purple lid with green body)
    if (loc.pencilBox) {
      const caseBase = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.14, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.4 })
      );
      caseBase.position.set(0.8, 3.16, 0.2);
      studentStation.add(caseBase);

      const caseLid = new THREE.Mesh(
        new THREE.BoxGeometry(1.62, 0.06, 0.62),
        new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.35 })
      );
      caseLid.position.set(0.8, 3.25, 0.2);
      studentStation.add(caseLid);
    }

    // Attach interactivity to deskTop
    deskTop.userData = { id: loc.stationId, name: loc.stationName, url: loc.url };
    clickableObjects.push(deskTop);

    scene.add(studentStation);
  });

  // Also add Chalkboard, Globe, Telescope, Apple, Door, and Floor Backpack to clickable objects
  clickableObjects.push(boardSurface);
  clickableObjects.push(globeGroup);
  clickableObjects.push(telescopeGroup);
  clickableObjects.push(appleGroup);
  clickableObjects.push(doorGroup);
  clickableObjects.push(floorBagGroup);

  // 12. Mouse Pointer & Interactive Raycasting
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredObject = null;

  function getTooltipEl() {
    let tip = document.getElementById('classroom-3d-tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'classroom-3d-tooltip';
      tip.style.position = 'fixed';
      tip.style.pointerEvents = 'none';
      tip.style.background = 'rgba(15, 23, 42, 0.9)';
      tip.style.backdropFilter = 'blur(10px)';
      tip.style.border = '1px solid var(--border-glow)';
      tip.style.borderRadius = 'var(--radius-md)';
      tip.style.padding = '0.5rem 0.85rem';
      tip.style.color = '#fff';
      tip.style.fontSize = '0.85rem';
      tip.style.fontWeight = '700';
      tip.style.boxShadow = '0 8px 20px rgba(0,0,0,0.5)';
      tip.style.display = 'none';
      tip.style.zIndex = '9999';
      document.body.appendChild(tip);
    }
    return tip;
  }

  function onPointerMove(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects, true);

    const tip = getTooltipEl();

    if (intersects.length > 0) {
      let targetObj = intersects[0].object;
      while (targetObj && !targetObj.userData?.name && targetObj.parent) {
        targetObj = targetObj.parent;
      }

      if (targetObj && targetObj.userData?.name) {
        canvas.style.cursor = 'pointer';
        tip.textContent = `📍 Click to open: ${targetObj.userData.name}`;
        tip.style.left = `${event.clientX + 15}px`;
        tip.style.top = `${event.clientY + 15}px`;
        tip.style.display = 'block';
        hoveredObject = targetObj;
        return;
      }
    }

    canvas.style.cursor = 'default';
    tip.style.display = 'none';
    hoveredObject = null;
  }

  function onPointerDown(event) {
    if (hoveredObject && hoveredObject.userData?.url) {
      const station = hoveredObject.userData;
      if (typeof MindVerseAudio !== 'undefined') {
        MindVerseAudio.playClickSound();
        MindVerseAudio.speak(`Entering ${station.name}`);
      }

      // Smooth zoom before navigating
      zoomToTarget(hoveredObject);

      setTimeout(() => {
        window.location.href = station.url;
      }, 700);
    }
  }

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerdown', onPointerDown);

  // 13. Camera Modes & Presets
  let cameraMode = 'orbit'; // 'orbit', 'student', 'teacher', 'cinematic'
  let cinematicAngle = 0;

  function zoomToTarget(obj) {
    const worldPos = new THREE.Vector3();
    obj.getWorldPosition(worldPos);
    if (controls) controls.target.copy(worldPos);
    camera.position.set(worldPos.x, worldPos.y + 3, worldPos.z + 5);
  }

  window.setCameraMode = function(mode) {
    cameraMode = mode;
    document.querySelectorAll('.hud-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cameraMode === mode);
    });

    if (mode === 'student') {
      // Perspective matching the reference image from back row
      camera.position.set(-1.5, 6.8, 17.5);
      if (controls) controls.target.set(0, 5.0, -4.0);
    } else if (mode === 'teacher') {
      // Teacher podium view looking out at classroom
      camera.position.set(3.5, 6.0, -10.0);
      if (controls) controls.target.set(0, 4.0, 5.0);
    } else if (mode === 'orbit') {
      camera.position.set(0, 12.0, 22.0);
      if (controls) controls.target.set(0, 4.5, 0);
    } else if (mode === 'desk') {
      // Front row seated student view
      camera.position.set(-0.5, 4.2, -1.0);
      if (controls) controls.target.set(0, 6.5, -14.5);
    }
  };

  // 14. Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Subtle gentle spinning of the educational globe
    if (globeGroup && globeGroup.globeSphere) {
      globeGroup.globeSphere.rotation.y = elapsedTime * 0.4;
    }

    // Video Tour: Smooth cinematic camera rail gliding around the room
    if (cameraMode === 'cinematic') {
      cinematicAngle += 0.003;
      const radiusX = 16;
      const radiusZ = 18;
      camera.position.x = Math.sin(cinematicAngle) * radiusX;
      camera.position.z = Math.cos(cinematicAngle) * radiusZ;
      camera.position.y = 7.5 + Math.sin(cinematicAngle * 2) * 1.5;
      if (controls) controls.target.set(0, 4.5, -2.0);
    }

    if (controls) controls.update();
    renderer.render(scene, camera);
  }

  animate();

  // Resize listener
  window.addEventListener('resize', () => {
    width = container.clientWidth || window.innerWidth;
    height = container.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}

function toggle2DFallback(forceFallback = false) {
  const canvas = document.getElementById('classroom-canvas');
  const fallback = document.getElementById('fallback-classroom');
  const hud = document.querySelector('.classroom-hud');
  const bar = document.querySelector('.classroom-stations-bar');

  if (forceFallback) {
    if (canvas) canvas.style.display = 'none';
    if (hud) hud.style.display = 'none';
    if (bar) bar.style.display = 'none';
    if (fallback) fallback.classList.add('active');
  } else {
    const isFallback = fallback && fallback.classList.contains('active');
    if (isFallback) {
      if (canvas) canvas.style.display = 'block';
      if (hud) hud.style.display = 'flex';
      if (bar) bar.style.display = 'flex';
      if (fallback) fallback.classList.remove('active');
    } else {
      if (canvas) canvas.style.display = 'none';
      if (hud) hud.style.display = 'none';
      if (bar) bar.style.display = 'none';
      if (fallback) fallback.classList.add('active');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initClassroom3D();
});
