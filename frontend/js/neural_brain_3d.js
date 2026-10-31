/**
 * MINDVERSE — INCLUSIVE LEARNING LAB
 * Three.js Holographic AI Neural Brain (Reference Image 3 Inspiration)
 */

function initNeuralBrain(canvasId = 'neural-brain-canvas') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // Check if WebGL is available
  if (typeof THREE === 'undefined') {
    console.warn('[MindVerse 3D] Three.js not loaded, using 2D fallback');
    draw2DFallbackBrain(canvas);
    return;
  }

  const container = canvas.parentElement;
  let width = container.clientWidth || 500;
  let height = container.clientHeight || 450;

  // 1. Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.z = 22;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  } catch (e) {
    console.warn('[MindVerse 3D] WebGL failed:', e);
    draw2DFallbackBrain(canvas);
    return;
  }

  // 2. Glowing Brain Neural Geometry
  const brainGroup = new THREE.Group();
  scene.add(brainGroup);

  // Core Neural Spherical Cloud (Brain lobes)
  const nodeCount = 180;
  const positions = new Float32Array(nodeCount * 3);
  const colors = new Float32Array(nodeCount * 3);
  const nodePositions = [];

  const cyanColor = new THREE.Color(0x00f0ff);
  const magentaColor = new THREE.Color(0xff0080);
  const violetColor = new THREE.Color(0x7928ca);

  for (let i = 0; i < nodeCount; i++) {
    // Generate two brain hemispheres
    const hemisphere = (i % 2 === 0) ? 1 : -1;
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);

    const r = 6.5 + (Math.random() - 0.5) * 2.0;
    let x = r * Math.sin(phi) * Math.cos(theta) * 0.85 + (hemisphere * 2.2);
    let y = r * Math.sin(phi) * Math.sin(theta) * 0.95;
    let z = r * Math.cos(phi) * 1.1;

    // Slight indentation in middle
    if (Math.abs(x) < 2.0) {
      y *= 0.85;
      z *= 0.85;
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    nodePositions.push(new THREE.Vector3(x, y, z));

    // Gradient mix between cyan and magenta/violet
    const mixColor = (i % 3 === 0) ? cyanColor : (i % 3 === 1 ? magentaColor : violetColor);
    colors[i * 3] = mixColor.r;
    colors[i * 3 + 1] = mixColor.g;
    colors[i * 3 + 2] = mixColor.b;
  }

  const pointGeo = new THREE.BufferGeometry();
  pointGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pointGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Shader point material
  const pointMat = new THREE.PointsMaterial({
    size: 0.65,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });

  const neuralNodes = new THREE.Points(pointGeo, pointMat);
  brainGroup.add(neuralNodes);

  // 3. Neural Synapse Circuit Lines
  const linePositions = [];
  const lineColors = [];

  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      const dist = nodePositions[i].distanceTo(nodePositions[j]);
      if (dist < 3.2) {
        linePositions.push(nodePositions[i].x, nodePositions[i].y, nodePositions[i].z);
        linePositions.push(nodePositions[j].x, nodePositions[j].y, nodePositions[j].z);

        const col = (i % 2 === 0) ? cyanColor : violetColor;
        lineColors.push(col.r, col.g, col.b);
        lineColors.push(col.r, col.g, col.b);
      }
    }
  }

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending
  });

  const neuralLines = new THREE.LineSegments(lineGeo, lineMat);
  brainGroup.add(neuralLines);

  // 4. Outer Holographic Spherical Glow Ring
  const ringGeo = new THREE.TorusGeometry(9.5, 0.08, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending
  });
  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.rotation.x = Math.PI / 3;
  brainGroup.add(ring1);

  const ring2 = ring1.clone();
  ring2.rotation.x = -Math.PI / 4;
  ring2.rotation.y = Math.PI / 3;
  ring2.material = new THREE.MeshBasicMaterial({ color: 0xff0080, transparent: true, opacity: 0.35 });
  brainGroup.add(ring2);

  // 5. Floating Cosmic Micro-Particles
  const partCount = 120;
  const partGeo = new THREE.BufferGeometry();
  const partPos = new Float32Array(partCount * 3);
  for (let p = 0; p < partCount * 3; p += 3) {
    partPos[p] = (Math.random() - 0.5) * 35;
    partPos[p + 1] = (Math.random() - 0.5) * 35;
    partPos[p + 2] = (Math.random() - 0.5) * 25;
  }
  partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
  const partMat = new THREE.PointsMaterial({
    color: 0x00f0ff,
    size: 0.25,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });
  const particles = new THREE.Points(partGeo, partMat);
  scene.add(particles);

  // 6. Mouse/Touch Interaction
  let targetRotationX = 0;
  let targetRotationY = 0;

  window.addEventListener('mousemove', (e) => {
    const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    targetRotationY = mouseX * 0.6;
    targetRotationX = -mouseY * 0.4;
  });

  // 7. Render Loop
  let animationFrameId;
  function animate(time) {
    animationFrameId = requestAnimationFrame(animate);

    // Check reduced motion setting
    const isReduced = document.body.classList.contains('reduced-motion') || document.body.classList.contains('sensory-calm');

    if (!isReduced) {
      brainGroup.rotation.y += 0.005;
      brainGroup.rotation.x += (targetRotationX - brainGroup.rotation.x) * 0.05;
      brainGroup.rotation.y += (targetRotationY - brainGroup.rotation.y) * 0.05;

      ring1.rotation.z += 0.008;
      ring2.rotation.z -= 0.006;
      particles.rotation.y -= 0.001;

      // Gentle pulsing of points
      const pulse = Math.sin(time * 0.002) * 0.08;
      neuralNodes.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
    }

    renderer.render(scene, camera);
  }

  animate(0);

  // Resize handler
  window.addEventListener('resize', () => {
    width = container.clientWidth || 500;
    height = container.clientHeight || 450;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}

function draw2DFallbackBrain(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = canvas.parentElement.clientWidth || 400;
  canvas.height = canvas.parentElement.clientHeight || 350;

  ctx.fillStyle = '#0a0e1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Draw glowing neural circles
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx - 40, cy, 70, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#ff0080';
  ctx.beginPath();
  ctx.arc(cx + 40, cy, 70, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#00f0ff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MindVerse Neural AI Lab', cx, cy + 120);
}

// Auto init if canvas is present
document.addEventListener('DOMContentLoaded', () => {
  initNeuralBrain('neural-brain-canvas');
});
