import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import "./style.css";

const app = document.getElementById("app");
const hud = document.getElementById("hud");

// ---------- Scene, Camera, Renderer ----------
const scene = new THREE.Scene();
const DAY_BG = new THREE.Color(0x87ceeb);
const NIGHT_BG = new THREE.Color(0x0b1026);
scene.background = DAY_BG.clone();

const persp = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 300);
persp.position.set(24, 27, 38);
const ORTHO_SIZE = 22;
const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 300); // Challenge C
ortho.position.copy(persp.position);
const TARGET = new THREE.Vector3(0, 0, 4);
persp.lookAt(TARGET);
ortho.lookAt(TARGET);
let camera = persp;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

// ---------- Lights ----------
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xffffff, 1.8);
sun.castShadow = true;
Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 90 });
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);

// ---------- Helper ----------
function add(geo, mat, x, y, z, shadow = true) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = shadow;
  scene.add(m);
  return m;
}

// ---------- Tekstur prosedural (digambar di Canvas, tanpa file gambar) ----------
function canvasTex(w, h, draw, rx = 1, ry = 1, srgb = true) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function speckle(g, w, h, n, colors, size) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = colors[(Math.random() * colors.length) | 0];
    g.fillRect(Math.random() * w, Math.random() * h, size, size);
  }
}
const grassTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = "#62a05f"; g.fillRect(0, 0, w, h);
  speckle(g, w, h, 2500, ["#79b874", "#4f8a4f", "#86c47f", "#5a9758"], 3);
}, 14, 14);
const asphaltTex = canvasTex(256, 64, (g, w, h) => {
  g.fillStyle = "#3a3a3d"; g.fillRect(0, 0, w, h);
  speckle(g, w, h, 900, ["#4a4a4e", "#2c2c2f", "#55555a"], 2);
  g.fillStyle = "#f5f1c8"; g.fillRect(8, h / 2 - 2, w / 2 - 16, 4); // marka putus-putus
  g.fillStyle = "#cfcfcf"; g.fillRect(0, 2, w, 2); g.fillRect(0, h - 4, w, 2); // garis tepi
}, 15, 1);
const barkTex = canvasTex(64, 64, (g, w, h) => {
  g.fillStyle = "#6b4423"; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 4) { g.fillStyle = Math.random() > 0.5 ? "#5a3a1d" : "#7d5230"; g.fillRect(x, 0, 2 + Math.random() * 2, h); }
}, 2, 2);
const leafTex = canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = "#2e7d32"; g.fillRect(0, 0, w, h);
  speckle(g, w, h, 900, ["#3f9a45", "#1f6325", "#4caf50"], 4);
}, 2, 2);
// fasad gedung: dinding + jendela; peta emissive hanya jendela (menyala saat malam)
function facade(emissive) {
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = emissive ? "#000" : "#ffffff"; g.fillRect(0, 0, w, h);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const lit = Math.random() > 0.35;
      g.fillStyle = emissive ? (lit ? "#ffd27a" : "#000") : (lit ? "#bcd9ee" : "#6f8aa0");
      g.fillRect(c * 32 + 7, r * 32 + 6, 18, 20);
      if (!emissive) { g.fillStyle = "#e8eef2"; g.fillRect(c * 32 + 7, r * 32 + 24, 18, 3); } // ambang jendela
    }
  }, 1, 1, !emissive);
}
const facadeTex = facade(false), facadeEmi = facade(true);

// ---------- Ground & Road (PlaneGeometry) ----------
const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshLambertMaterial({ map: grassTex }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
const roadMat = new THREE.MeshPhongMaterial({ map: asphaltTex, shininess: 8 });
for (const rot of [0, Math.PI / 2]) {
  const road = new THREE.Mesh(new THREE.PlaneGeometry(60, 5), roadMat);
  road.rotation.x = -Math.PI / 2;
  road.rotation.z = rot;
  road.position.y = 0.02 + rot * 0.001;
  road.receiveShadow = true;
  scene.add(road);
}
// trotoar tepi jalan (BoxGeometry) agar tidak rata
for (const [w, d, x, z] of [[60, 0.6, 0, 2.8], [60, 0.6, 0, -2.8], [0.6, 60, 2.8, 0], [0.6, 60, -2.8, 0]]) {
  add(new THREE.BoxGeometry(w, 0.12, d), new THREE.MeshLambertMaterial({ color: 0xb8b8b0 }), x, 0.06, z);
}

// ---------- Buildings (RoundedBoxGeometry = turunan BoxGeometry, sudut membulat) ----------
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const buildingMats = [];
const roofMat = new THREE.MeshLambertMaterial({ color: 0x555a60 });
for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const i of [0, 1]) for (const j of [0, 1]) {
  const h = 3 + rnd() * 8;
  const map = facadeTex.clone(), emi = facadeEmi.clone();
  for (const t of [map, emi]) { t.repeat.set(2, Math.max(1, Math.round(h / 1.6))); t.needsUpdate = true; }
  const mat = new THREE.MeshLambertMaterial({
    map,
    color: new THREE.Color().setHSL(0.08 + rnd() * 0.5, 0.25, 0.62 + rnd() * 0.2),
    emissive: 0xffffff,
    emissiveMap: emi,
    emissiveIntensity: 0,
  });
  buildingMats.push(mat);
  const bx = sx * (6 + i * 6), bz = sz * (6 + j * 6);
  add(new RoundedBoxGeometry(3.5, h, 3.5, 4, 0.28), mat, bx, h / 2, bz);
  add(new RoundedBoxGeometry(3.8, 0.3, 3.8, 3, 0.1), roofMat, bx, h + 0.15, bz);          // atap
  add(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8), roofMat, bx + 0.8, h + 0.9, bz - 0.8); // antena
}

