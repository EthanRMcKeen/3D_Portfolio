import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

import HolographicMaterial from './HolographicMaterialVanilla.js';

import Stats from 'https://cdnjs.cloudflare.com/ajax/libs/stats.js/r17/Stats.min.js';

// ── Scene ──────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
scene.fog = new THREE.FogExp2(0x0a0a0f, 0.04);

const cssScene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 1.85, -0.14);
camera.rotation.set(0, Math.PI, 0);
camera.rotation.order = 'YXZ';

// ── WebGL Renderer ─────────────────────────────────────────────────────────
// PERF: antialias false — biggest single win; avoids multi-sample rendering
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
// PERF: Cap pixel ratio at 1 — on Retina screens this cuts rendered pixels
//       significantly vs the original 1.5 cap. Raise to 1.5 if too soft.
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));

// PERF: Shadows disabled — no meshes cast shadows (all castShadow = false)
//       Also eliminates the depth-texture WebGL warning
renderer.shadowMap.enabled = false;

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// ── CSS3D Renderer ─────────────────────────────────────────────────────────
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = 'fixed';
cssRenderer.domElement.style.top = '0';
cssRenderer.domElement.style.left = '0';
cssRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(cssRenderer.domElement);

// ── Lighting ───────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x76afe8, 3));
const fillLight = new THREE.DirectionalLight(0xffc054, 2.5);
fillLight.position.set(-4, 2, 3);
scene.add(fillLight);

const fillLight2 = new THREE.DirectionalLight(0x36fff5, 2.5);
fillLight2.position.set(-4, -1, -3);
scene.add(fillLight2);

// ── Grid ───────────────────────────────────────────────────────────────────
scene.add(new THREE.GridHelper(20, 40, 0x1a2a4a, 0x0d1520));

// ── Resize ─────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Title Text ─────────────────────────────────────────────────────────────
const text_loader = new FontLoader();
const font = await text_loader.loadAsync('./fonts/Starjedi.json');
const title_geometry = new TextGeometry('ETHAN  MCKEEN', {
  font: font,
  size: 10,
  depth: 2,
  // PERF: Reduced curveSegments 6 → 4; cuts text mesh complexity, barely visible
  curveSegments: 4,
});

const font_arial = await text_loader.loadAsync('fonts/Ubuntu.json');
const subtitle_geometry = new TextGeometry('Electrical & Computer Engineer | Machine Learning Specialist', {
  font: font_arial,
  size: 7,
  depth: 2,
  curveSegments: 4,
});

const holographicMaterial = new HolographicMaterial();
const titleMesh = new THREE.Mesh(title_geometry, holographicMaterial);
titleMesh.scale.set(0.002, 0.002, 0.002);
titleMesh.position.set(0, 1.92, 0.08);
titleMesh.rotation.y = Math.PI;
title_geometry.center();

const subtitleMesh = new THREE.Mesh(subtitle_geometry, holographicMaterial);
subtitleMesh.scale.set(0.001, 0.001, 0.001);
subtitleMesh.position.set(0, 1.89, 0.08);
subtitleMesh.rotation.y = Math.PI;
subtitle_geometry.center();

scene.add(titleMesh);
scene.add(subtitleMesh);

// ── CSS3D Panel Setup ──────────────────────────────────────────────────────
const CSS3D_SCALE = 1 / 500;

const PANEL_TRANSFORMS = {
  'panel-left': {
    position: new THREE.Vector3(0.5, 1.4, 1.5),
    rotation: new THREE.Euler(0, 1.05 * Math.PI, 0),
  },
  'panel-01': {
    position: new THREE.Vector3(-0.25, 1.72, 1.52),
    rotation: new THREE.Euler(0, Math.PI, 0),
  },
  'panel-02': {
    position: new THREE.Vector3(-0.7, 1.72, 1.5),
    rotation: new THREE.Euler(0, -1.05 * Math.PI, 0),
  },
  'panel-03': {
    position: new THREE.Vector3(-0.25, 1.1, 1.52),
    rotation: new THREE.Euler(0, Math.PI, 0),
  },
  'panel-04': {
    position: new THREE.Vector3(-0.7, 1.1, 1.5),
    rotation: new THREE.Euler(0, -1.05 * Math.PI, 0),
  },
};

const css3dObjects = {};

