import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';

/**
 * Small 3D engine shared by the site view and the unit walk-through.
 *
 *  - "orbit" mode: Google-Maps-like MapControls (drag = pan, right-drag / two fingers = rotate & tilt, wheel = zoom)
 *  - "walk"  mode: first-person at eye height. WASD / arrows to move, Shift to run, drag to look.
 *                  Collision is delegated to a `blocked(from, to)` callback supplied by the scene.
 *  - flyTo(): eased camera moves used by clicks and the auto tour
 *  - HTML labels projected from 3D anchors every frame
 */

export type Mode = 'orbit' | 'walk';

export interface Label {
  el: HTMLElement;
  pos: THREE.Vector3;
  /** Hide when the camera is farther than this (metres). */
  maxDist?: number;
}

export interface EngineOptions {
  eyeHeight: number;
  walkSpeed: number; // m/s
  bounds: THREE.Box2; // walkable XZ bounds
  blocked?: (from: THREE.Vector3, to: THREE.Vector3) => boolean;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class Engine {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: MapControls;
  readonly labelLayer: HTMLDivElement;
  mode: Mode = 'orbit';
  labels: Label[] = [];
  onFrame?: (dt: number) => void;
  /** Called when a clickable 3D label is pressed. */
  onPick?: (id: string) => void;
  /** In walk mode, labels farther than this are hidden (avoids seeing labels through walls). */
  walkLabelRange = Infinity;

  private container: HTMLElement;
  private opts: EngineOptions;
  private raf = 0;
  private clock = new THREE.Clock();
  private ro: ResizeObserver;
  private keys = new Set<string>();
  /** Virtual joystick input for touch (-1..1). */
  readonly stick = { x: 0, y: 0 };
  private yaw = 0;
  private pitch = 0;
  private look: { x: number; y: number } | null = null;
  private flight: {
    p0: THREE.Vector3; p1: THREE.Vector3; t0: THREE.Vector3; t1: THREE.Vector3; d: number; t: number; start: number; done?: () => void;
  } | null = null;
  private cleanup: (() => void)[] = [];

  constructor(container: HTMLElement, opts: EngineOptions) {
    this.container = container;
    this.opts = opts;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    this.labelLayer = document.createElement('div');
    this.labelLayer.className = 'label-layer';
    container.appendChild(this.labelLayer);

    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 4000);
    this.controls = new MapControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.screenSpacePanning = false;
    this.controls.maxPolarAngle = Math.PI * 0.47;
    this.controls.autoRotateSpeed = 0.6;

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);
    this.resize();
    this.bindInput();
    this.loop();
  }

  /* ----------------------------------------------------------- lifecycle */

  resize() {
    const { clientWidth: w, clientHeight: h } = this.container;
    if (!w || !h) return;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.cleanup.forEach((f) => f());
    this.controls.dispose();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      mats.forEach((mt) => {
        Object.values(mt).forEach((v) => (v as THREE.Texture)?.isTexture && (v as THREE.Texture).dispose());
        mt.dispose();
      });
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.labelLayer.remove();
  }

  setBounds(b: THREE.Box2) {
    this.opts.bounds = b;
  }

  setBlocker(f: EngineOptions['blocked']) {
    this.opts.blocked = f;
  }

  /* ---------------------------------------------------------------- modes */

  setMode(mode: Mode) {
    if (mode === this.mode) return;
    this.flight = null;
    this.mode = mode;
    if (mode === 'walk') {
      this.controls.enabled = false;
      this.controls.autoRotate = false;
      // Drop to eye height where the orbit target is, keep the current heading.
      const t = this.controls.target.clone();
      const dir = t.clone().sub(this.camera.position).setY(0);
      if (dir.lengthSq() < 1e-6) dir.set(0, 0, -1);
      dir.normalize();
      const start = this.clampToBounds(t.clone().addScaledVector(dir, -6));
      if (this.opts.blocked?.(start, start)) start.copy(t);
      this.placeWalker(start, Math.atan2(dir.x, -dir.z));
    } else {
      this.controls.enabled = true;
      const fwd = new THREE.Vector3();
      this.camera.getWorldDirection(fwd);
      const target = this.camera.position.clone().addScaledVector(fwd.setY(0).normalize(), 25).setY(0);
      this.flyTo(target.clone().add(new THREE.Vector3(0, 60, 60)).sub(fwd.multiplyScalar(20)), target, 1.2);
    }
  }

  /** Put the walker at `p` (XZ used) looking along `yaw` (radians, 0 = −Z). */
  placeWalker(p: THREE.Vector3, yaw: number) {
    this.yaw = yaw;
    this.pitch = 0.05;
    this.camera.position.set(p.x, this.opts.eyeHeight, p.z);
    this.applyLook();
  }

  /** Smoothly move camera + orbit target. In walk mode the camera stays at eye height. */
  flyTo(pos: THREE.Vector3, target: THREE.Vector3, seconds = 1.6, done?: () => void) {
    if (this.mode === 'walk') {
      const p = this.clampToBounds(pos.clone());
      p.y = this.opts.eyeHeight;
      const d = target.clone().sub(p);
      this.flight = null;
      const yaw0 = this.yaw;
      let yaw1 = Math.atan2(d.x, -d.z);
      while (yaw1 - yaw0 > Math.PI) yaw1 -= 2 * Math.PI;
      while (yaw1 - yaw0 < -Math.PI) yaw1 += 2 * Math.PI;
      const p0 = this.camera.position.clone();
      const start = performance.now();
      const step = () => {
        const t = Math.min(1, (performance.now() - start) / (seconds * 1000));
        const k = ease(t);
        this.camera.position.lerpVectors(p0, p, k);
        this.yaw = yaw0 + (yaw1 - yaw0) * k;
        this.pitch = THREE.MathUtils.lerp(this.pitch, 0.05, k);
        this.applyLook();
        if (t < 1) this.walkTween = step;
        else {
          this.walkTween = null;
          done?.();
        }
      };
      this.walkTween = step;
      return;
    }
    this.flight = {
      p0: this.camera.position.clone(),
      p1: pos.clone(),
      t0: this.controls.target.clone(),
      t1: target.clone(),
      d: seconds,
      t: 0,
      start: performance.now(),
      done,
    };
  }
  private walkTween: (() => void) | null = null;

  get busy() {
    return !!this.flight || !!this.walkTween;
  }

  /* ---------------------------------------------------------------- input */

  private bindInput() {
    const el = this.renderer.domElement;
    const kd = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      this.keys.add(e.code);
      if (this.mode === 'walk' && e.code.startsWith('Arrow')) e.preventDefault();
    };
    const ku = (e: KeyboardEvent) => this.keys.delete(e.code);
    const blur = () => this.keys.clear();
    const pd = (e: PointerEvent) => {
      if (this.mode !== 'walk') return;
      this.look = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    };
    const pm = (e: PointerEvent) => {
      if (this.mode !== 'walk' || !this.look) return;
      const dx = e.clientX - this.look.x;
      const dy = e.clientY - this.look.y;
      this.look = { x: e.clientX, y: e.clientY };
      this.yaw += dx * 0.0035;
      this.pitch = THREE.MathUtils.clamp(this.pitch + dy * 0.0035, -1.2, 1.2);
      this.applyLook();
    };
    const pu = () => (this.look = null);
    const wheel = (e: WheelEvent) => {
      if (this.mode !== 'walk') return;
      e.preventDefault();
      this.camera.fov = THREE.MathUtils.clamp(this.camera.fov + e.deltaY * 0.02, 30, 75);
      this.camera.updateProjectionMatrix();
    };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    window.addEventListener('blur', blur);
    el.addEventListener('pointerdown', pd);
    el.addEventListener('pointermove', pm);
    el.addEventListener('pointerup', pu);
    el.addEventListener('pointercancel', pu);
    el.addEventListener('wheel', wheel, { passive: false });
    this.cleanup.push(() => {
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      window.removeEventListener('blur', blur);
      el.removeEventListener('pointerdown', pd);
      el.removeEventListener('pointermove', pm);
      el.removeEventListener('pointerup', pu);
      el.removeEventListener('pointercancel', pu);
      el.removeEventListener('wheel', wheel);
    });
  }

  private applyLook() {
    // yaw: 0 = looking along −Z, positive turns right. pitch: positive looks down.
    const e = new THREE.Euler(-this.pitch, -this.yaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(e);
  }

  private clampToBounds(p: THREE.Vector3) {
    const b = this.opts.bounds;
    p.x = THREE.MathUtils.clamp(p.x, b.min.x, b.max.x);
    p.z = THREE.MathUtils.clamp(p.z, b.min.y, b.max.y);
    return p;
  }

  private walk(dt: number) {
    const k = this.keys;
    let f = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0) - this.stick.y;
    let s = (k.has('KeyD') ? 1 : 0) - (k.has('KeyA') ? 1 : 0) + this.stick.x;
    const turn = (k.has('ArrowRight') ? 1 : 0) - (k.has('ArrowLeft') ? 1 : 0) + (k.has('KeyE') ? 1 : 0) - (k.has('KeyQ') ? 1 : 0);
    if (turn) {
      this.yaw += turn * dt * 1.8;
      this.applyLook();
    }
    f = THREE.MathUtils.clamp(f, -1, 1);
    s = THREE.MathUtils.clamp(s, -1, 1);
    if (!f && !s) return;
    const speed = this.opts.walkSpeed * (k.has('ShiftLeft') || k.has('ShiftRight') ? 2.2 : 1);
    const fwd = new THREE.Vector3(); fwd.set(Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, Math.sin(this.yaw));
    const move = fwd.multiplyScalar(f).add(right.multiplyScalar(s)).normalize().multiplyScalar(speed * dt);
    const from = this.camera.position.clone();
    // Try full move, then slide along each axis.
    for (const m of [move, new THREE.Vector3(move.x, 0, 0), new THREE.Vector3(0, 0, move.z)]) {
      const to = this.clampToBounds(from.clone().add(m));
      if (!this.opts.blocked?.(from, to)) {
        this.camera.position.copy(to);
        break;
      }
    }
  }

  /* ------------------------------------------------------------- per frame */

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);

    if (this.flight) {
      const f = this.flight;
      // Wall-clock timing so flights take the same time on slow devices.
      f.t = Math.min(1, (performance.now() - f.start) / (f.d * 1000));
      const k = ease(f.t);
      // Arc upwards a little on long flights so the camera clears the towers.
      const dist = f.p0.distanceTo(f.p1);
      this.camera.position.lerpVectors(f.p0, f.p1, k).y += Math.sin(Math.PI * k) * Math.min(60, dist * 0.25);
      this.controls.target.lerpVectors(f.t0, f.t1, k);
      if (f.t >= 1) {
        this.flight = null;
        f.done?.();
      }
    }
    if (this.walkTween) this.walkTween();
    else if (this.mode === 'walk') this.walk(dt);

    if (this.mode === 'orbit') this.controls.update();
    this.onFrame?.(dt);
    this.renderer.render(this.scene, this.camera);
    this.updateLabels();
  };

  private v = new THREE.Vector3();
  private updateLabels() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    for (const l of this.labels) {
      this.v.copy(l.pos).project(this.camera);
      const dist = this.camera.position.distanceTo(l.pos);
      const max = Math.min(l.maxDist ?? Infinity, this.mode === 'walk' ? this.walkLabelRange : Infinity);
      const visible = this.v.z < 1 && Math.abs(this.v.x) < 1.1 && Math.abs(this.v.y) < 1.1 && dist < max;
      if (!visible) {
        l.el.style.display = 'none';
        continue;
      }
      l.el.style.display = '';
      l.el.style.transform = `translate(-50%,-100%) translate(${((this.v.x + 1) / 2) * w}px,${((1 - this.v.y) / 2) * h}px)`;
      l.el.style.zIndex = String(Math.round(10000 - dist));
    }
  }

  addLabel(text: string, pos: THREE.Vector3, cls: string, onClick?: () => void, maxDist?: number) {
    const el = document.createElement(onClick ? 'button' : 'div');
    el.className = 'label3d ' + cls;
    el.textContent = text;
    if (onClick)
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick();
      });
    this.labelLayer.appendChild(el);
    const l = { el, pos, maxDist };
    this.labels.push(l);
    return l;
  }

  /** Normalised device coords for a pointer event over the canvas. */
  ndc(e: { clientX: number; clientY: number }) {
    const r = this.renderer.domElement.getBoundingClientRect();
    return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  }
}

/* --------------------------------------------------------------- helpers */

/** Ray-casting point-in-polygon on the XZ plane. */
export function inPoly(x: number, z: number, poly: [number, number][]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i];
    const [xj, zj] = poly[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

/** Text-to-speech narration (no-op where unsupported). */
export function speak(text: string, on: boolean) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  if (!on || !text) return;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1;
  u.lang = 'en-IN';
  window.speechSynthesis.speak(u);
}

/** Procedural facade texture: one tile = one bay (4 m) × one storey (3 m). */
export function facadeTexture(base = '#efe9df', glass = '#5d7286', band = '#d9cfc0') {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 96;
  const g = c.getContext('2d')!;
  g.fillStyle = base;
  g.fillRect(0, 0, 128, 96);
  g.fillStyle = band;
  g.fillRect(0, 88, 128, 8); // floor slab band
  g.fillStyle = glass;
  g.fillRect(18, 22, 92, 50); // window
  g.fillStyle = 'rgba(255,255,255,0.25)';
  g.fillRect(18, 22, 92, 8);
  g.fillStyle = base;
  g.fillRect(62, 22, 4, 50); // mullion
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / 4, 1 / 3);
  t.anisotropy = 8;
  return t;
}