// ---------- Challenge A: Cylinder, Cone, Torus ----------
const trunkMat = new THREE.MeshLambertMaterial({ map: barkTex });
const leafMat = new THREE.MeshLambertMaterial({ map: leafTex });
[[-3.8, -9], [3.8, -9], [-3.8, 9], [3.8, 9], [-9, 3.8], [9, 3.8], [-9, -3.8], [9, -3.8]].forEach(([x, z], k) => {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.4, 16), trunkMat);
  trunk.position.y = 0.7;
  const parts = [trunk];
  if (k % 2 === 0) { // pohon bulat: tiga bola daun bertumpuk
    for (const [dx, dy, dz, r] of [[0, 2.2, 0, 1.05], [0.55, 1.9, 0.2, 0.75], [-0.5, 2.0, -0.25, 0.8]]) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), leafMat);
      b.position.set(dx, dy, dz); parts.push(b);
    }
  } else { // pohon cemara: kerucut bertingkat, makin ke atas makin kecil
    [[1.2, 1.7, 1.9], [0.95, 1.5, 2.6], [0.7, 1.3, 3.3]].forEach(([r, hh, y]) => {
      const cn = new THREE.Mesh(new THREE.ConeGeometry(r, hh, 20), leafMat);
      cn.position.y = y; parts.push(cn);
    });
  }
  parts.forEach((p) => { p.castShadow = true; p.receiveShadow = true; tree.add(p); });
  tree.position.set(x, 0, z);
  tree.rotation.y = k;
  tree.scale.setScalar(0.8 + 0.05 * k);
  scene.add(tree);
});
const lampHeadMat = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
const poleMat = new THREE.MeshPhongMaterial({ color: 0x3b3f45, shininess: 60 });
[[-3.4, -3.4], [3.4, -3.4], [-3.4, 3.4], [3.4, 3.4]].forEach(([x, z]) => {
  add(new THREE.CylinderGeometry(0.15, 0.2, 0.3, 16), poleMat, x, 0.15, z);          // dudukan
  add(new THREE.CylinderGeometry(0.07, 0.1, 3, 16), poleMat, x, 1.5, z);             // tiang
  add(new THREE.SphereGeometry(0.3, 20, 14), lampHeadMat, x, 3.1, z, false);         // lampu
});
// air mancur bertingkat
const stoneMat = new THREE.MeshPhongMaterial({ color: 0xb0b0b0, shininess: 30 });
add(new THREE.CylinderGeometry(1.8, 1.8, 0.3, 48), new THREE.MeshPhongMaterial({ color: 0x3a8fd9, shininess: 90 }), 0, 0.15, 0);
const fountainRing = add(new THREE.TorusGeometry(1.9, 0.35, 20, 56), stoneMat, 0, 0.4, 0);
fountainRing.rotation.x = Math.PI / 2;
add(new THREE.CylinderGeometry(0.25, 0.4, 1.0, 20), stoneMat, 0, 0.8, 0);
add(new THREE.SphereGeometry(0.45, 20, 14), new THREE.MeshPhongMaterial({ color: 0x7fc4ff, shininess: 100 }), 0, 1.45, 0);
// bangku taman (BoxGeometry)
const woodMat = new THREE.MeshLambertMaterial({ map: barkTex });
[[0, -4.3, 0], [0, 4.3, Math.PI]].forEach(([x, z, ry]) => {
  const bench = new THREE.Group();
  for (const [w, h, d, y, zz] of [[1.6, 0.1, 0.5, 0.45, 0], [1.6, 0.5, 0.1, 0.75, -0.22]]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), woodMat);
    p.position.set(0, y, zz); p.castShadow = true; bench.add(p);
  }
  for (const lx of [-0.65, 0.65]) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.4), poleMat);
    l.position.set(lx, 0.2, 0); l.castShadow = true; bench.add(l);
  }
  bench.position.set(x + 5, 0, z); bench.rotation.y = ry; scene.add(bench);
});