const DETAIL_TRANSFORMS = {
  'detail-panel-left': {
    position: new THREE.Vector3(0.3, 1.6, -0.5),
    rotation: new THREE.Euler(0, 0.1, 0),
  },
  'detail-panel-01': {
    position: new THREE.Vector3(-0.25, 1.41, 1.52),
    rotation: new THREE.Euler(0, Math.PI, 0),
  },
  'detail-panel-02': {
    position: new THREE.Vector3(-0.7, 1.41, 1.5),
    rotation: new THREE.Euler(0, -1.05 * Math.PI, 0),
  },
  'detail-panel-03': {
    position: new THREE.Vector3(-0.25, 1.41, 1.52),
    rotation: new THREE.Euler(0, Math.PI, 0),
  },
  'detail-panel-04': {
    position: new THREE.Vector3(-0.7, 1.41, 1.5),
    rotation: new THREE.Euler(0, -1.05 * Math.PI, 0),
  },
};

const hudEl = document.getElementById('hud');

function makeCss3dPanel(el, transform) {
  // Don't set display here — detail containers need 'flex', panels need 'block'.
  // Callers set display themselves before calling this function.
  el.style.pointerEvents = 'auto';

  const obj = new CSS3DObject(el);
  obj.position.copy(transform.position);
  obj.rotation.copy(transform.rotation);
  obj.scale.setScalar(CSS3D_SCALE);

  cssScene.add(obj);
  return obj;
}

document.querySelectorAll('.panel[data-panel]').forEach(panel => {
  const id = panel.id;
  const transform = PANEL_TRANSFORMS[id];
  if (!transform) return;
  panel.style.display = 'block';
  const obj = makeCss3dPanel(panel, transform);
  css3dObjects[id] = obj;
});

document.querySelectorAll('.detail-container').forEach(detail => {
  const id = detail.id;
  const transform = DETAIL_TRANSFORMS[id];
  if (!transform) return;
  detail.classList.remove('hud-hidden');
  detail.style.display = 'flex';
  detail.style.opacity = '0';
  detail.style.pointerEvents = 'none';
  const obj = makeCss3dPanel(detail, transform);
  obj.visible = false;
  css3dObjects[id] = obj;
});

// ── Camera States ──────────────────────────────────────────────────────────
const STATES = {
  DEFAULT: {
    position:  new THREE.Vector3(0, 1.85, -0.14),
    yawOffset: Math.PI,
    pitchOffset: 0,
  },
  COLLAPSE: {
    position:  new THREE.Vector3(0, 1.85, -0.14),
    yawOffset: Math.PI,
    pitchOffset: 0,
  },
  'focus-panel-left': {
    position:  new THREE.Vector3(0.4, 1.55, 1.4),
    yawOffset: 0.12 * Math.PI,
    pitchOffset: 0.02 * Math.PI,
  },
  'focus-panel-01': {
    position:  new THREE.Vector3(0.4, 1.8, 1.45),
    yawOffset: 0.08 * Math.PI,
    pitchOffset: -0.04 * Math.PI,
  },
  'focus-panel-02': {
    position:  new THREE.Vector3(0.55, 1.1, 1.2),
    yawOffset: 0.2 * Math.PI,
    pitchOffset: 0.15 * Math.PI,
  },
  'focus-panel-03': {
    position:  new THREE.Vector3(-0.4, 1.55, 1.2),
    yawOffset: -0.2 * Math.PI,
    pitchOffset: 0.12 * Math.PI,
  },
  'focus-panel-04': {
    position:  new THREE.Vector3(-1, 1.97, -1.2),
    yawOffset: -0.8 * Math.PI,
    pitchOffset: -0.07 * Math.PI,
  },
};

let currentState  = 'DEFAULT';
let camTarget     = STATES.DEFAULT.position.clone();
let yawTarget     = STATES.DEFAULT.yawOffset;
let pitchTarget   = STATES.DEFAULT.pitchOffset;
let activePanel   = null;
let collapseTimer = null;

let mouseYaw    = Math.PI, mousePitch   = 0;
let currentYaw  = Math.PI, currentPitch = 0;
const LOOK_RANGE = Math.PI / 6;
let mouseOffsetX = 0, mouseOffsetY = 0;

let isAnimating = false;
let mixer = null;
let gltf  = null;

let gltf2 = null;
let model2 = null;
let model2Timer = null;
let model2Loaded = false;

// ── Panel visibility helpers ───────────────────────────────────────────────
function showMainPanels(visible) {
  document.querySelectorAll('.panel[data-panel]').forEach(panel => {
    const obj = css3dObjects[panel.id];
    if (!obj) return;
    obj.visible = visible;
    panel.style.opacity = visible ? '1' : '0';
    panel.style.pointerEvents = visible ? 'auto' : 'none';
  });
}

