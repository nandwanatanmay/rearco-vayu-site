import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import footprints from "@/data/siteFootprints.json";

/**
 * Real-time hero scene of Vāyu @ KVD Windpark.
 *
 * Tower footprints are traced from the project's master plan (800 × 1542 px, ≈0.2 m/px).
 * Heights use the storey markings on that plan (S+22 / S+24) at an assumed 3 m per floor.
 * It is an artistic impression: façades, trees and landscape are stylised.
 *
 * The scene is lit by `hour` (6 → 21): the sun travels east → south → west, the sky
 * shifts from dawn to dusk, and after ~18:00 the windows and garden lamps light up.
 */

const PX = 0.2;
const CX = 400;
const CY = 800;
const toW = (x: number, y: number) => new THREE.Vector3((x - CX) * PX, 0, (y - CY) * PX);

const LEVELS: Record<string, number> = {
  tower1: 23,
  tower2: 23,
  tower3: 23,
  tower4: 23,
  tower5: 23,
  tower6: 25,
  tower7: 25,
  club: 2,
  commercial: 2,
};

/* ───────── colour keyframes over the day ───────── */
type Key = { h: number; top: string; hor: string; sun: string; ground: string };
const KEYS: Key[] = [
  { h: 6, top: "#6f7ea6", hor: "#f2c39e", sun: "#ffb27a", ground: "#7d8a6a" },
  { h: 8, top: "#93b3d0", hor: "#efe7da", sun: "#ffe0bd", ground: "#8e9d78" },
  { h: 12, top: "#8fb6d6", hor: "#e7efe9", sun: "#fffaf0", ground: "#93a37c" },
  { h: 16.5, top: "#9ab7d0", hor: "#f3dcb8", sun: "#ffdcaa", ground: "#8e9a72" },
  { h: 18, top: "#5f6f9a", hor: "#f2a575", sun: "#ff9a5a", ground: "#6e7457" },
  { h: 19, top: "#2f3658", hor: "#c4705b", sun: "#ff7a45", ground: "#3e4337" },
  { h: 20, top: "#141b30", hor: "#3a3449", sun: "#8a6a7a", ground: "#20261f" },
  { h: 21, top: "#0a1020", hor: "#182031", sun: "#6a7896", ground: "#161b16" },
];
const ca = new THREE.Color();
const cb = new THREE.Color();
function keyColor(h: number, f: keyof Omit<Key, "h">, out: THREE.Color) {
  let i = 0;
  while (i < KEYS.length - 2 && h > KEYS[i + 1].h) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = THREE.MathUtils.clamp((h - a.h) / (b.h - a.h), 0, 1);
  ca.set(a[f]);
  cb.set(b[f]);
  return out.copy(ca).lerp(cb, t);
}
const smooth = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/* Deterministic random so the scene looks the same on every visit. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function inPoly(x: number, y: number, poly: number[][]) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/** Façade atlas: 8 bays × 8 floors (32 m × 24 m). Returns colour map + window glow mask. */
function facade(seed: number, tint = "#f1eee7") {
  const W = 512;
  const H = 384;
  const bayW = W / 8;
  const flH = H / 8;
  const col = document.createElement("canvas");
  const glow = document.createElement("canvas");
  col.width = glow.width = W;
  col.height = glow.height = H;
  const g = col.getContext("2d")!;
  const e = glow.getContext("2d")!;
  const r = rng(seed);
  g.fillStyle = tint;
  g.fillRect(0, 0, W, H);
  e.fillStyle = "#000";
  e.fillRect(0, 0, W, H);
  for (let f = 0; f < 8; f++) {
    for (let b = 0; b < 8; b++) {
      const x = b * bayW;
      const y = f * flH;
      // glass
      g.fillStyle = "#4f6476";
      g.fillRect(x + 7, y + 8, bayW - 14, flH - 18);
      g.fillStyle = "rgba(255,255,255,0.18)";
      g.fillRect(x + 7, y + 8, bayW - 14, 6);
      g.fillStyle = tint;
      g.fillRect(x + bayW / 2 - 1.5, y + 8, 3, flH - 18);
      // slab band
      g.fillStyle = "#dcd6cb";
      g.fillRect(x, y + flH - 6, bayW, 6);
      // balcony planters: biophilic green bands on some bays
      if ((b + f * 3) % 4 === 0 || r() > 0.82) {
        g.fillStyle = r() > 0.5 ? "#5f7a47" : "#6f8a52";
        g.fillRect(x + 3, y + flH - 13, bayW - 6, 7);
        g.fillStyle = "#86a061";
        for (let k = 0; k < 6; k++) g.fillRect(x + 4 + r() * (bayW - 12), y + flH - 16 + r() * 3, 5, 4);
      }
      // lit windows at night (≈60 %), in a few warm tones
      if (r() > 0.4) {
        const warm = ["#ffcf86", "#ffb866", "#ffe0a8", "#f6a85a"][Math.floor(r() * 4)];
        e.fillStyle = warm;
        e.globalAlpha = 0.55 + r() * 0.45;
        e.fillRect(x + 7, y + 8, bayW - 14, flH - 18);
        e.globalAlpha = 1;
      }
    }
  }
  const mk = (c: HTMLCanvasElement) => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1 / 32, 1 / 24);
    t.anisotropy = 8;
    return t;
  };
  return { map: mk(col), glow: mk(glow) };
}