// ---------- Challenge B: Material Gallery (geometry sama) ----------
let sphereGeo = new THREE.SphereGeometry(1.2, 32, 16);
const galleryMats = [
  new THREE.MeshBasicMaterial({ color: 0xff7043 }),
  new THREE.MeshNormalMaterial(),
  new THREE.MeshLambertMaterial({ color: 0xff7043 }),
  new THREE.MeshPhongMaterial({ color: 0xff7043, shininess: 90 }),
];
const gallery = galleryMats.map((m, i) => add(sphereGeo, m, -6 + i * 4, 1.3, 19));

// ---------- Cube (Challenge H): mobil dengan bodi membulat, kabin, dan roda ----------
const carMats = [
  { name: "MeshBasicMaterial", mat: new THREE.MeshBasicMaterial({ color: 0xe53935 }) },
  { name: "MeshNormalMaterial", mat: new THREE.MeshNormalMaterial() },
  { name: "MeshLambertMaterial", mat: new THREE.MeshLambertMaterial({ color: 0xe53935 }) },
  { name: "MeshPhongMaterial", mat: new THREE.MeshPhongMaterial({ color: 0xe53935, shininess: 80 }) },
];
let carIdx = 3;
const car = add(new RoundedBoxGeometry(1.8, 0.6, 1, 4, 0.2), carMats[carIdx].mat, 8, 0.55, 0);
const glassMat = new THREE.MeshPhongMaterial({ color: 0x9fd4ff, shininess: 120 });
const cabin = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.4, 0.85, 4, 0.15), glassMat);
cabin.position.set(-0.1, 0.45, 0); cabin.castShadow = true; car.add(cabin);
const tireMat = new THREE.MeshLambertMaterial({ color: 0x1b1b1b });
for (const [wx, wz] of [[-0.6, 0.5], [0.6, 0.5], [-0.6, -0.5], [0.6, -0.5]]) {
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 20), tireMat);
  wheel.rotation.x = Math.PI / 2; wheel.position.set(wx, -0.25, wz); wheel.castShadow = true; car.add(wheel);
}

// ---------- Matahari & Bulan (Sphere) ----------
const sunMesh = add(new THREE.SphereGeometry(1.5, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffdd55 }), 0, 0, 0, false);
const moonMesh = add(new THREE.SphereGeometry(1.1, 24, 16), new THREE.MeshBasicMaterial({ color: 0xdde6ff }), 0, 0, 0, false);

// ---------- State & Input ----------
let animationEnabled = true; // Challenge G
let time = 0;
let shadowSize = 1024;
// ---------- Panel Eksperimen ----------
let fixedStep = false, projUpdate = true, lightsOn = true;
let sunMax = 1.8, ambMax = 0.6, segInfo = "32x16";
const SUN_STEPS = [0.3, 1.0, 2.0, 4.0], AMB_STEPS = [0.2, 0.6, 1.0];
const nextStep = (list, cur) => list[(list.indexOf(cur) + 1) % list.length];
function setSegments(w, h) { // Eksperimen 2
  const g = new THREE.SphereGeometry(1.2, w, h);
  gallery.forEach((m) => { m.geometry = g; });
  sphereGeo.dispose();
  sphereGeo = g;
  segInfo = `${w}x${h}`;
  console.log(`Sphere ${segInfo}: vertex = ${g.attributes.position.count}`);
}
function setFov(v) { persp.fov = v; persp.updateProjectionMatrix(); } // Eksperimen 9
const keys = {};
function setShadow(size) { // Challenge E
  shadowSize = size;
  sun.shadow.mapSize.set(size, size);
  if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
}
addEventListener("keydown", (e) => {
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
  keys[e.code] = true;
  if (e.repeat) return;
  if (e.code === "Space") animationEnabled = !animationEnabled;
  if (e.code === "KeyP") camera = camera === persp ? ortho : persp;
  if (e.code === "KeyM") { carIdx = (carIdx + 1) % carMats.length; car.material = carMats[carIdx].mat; }
  if (e.code === "Digit1") setShadow(512);
  if (e.code === "Digit2") setShadow(1024);
  if (e.code === "Digit3") setShadow(2048);
  if (e.code === "KeyZ") setSegments(8, 6);
  if (e.code === "KeyX") setSegments(32, 16);
  if (e.code === "KeyC") setSegments(64, 32);
  if (e.code === "KeyT") setFov(35);
  if (e.code === "KeyY") setFov(60);
  if (e.code === "KeyU") setFov(90);
  if (e.code === "KeyI") sunMax = nextStep(SUN_STEPS, sunMax);
  if (e.code === "KeyO") ambMax = nextStep(AMB_STEPS, ambMax);
  if (e.code === "KeyB") { renderer.shadowMap.enabled = !renderer.shadowMap.enabled; scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; }); }
  if (e.code === "KeyV") car.castShadow = !car.castShadow;
  if (e.code === "KeyN") ground.receiveShadow = !ground.receiveShadow;
  if (e.code === "KeyL") { lightsOn = !lightsOn; ambient.visible = lightsOn; sun.visible = lightsOn; }
  if (e.code === "KeyD") fixedStep = !fixedStep;
  if (e.code === "KeyR") projUpdate = !projUpdate;
});
addEventListener("keyup", (e) => { keys[e.code] = false; });