function showDetailPanel(panelId, visible) {
  const detailId = 'detail-' + panelId;
  const obj = css3dObjects[detailId];
  const el  = document.getElementById(detailId);
  if (!obj || !el) return;
  obj.visible = visible;
  el.style.opacity = visible ? '1' : '0';
  el.style.pointerEvents = visible ? 'auto' : 'none';

  if (visible) {
    el.querySelectorAll('.detail-item').forEach(item => {
      item.classList.remove('item-visible');
      void item.offsetWidth;
      item.classList.add('item-visible');
    });
  }
}

// ── State Machine ──────────────────────────────────────────────────────────
function transitionTo(stateName, panelId) {
  if (stateName === currentState) return;
  currentState = stateName;

  const state = STATES[stateName];
  camTarget    = state.position.clone();
  yawTarget    = state.yawOffset;
  pitchTarget  = state.pitchOffset;

  if (stateName === 'COLLAPSE') {
    activePanel = panelId;

    document.querySelectorAll('.panel[data-panel]').forEach(p => p.classList.add('collapsing'));

    if (mixer && gltf?.animations?.length) {
      const action = mixer.clipAction(gltf.animations[0]);
      action.reset();
      action.paused = false;
      action.play();
      isAnimating = true;
      mixer.addEventListener('finished', () => { isAnimating = false; }, { once: true });
    }

    collapseTimer = setTimeout(() => transitionTo('focus-' + panelId), 1200);
  }

  if (stateName.startsWith('focus-')) {
    showMainPanels(false);
    showDetailPanel(activePanel, true);

    // PERF: model2 only added to the scene graph when actually needed (focus state),
    //       keeping it out of draw calls entirely during the default view
    if (model2Loaded && model2) {
      if (!model2.parent) scene.add(model2);
      model2Timer = setTimeout(() => { model2.visible = true; }, 100);
    }

    scene.remove(titleMesh);
    scene.remove(subtitleMesh);
  }

  if (stateName === 'DEFAULT') {
    clearTimeout(collapseTimer);
    clearTimeout(model2Timer);

    if (activePanel) showDetailPanel(activePanel, false);
    activePanel = null;

    // PERF: Remove model2 from scene graph when returning to default —
    //       not just hidden, fully removed so it costs zero draw calls
    if (model2) {
      model2.visible = false;
      if (model2.parent) scene.remove(model2);
    }

    document.querySelectorAll('.panel[data-panel]').forEach(p => p.classList.remove('collapsing'));
    showMainPanels(true);

    scene.add(titleMesh);
    scene.add(subtitleMesh);
  }
}

// ── Back buttons ───────────────────────────────────────────────────────────
document.querySelectorAll('[data-back]').forEach(btn => {
  btn.addEventListener('click', () => transitionTo('DEFAULT'));
});

// ── Panel click listeners ──────────────────────────────────────────────────
document.querySelectorAll('.panel[data-panel]').forEach(panel => {
  panel.addEventListener('click', () => {
    if (currentState === 'DEFAULT') {
      transitionTo('COLLAPSE', panel.dataset.panel);
    }
  });
});

// ── Mouse look ─────────────────────────────────────────────────────────────
// PERF: mouseDirty throttle — only one mousemove processed per animation frame
let mouseDirty = false;
window.addEventListener('mousemove', e => {
  if (mouseDirty) return;
  mouseDirty = true;
  requestAnimationFrame(() => {
    const nx = (e.clientX / window.innerWidth)  * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    mouseOffsetX = -nx * LOOK_RANGE;
    mouseOffsetY = -ny * (LOOK_RANGE * 0.6);
    mouseDirty = false;
  });
});

// ── Camera lerp ───────────────────────────────────────────────────────────
const LERP_POS = 0.02;
const LERP_ROT = 0.03;

function updateCamera() {
  camera.position.lerp(camTarget, LERP_POS);

  mouseYaw   = yawTarget + mouseOffsetX;
  mousePitch = pitchTarget + mouseOffsetY;

  currentYaw   += (mouseYaw   - currentYaw)   * LERP_ROT;
  currentPitch += (mousePitch - currentPitch) * LERP_ROT;

  camera.rotation.y = currentYaw;
  camera.rotation.x = currentPitch;
}