/** Painted site ground: lawns, paved spine, ring road, pool. Drawn in master-plan pixels. */
function groundTexture() {
  const S = 0.75; // canvas px per plan px
  const c = document.createElement("canvas");
  c.width = 800 * S;
  c.height = 1542 * S;
  const g = c.getContext("2d")!;
  g.scale(S, S);
  g.fillStyle = "#9cae84";
  g.fillRect(0, 0, 800, 1542);
  const r = rng(7);
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = r() > 0.5 ? "rgba(70,95,50,0.10)" : "rgba(255,255,230,0.08)";
    const s = 6 + r() * 26;
    g.beginPath();
    g.arc(r() * 800, r() * 1542, s, 0, Math.PI * 2);
    g.fill();
  }
  // ring road
  g.strokeStyle = "#d9d3c6";
  g.lineWidth = 26;
  g.lineJoin = "round";
  g.strokeRect(105, 150, 600, 1215);
  // central paved spine and plazas
  g.fillStyle = "#e4ded1";
  g.fillRect(372, 380, 56, 990);
  g.fillRect(330, 820, 140, 40);
  g.fillRect(300, 1120, 200, 70);
  // tower plinths
  const fp = footprints as Record<string, number[][][]>;
  g.fillStyle = "#d8d2c4";
  for (const polys of Object.values(fp))
    for (const p of polys) {
      const xs = p.map((q) => q[0]);
      const ys = p.map((q) => q[1]);
      const x0 = Math.min(...xs) - 12;
      const y0 = Math.min(...ys) - 12;
      g.fillRect(x0, y0, Math.max(...xs) - x0 + 12, Math.max(...ys) - y0 + 12);
    }
  // pools
  g.fillStyle = "#5fb4d6";
  g.fillRect(352, 598, 82, 168);
  g.fillRect(413, 588, 32, 34);
  g.fillStyle = "#7fc6df";
  g.fillRect(380, 1130, 40, 50);
  // garden beds
  g.fillStyle = "rgba(80,110,55,0.55)";
  for (let i = 0; i < 40; i++) {
    g.beginPath();
    g.ellipse(250 + r() * 300, 300 + r() * 950, 10 + r() * 18, 6 + r() * 12, r() * 3, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const skyVert = /* glsl */ `
varying vec3 vDir;
void main(){
  vDir = normalize((modelMatrix * vec4(position,1.0)).xyz - cameraPosition);
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position,1.0);
  gl_Position.z = gl_Position.w;
}`;
const skyFrag = /* glsl */ `
uniform vec3 top; uniform vec3 hor; uniform vec3 sunCol; uniform vec3 sunDir; uniform float stars; uniform float sunVis;
varying vec3 vDir;
float hash(vec3 p){ p = fract(p*0.3183099+.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
void main(){
  vec3 d = normalize(vDir);
  float h = clamp(d.y, -0.2, 1.0);
  vec3 col = mix(hor, top, pow(smoothstep(-0.02, 0.55, h), 0.7));
  float s = max(dot(d, normalize(sunDir)), 0.0);
  col += sunCol * (pow(s, 8.0) * 0.35 + pow(s, 600.0) * 2.5) * sunVis;
  col += sunCol * pow(1.0 - abs(h), 6.0) * 0.12 * sunVis;
  if (stars > 0.0 && d.y > 0.05) {
    vec3 q = floor(d * 380.0);
    float n = hash(q);
    col += vec3(step(0.9965, n) * stars * (0.6 + 0.4 * hash(q + 3.1)));
  }
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export type HeroOpts = { reducedMotion: boolean; lowPower: boolean };

export class SiteHero {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(32, 1, 5, 6000);
  composer: EffectComposer | null = null;
  bloom: UnrealBloomPass | null = null;
  private sun = new THREE.DirectionalLight("#ffffff", 2);
  private hemi = new THREE.HemisphereLight("#ffffff", "#7d8a6a", 1.1);
  private skyMat: THREE.ShaderMaterial;
  private glowMats: THREE.MeshStandardMaterial[] = [];
  private lampMat: THREE.MeshStandardMaterial;
  private groundMat: THREE.MeshStandardMaterial;
  private raf = 0;
  private last = performance.now();
  private t0 = performance.now();
  private visible = true;
  hour = 10.5;
  targetHour = 10.5;
  private yaw = 0;
  private pointer = new THREE.Vector2();
  private pointerS = new THREE.Vector2();
  private host: HTMLElement;
  private ro: ResizeObserver;
  private io: IntersectionObserver;
  onReady?: () => void;
  private readyFired = false;

  constructor(host: HTMLElement, private opts: HeroOpts) {
    this.host = host;
    this.renderer = new THREE.WebGLRenderer({ antialias: !opts.lowPower, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.lowPower ? 1.25 : 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.domElement.setAttribute("aria-hidden", "true");
    this.renderer.domElement.style.display = "block";
    host.appendChild(this.renderer.domElement);

    const scene = this.scene;
    scene.fog = new THREE.Fog("#e7efe9", 380, 1500);

    // Sky dome.
    this.skyMat = new THREE.ShaderMaterial({
      vertexShader: skyVert,
      fragmentShader: skyFrag,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        top: { value: new THREE.Color() },
        hor: { value: new THREE.Color() },
        sunCol: { value: new THREE.Color() },
        sunDir: { value: new THREE.Vector3(0, 1, 0) },
        stars: { value: 0 },
        sunVis: { value: 1 },
      },
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(3000, 32, 16), this.skyMat);
    sky.renderOrder = -1;
    scene.add(sky);

    // Lights.
    scene.add(this.hemi);
    const s = this.sun;
    s.castShadow = true;
    s.shadow.mapSize.set(opts.lowPower ? 1024 : 2048, opts.lowPower ? 1024 : 2048);
    const sc = s.shadow.camera as THREE.OrthographicCamera;
    sc.left = sc.bottom = -230;
    sc.right = sc.top = 230;
    sc.near = 10;
    sc.far = 1400;
    s.shadow.bias = -0.0006;
    s.shadow.normalBias = 0.6;
    scene.add(s, s.target);

    // Ground: wide apron + painted site.
    this.groundMat = new THREE.MeshStandardMaterial({ color: "#93a37c", roughness: 1 });
    const apron = new THREE.Mesh(new THREE.CircleGeometry(2600, 48), this.groundMat);
    apron.rotation.x = -Math.PI / 2;
    apron.position.y = -0.1;
    apron.receiveShadow = true;
    scene.add(apron);
    const site = new THREE.Mesh(
      new THREE.PlaneGeometry(800 * PX, 1542 * PX),
      new THREE.MeshStandardMaterial({ map: groundTexture(), roughness: 1 }),
    );
    site.rotation.x = -Math.PI / 2;
    site.receiveShadow = true;
    scene.add(site);

    // Towers.
    const fp = footprints as Record<string, number[][][]>;
    const fac = facade(11);
    const roof = new THREE.MeshStandardMaterial({ color: "#d9d4ca", roughness: 0.95 });
    const side = new THREE.MeshStandardMaterial({
      map: fac.map,
      emissiveMap: fac.glow,
      emissive: new THREE.Color("#ffffff"),
      emissiveIntensity: 0,
      roughness: 0.8,
    });
    this.glowMats.push(side);
    const lowSide = new THREE.MeshStandardMaterial({ color: "#efe9dd", roughness: 0.9 });
    const crownMat = new THREE.MeshStandardMaterial({ color: "#5f7a47", roughness: 0.9, flatShading: true });
    for (const [id, polys] of Object.entries(fp)) {
      const height = (LEVELS[id] ?? 2) * 3;
      const tower = height > 20;
      for (const poly of polys) {
        const shape = new THREE.Shape(poly.map(([x, y]) => new THREE.Vector2((x - CX) * PX, -(y - CY) * PX)));
        const geo = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
        geo.rotateX(-Math.PI / 2);
        const m = new THREE.Mesh(geo, [roof, tower ? side : lowSide]);
        m.castShadow = m.receiveShadow = true;
        scene.add(m);
        if (tower) {
          // Roof garden: a crown of green on every tower.
          const xs = poly.map((q) => q[0]);
          const ys = poly.map((q) => q[1]);
          const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
          const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
          const w = (Math.max(...xs) - Math.min(...xs)) * PX * 0.55;
          const d = (Math.max(...ys) - Math.min(...ys)) * PX * 0.55;
          const rg = new THREE.Mesh(new THREE.BoxGeometry(w, 1.2, d), crownMat);
          rg.position.copy(toW(cx, cy)).setY(height + 0.6);
          rg.castShadow = true;
          scene.add(rg);
        }
      }
    }

    // Trees: perimeter rows + scattered through the landscape (avoiding buildings and pools).
    const r = rng(42);
    const pts: [number, number, number][] = [];
    const blocked = (x: number, y: number) =>
      Object.values(fp).some((ps) => ps.some((p) => inPoly(x, y, p) || inPoly(x + 14, y, p) || inPoly(x - 14, y, p) || inPoly(x, y + 14, p) || inPoly(x, y - 14, p))) ||
      (x > 345 && x < 455 && y > 580 && y < 775) ||
      (x > 362 && x < 438 && y > 380 && y < 1370);
    for (let y = 170; y < 1350; y += 34) {
      pts.push([82 + r() * 10, y, 0.8 + r() * 0.4], [722 + r() * 10, y, 0.8 + r() * 0.4]);
    }
    for (let x = 130; x < 690; x += 36) pts.push([x, 128 + r() * 8, 0.8 + r() * 0.4]);
    let guard = 0;
    while (pts.length < 520 && guard++ < 6000) {
      const x = 110 + r() * 590;
      const y = 160 + r() * 1180;
      if (!blocked(x, y)) pts.push([x, y, 0.45 + r() * 0.55]);
    }
    // context trees outside the site
    // (kept behind the site so the foreground stays open)
    for (let i = 0; i < 260; i++) {
      const a = r() * Math.PI * 2;
      const dx = Math.cos(a);
      const dz = Math.sin(a);
      if (dx * 0.81 + dz * 0.58 > -0.1) continue;
      const d = 190 + r() * 420;
      pts.push([CX + (dx * d) / PX, CY + (dz * d) / PX, 0.7 + r() * 0.6]);
    }
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 4, 5);
    const crownGeo = new THREE.IcosahedronGeometry(3.4, 0);
    const trunks = new THREE.InstancedMesh(trunkGeo, new THREE.MeshStandardMaterial({ color: "#5d4a37" }), pts.length);
    const crowns = new THREE.InstancedMesh(crownGeo, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.95, flatShading: true }), pts.length);
    const greens = ["#4f7236", "#5d8040", "#6b8c49", "#45652f", "#7b9a55"].map((c) => new THREE.Color(c));
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    pts.forEach(([x, y, sc], i) => {
      const p = toW(x, y);
      m4.compose(p.clone().setY(2 * sc), q, new THREE.Vector3(sc, sc, sc));
      trunks.setMatrixAt(i, m4);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r() * 6);
      m4.compose(p.clone().setY(6.2 * sc), q, new THREE.Vector3(sc, sc * (0.9 + r() * 0.5), sc));
      crowns.setMatrixAt(i, m4);
      crowns.setColorAt(i, greens[Math.floor(r() * greens.length)]);
    });
    trunks.castShadow = crowns.castShadow = true;
    crowns.receiveShadow = true;
    scene.add(trunks, crowns);

    // Garden lamps: glow after dusk.
    this.lampMat = new THREE.MeshStandardMaterial({ color: "#3a3428", emissive: new THREE.Color("#ffc477"), emissiveIntensity: 0 });
    const lampPts: THREE.Vector3[] = [];
    for (let y = 390; y < 1360; y += 30) lampPts.push(toW(366, y), toW(434, y));
    for (let x = 120; x < 700; x += 40) lampPts.push(toW(x, 150), toW(x, 1365));
    for (let y = 160; y < 1360; y += 40) lampPts.push(toW(105, y), toW(705, y));
    const lamps = new THREE.InstancedMesh(new THREE.SphereGeometry(0.55, 8, 6), this.lampMat, lampPts.length);
    lampPts.forEach((p, i) => {
      m4.makeTranslation(p.x, 1.4, p.z);
      lamps.setMatrixAt(i, m4);
    });
    scene.add(lamps);

    // City context: low blocks in the haze, with their own window glow.
    const ctxFac = facade(99, "#e7e2d8");
    const ctxMat = new THREE.MeshStandardMaterial({ map: ctxFac.map, emissiveMap: ctxFac.glow, emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0, roughness: 0.9 });
    this.glowMats.push(ctxMat);
    const ctxTop = new THREE.MeshStandardMaterial({ color: "#d7d1c5" });
    for (let i = 0; i < 60; i++) {
      const a = r() * Math.PI * 2;
      const d = 520 + r() * 900;
      const w = 18 + r() * 26;
      const dd = 18 + r() * 26;
      const h = 14 + r() * (d > 900 ? 55 : 32);
      const g = new THREE.BoxGeometry(w, h, dd);
      // Fix UVs so the façade atlas tiles in metres.
      const uv = g.attributes.uv as THREE.BufferAttribute;
      const pos = g.attributes.position as THREE.BufferAttribute;
      const nrm = g.attributes.normal as THREE.BufferAttribute;
      for (let k = 0; k < uv.count; k++) {
        const nx = Math.abs(nrm.getX(k));
        const u = nx > 0.5 ? pos.getZ(k) : pos.getX(k);
        uv.setXY(k, u, pos.getY(k) + h / 2);
      }
      const b = new THREE.Mesh(g, [ctxMat, ctxMat, ctxTop, ctxTop, ctxMat, ctxMat]);
      b.position.set(Math.cos(a) * d, h / 2, Math.sin(a) * d * 1.2);
      b.rotation.y = r() * 0.3;
      b.receiveShadow = true;
      scene.add(b);
    }

    // Post-processing (bloom makes the lit windows sing at dusk). Skipped on low-power devices.
    if (!opts.lowPower) {
      this.composer = new EffectComposer(this.renderer);
      this.composer.addPass(new RenderPass(scene, this.camera));
      this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0, 0.5, 0.72);
      this.composer.addPass(this.bloom);
      this.composer.addPass(new OutputPass());
    }

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      if (this.visible) this.loop();
    });
    this.io.observe(host);
    window.addEventListener("pointermove", this.onPointer, { passive: true });
    document.addEventListener("visibilitychange", this.onVis);
    this.resize();
    this.applyHour(this.hour);
    this.loop();
  }

  private onPointer = (e: PointerEvent) => {
    this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  };
  private onVis = () => {
    if (!document.hidden) this.loop();
  };

  resize() {
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    this.composer?.setSize(w, h);
    this.bloom?.resolution.set(w / 2, h / 2);
    this.camera.aspect = w / h;
    // On wide screens push the site to the right so the headline has room on the left.
    if (w > 900) this.camera.setViewOffset(w, h, -w * 0.17, h * 0.02, w, h);
    // Phones: drop the towers into the lower half, below the headline.
    else this.camera.setViewOffset(w, h, 0, -h * 0.2, w, h);
    this.camera.fov = w < 640 ? 44 : 32;
    this.camera.updateProjectionMatrix();
  }

  applyHour(h: number) {
    const sk = this.skyMat.uniforms;
    keyColor(h, "top", sk.top.value);
    keyColor(h, "hor", sk.hor.value);
    keyColor(h, "sun", sk.sunCol.value);
    keyColor(h, "ground", this.groundMat.color);
    (this.scene.fog as THREE.Fog).color.copy(sk.hor.value);

    // Sun path: rises in the east (+x) at 6:00, peaks to the south at ~12:30, sets in the west by 19:00.
    const a = Math.PI * THREE.MathUtils.clamp((h - 6) / 13, 0, 1);
    const elev = Math.sin(a) * 0.95;
    const dir = new THREE.Vector3(Math.cos(a), Math.max(elev, -0.15), 0.55 * Math.sin(a) + 0.15).normalize();
    sk.sunDir.value.copy(dir);
    const day = smooth(6.05, 7.2, h) * (1 - smooth(18.3, 19.3, h));
    sk.sunVis.value = 1 - smooth(19.2, 20, h);
    const night = smooth(17.6, 19.6, h);
    const moon = smooth(19.2, 20.4, h);
    if (moon > 0) {
      // After sunset the key light becomes a cool, faint moon high in the south-east.
      this.sun.position.set(260, 420, 320);
      this.sun.color.set("#9db0e0");
      this.sun.intensity = 0.32 * moon;
    } else {
      this.sun.position.copy(dir.clone().multiplyScalar(600));
      this.sun.color.copy(sk.sunCol.value);
      this.sun.intensity = 2.8 * day * (0.35 + 0.65 * Math.min(1, elev * 2.2));
    }
    this.hemi.intensity = 1.25 - 0.8 * night;
    this.hemi.color.copy(sk.top.value).lerp(new THREE.Color(night > 0.5 ? "#7d8fc0" : "#ffffff"), 0.55);
    this.hemi.groundColor.copy(this.groundMat.color);
    sk.stars.value = smooth(19.4, 20.6, h);
    for (const m of this.glowMats) m.emissiveIntensity = night * 1.9;
    this.lampMat.emissiveIntensity = night * 6;
    this.renderer.toneMappingExposure = 1.0 - 0.15 * night;
    if (this.bloom) this.bloom.strength = 0.15 + night * 0.85;
  }

  private loop = () => {
    cancelAnimationFrame(this.raf);
    if (!this.visible || document.hidden) return;
    this.raf = requestAnimationFrame(this.loop);
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;

    // Ease toward the requested time of day.
    const k = 1 - Math.exp(-dt * 3.2);
    if (Math.abs(this.targetHour - this.hour) > 0.002) {
      this.hour += (this.targetHour - this.hour) * k;
      this.applyHour(this.hour);
    }

    // Camera: intro fly-in, slow drift, and gentle pointer parallax.
    const t = (now - this.t0) / 1000;
    const intro = this.opts.reducedMotion ? 1 : smooth(0, 3.2, t);
    if (!this.opts.reducedMotion) this.yaw = Math.sin(t * 0.045) * 0.32;
    this.pointerS.lerp(this.pointer, 1 - Math.exp(-dt * 2.5));
    const az = 0.95 + this.yaw + (this.opts.reducedMotion ? 0 : this.pointerS.x * 0.06);
    const dist = THREE.MathUtils.lerp(980, 560, intro);
    const el = THREE.MathUtils.lerp(0.62, 0.17, intro) + (this.opts.reducedMotion ? 0 : this.pointerS.y * 0.02);
    const target = new THREE.Vector3(0, 30, 0);
    this.camera.position.set(target.x + Math.sin(az) * Math.cos(el) * dist, target.y + Math.sin(el) * dist, target.z + Math.cos(az) * Math.cos(el) * dist);
    this.camera.lookAt(target);

    if (this.composer) this.composer.render(dt);
    else this.renderer.render(this.scene, this.camera);
    if (!this.readyFired) {
      this.readyFired = true;
      this.onReady?.();
    }
  };

  dispose() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.io.disconnect();
    window.removeEventListener("pointermove", this.onPointer);
    document.removeEventListener("visibilitychange", this.onVis);
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      for (const mat of mats) {
        for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose();
        mat.dispose();
      }
    });
    this.composer?.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