// ---------- Responsive ----------
function resize() {
  const a = innerWidth / innerHeight;
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  persp.aspect = a;
  if (projUpdate) persp.updateProjectionMatrix();
  Object.assign(ortho, { left: -ORTHO_SIZE * a, right: ORTHO_SIZE * a, top: ORTHO_SIZE, bottom: -ORTHO_SIZE });
  if (projUpdate) ortho.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();

// ---------- Animation Loop ----------
let objectCount = 0;
scene.traverse((o) => { if (o.isMesh) objectCount++; });
const clock = new THREE.Clock();
let fps = 0, frames = 0, fpsTimer = 0, hudTimer = 0, dayInfo = "Siang";

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.1);

  if (animationEnabled) {
    time += dt;
    gallery.forEach((s) => { s.rotation.y += fixedStep ? 0.01 : 0.8 * dt; });
  }

  // Challenge H: kontrol kontinu pakai delta time
  const move = 7 * dt, turn = 2 * dt;
  if (keys.ArrowUp) car.position.z -= move;
  if (keys.ArrowDown) car.position.z += move;
  if (keys.ArrowLeft) car.position.x -= move;
  if (keys.ArrowRight) car.position.x += move;
  if (keys.KeyQ) car.rotation.y += turn;
  if (keys.KeyE) car.rotation.y -= turn;
  car.position.x = THREE.MathUtils.clamp(car.position.x, -28, 28);
  car.position.z = THREE.MathUtils.clamp(car.position.z, -28, 28);

  // Challenge D + siang-malam: matahari mengorbit
  const a = time * 0.25;
  sun.position.set(Math.cos(a) * 28, Math.sin(a) * 28, 8);
  const day = THREE.MathUtils.smoothstep(Math.sin(a), -0.15, 0.3);
  sun.intensity = sunMax * day;
  ambient.intensity = 0.15 + (ambMax - 0.15) * day;
  scene.background.copy(NIGHT_BG).lerp(DAY_BG, day);
  buildingMats.forEach((m) => { m.emissiveIntensity = 0.3 * (1 - day); });
  lampHeadMat.color.setHex(day > 0.5 ? 0xaaaaaa : 0xffe08a);
  sunMesh.position.copy(sun.position);
  sunMesh.scale.setScalar(1 + 0.2 * (1 - day));
  moonMesh.position.copy(sun.position).multiplyScalar(-1);
  dayInfo = day > 0.5 ? "Siang" : day > 0.1 ? "Senja/Subuh" : "Malam";

  renderer.render(scene, camera);

  // Challenge F: HUD
  frames++; fpsTimer += dt; hudTimer += dt;
  if (fpsTimer >= 0.5) { fps = Math.round(frames / fpsTimer); frames = 0; fpsTimer = 0; }
  if (hudTimer >= 0.25) {
    hudTimer = 0;
    const p = camera.position;
    hud.textContent =
      `Waktu       : ${dayInfo}${animationEnabled ? "" : " (PAUSE)"}\n` +
      `Kamera      : ${camera === persp ? "Perspective" : "Orthographic"}\n` +
      `Cam Pos     : ${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)}\n` +
      `Objek (mesh): ${objectCount}\n` +
      `Segitiga    : ${renderer.info.render.triangles}\n` +
      `FPS         : ${fps}\n` +
      `Material kubus: ${carMats[carIdx].name}\n` +
      `Shadow map  : ${shadowSize}x${shadowSize}\n` +
      `--- Eksperimen ---\n` +
      `Sphere      : ${segInfo} (${sphereGeo.attributes.position.count} vertex)\n` +
      `FOV         : ${persp.fov}\n` +
      `Sun / Amb   : ${sunMax} / ${ambMax}${lightsOn ? "" : " (light OFF)"}\n` +
      `ShadowMap   : ${renderer.shadowMap.enabled ? "ON" : "OFF"} | cast kubus ${car.castShadow ? "ON" : "OFF"} | receive ground ${ground.receiveShadow ? "ON" : "OFF"}\n` +
      `Rotasi      : ${fixedStep ? "+= 0.01 per frame" : "0.8 * delta"}\n` +
      `Resize      : updateProjectionMatrix ${projUpdate ? "ON" : "OFF"}`;
  }
}
frame();