// ── Texture downscaler ─────────────────────────────────────────────────────
// Walks a loaded GLTF scene and downgrades all material textures.
// - Disables mipmap generation (saves VRAM and upload time)
// - Downscales any image larger than MAX_TEXTURE_SIZE before GPU upload
function degradeGltfTextures(gltfScene, maxTextureSize = 512) {
  gltfScene.traverse(node => {
    if (!node.isMesh || !node.material) return;
    const slots = [
      'map', 'normalMap', 'roughnessMap', 'metalnessMap',
      'aoMap', 'emissiveMap', 'lightMap', 'envMap',
    ];
    slots.forEach(slot => {
      const tex = node.material[slot];
      if (!tex) return;
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      if (tex.image && (tex.image.width > maxTextureSize || tex.image.height > maxTextureSize)) {
        const canvas = document.createElement('canvas');
        const scale = maxTextureSize / Math.max(tex.image.width, tex.image.height);
        canvas.width  = Math.floor(tex.image.width  * scale);
        canvas.height = Math.floor(tex.image.height * scale);
        canvas.getContext('2d').drawImage(tex.image, 0, 0, canvas.width, canvas.height);
        tex.image = canvas;
        tex.needsUpdate = true;
      }
    });
  });
}

// ── GLTF Loaders ──────────────────────────────────────────────────────────
const loader = new GLTFLoader();

// PERF: Use THREE.Timer instead of deprecated THREE.Clock
const clock = new THREE.Timer();

loader.load(
  './models/bt/bt.gltf',
  loadedGltf => {
    gltf = loadedGltf;
    const model = gltf.scene;
    model.scale.setScalar(1);
    model.position.set(0, 0, 0);
    model.traverse(node => {
      if (!node.isMesh) return;
      node.castShadow    = false;
      node.receiveShadow = false; // PERF: shadow map disabled, skip receiver pass
      node.frustumCulled = true;  // PERF: skip off-screen geometry draw calls
    });
    //degradeGltfTextures(model, 1024);   // PERF: downscale textures before GPU upload
    scene.add(model);

    if (gltf.animations?.length) {
      mixer = new THREE.AnimationMixer(model);
      const action = mixer.clipAction(gltf.animations[0]);
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.play();
      action.paused = true;
      mixer.update(0);
    }
  },
  xhr => console.log((xhr.loaded / xhr.total * 100).toFixed(1) + '% loaded'),
  err => console.error('Error loading model 1:', err)
);

loader.load(
  './models/pilot/scene.gltf',
  loadedGltf => {
    gltf2 = loadedGltf;
    const model = gltf2.scene;
    model.scale.setScalar(0.1);
    model.position.set(-0.25, 1, 0.7);
    model.rotation.y = -0.15 * Math.PI;
    model.traverse(node => {
      if (!node.isMesh) return;
      node.castShadow    = false;
      node.receiveShadow = false; // PERF: shadow map disabled
      node.frustumCulled = true;
      // PERF: pilot is statically positioned — disable per-frame matrix recalculation
      node.matrixAutoUpdate = false;
      node.updateMatrix();
    });
    //degradeGltfTextures(model, 1024);   // PERF: downscale textures before GPU upload
    model2 = model;
    model2Loaded = true;
    // PERF: intentionally NOT added to scene here — only added on demand in focus state
    //       so it contributes zero draw calls during the default view
  },
  xhr => console.log('Model 2: ' + (xhr.loaded / xhr.total * 100).toFixed(1) + '% loaded'),
  err => console.error('Error loading model 2:', err)
);

// ── Initial panel state ────────────────────────────────────────────────────
showMainPanels(true);
document.querySelectorAll('.detail-container').forEach(el => {
  const obj = css3dObjects[el.id];
  if (obj) obj.visible = false;
});

// ── CSS3D render throttle ──────────────────────────────────────────────────
// PERF: CSS3D panels are static HTML — no need to composite them at 60fps.
//       Throttle to every 2nd frame (~30fps). WebGL still renders at full rate.
//       Using 2 instead of 3 keeps panel visibility transitions feeling snappy.
let cssFrameCount = 0;
const CSS_RENDER_EVERY = 2;

// ── Render loop ────────────────────────────────────────────────────────────
const stats = new Stats();
stats.showPanel(0); // 0 = FPS, 1 = ms per frame, 2 = MB memory
document.body.appendChild(stats.dom);

function animate() {
  stats.begin();
  requestAnimationFrame(animate);

  // PERF: THREE.Timer requires .update() before .getDelta()
  clock.update();
  const delta = clock.getDelta();

  if (mixer && isAnimating) mixer.update(delta);
  updateCamera();
  holographicMaterial.update();

  renderer.render(scene, camera);

  // PERF: Re-render CSS3D panels only every 2nd frame
  cssFrameCount++;
  if (cssFrameCount >= CSS_RENDER_EVERY) {
    cssRenderer.render(cssScene, camera);
    cssFrameCount = 0;
  }
  stats.end();
}

// function animate() {
//   stats.begin();
//   requestAnimationFrame(animate);
//   renderer.render(scene, camera);
//   stats.end();
// }
animate();