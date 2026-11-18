import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import type { PlanData, Room } from '../data/types';
import { Engine, inPoly } from './engine';

/**
 * 3D walk-through of one apartment, generated from the same data as the 2D viewer:
 *  - walls: the vectorised wall outlines, extruded to ceiling height
 *  - floor: the plan artwork (finishes, furniture, fixtures) laid on the floor
 *  - windows: sill + glass + lintel; door openings get lintels and open leaves
 *
 * Plan scale is estimated per plan from the printed room dimensions (median mm-per-pixel),
 * so sizes are approximate; ceiling height (2.9 m), sill (0.9 m) and door head (2.1 m) are assumed.
 */
export const CEIL = 2.9;
const SILL = 0.9;
const HEAD = 2.1;

export function mmPerPx(plan: PlanData) {
  const r: number[] = [];
  for (const room of plan.rooms) {
    if (!room.dims) continue;
    r.push(room.dims.horizontal / room.dims.rect[2], room.dims.vertical / room.dims.rect[3]);
  }
  r.sort((a, b) => a - b);
  return r[Math.floor(r.length / 2)] || 13;
}

export interface UnitScene {
  s: number; // metres per plan px
  toW: (x: number, y: number, h?: number) => THREE.Vector3;
  roomAt: (p: THREE.Vector3) => Room | null;
  floor: THREE.Mesh;
  colliders: THREE.Object3D[];
  start: { pos: THREE.Vector3; yaw: number };
  center: THREE.Vector3;
  size: number;
}

export function buildUnit(engine: Engine, plan: PlanData, floorTex: THREE.Texture): UnitScene {
  const { scene } = engine;
  scene.background = new THREE.Color('#e9e6e0');
  scene.fog = null;
  const s = mmPerPx(plan) / 1000;
  const ox = (plan.width * s) / 2;
  const oz = (plan.height * s) / 2;
  const toW = (x: number, y: number, h = 0) => new THREE.Vector3(x * s - ox, h, y * s - oz);

  scene.add(new THREE.HemisphereLight('#ffffff', '#b9b2a6', 1.4));
  const sun = new THREE.DirectionalLight('#fff3df', 1.6);
  sun.position.set(-8, 14, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera as THREE.OrthographicCamera;
  sc.left = sc.bottom = -20;
  sc.right = sc.top = 20;
  sun.shadow.bias = -0.0004;
  scene.add(sun);

  // Floor with the plan artwork.
  floorTex.colorSpace = THREE.SRGBColorSpace;
  floorTex.anisotropy = engine.renderer.capabilities.getMaxAnisotropy();
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(plan.width * s, plan.height * s),
    new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(plan.width * s + 2, 0.3, plan.height * s + 2), new THREE.MeshStandardMaterial({ color: '#d6d1c8' }));
  slab.position.y = -0.16;
  scene.add(slab);

  // Walls from the vectorised SVG path.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${plan.walls}" fill="#000" fill-rule="evenodd"/></svg>`;
  const data = new SVGLoader().parse(svg);
  const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p));
  const wallGeo = new THREE.ExtrudeGeometry(shapes, { depth: CEIL / s, bevelEnabled: false });
  wallGeo.rotateX(Math.PI / 2); // shape y → +Z, extrusion → −Y
  wallGeo.translate(0, CEIL / s, 0);
  wallGeo.scale(s, s, s);
  wallGeo.translate(-ox, 0, -oz);
  const wallMat = [
    new THREE.MeshStandardMaterial({ color: '#4a4744', roughness: 0.9 }), // wall tops (cut plane)
    new THREE.MeshStandardMaterial({ color: '#f4f1ea', roughness: 0.95 }), // wall faces
  ];
  const walls = new THREE.Mesh(wallGeo, wallMat);
  walls.castShadow = walls.receiveShadow = true;
  scene.add(walls);
  const colliders: THREE.Object3D[] = [walls];

  // Windows: sill + glass + lintel filling the gaps in the wall line.
  const sillMat = wallMat[1];
  const glass = new THREE.MeshPhysicalMaterial({ color: '#bcd9ee', transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0 });
  for (const [x, y, w, h] of plan.windows) {
    const c = toW(x + w / 2, y + h / 2);
    const sx = w * s;
    const sz = h * s;
    const add = (y0: number, y1: number, mat: THREE.Material, collide: boolean) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(sx, y1 - y0, sz), mat);
      m.position.set(c.x, (y0 + y1) / 2, c.z);
      m.castShadow = mat !== glass;
      scene.add(m);
      if (collide) colliders.push(m);
    };
    add(0, SILL, sillMat, true);
    add(SILL, HEAD, glass, true);
    add(HEAD, CEIL, sillMat, false);
  }

  // Doors: lintel over the opening + the leaf shown open (as drawn on the plan).
  const leafMat = new THREE.MeshStandardMaterial({ color: '#a77b52', roughness: 0.7 });
  const mainLeaf = new THREE.MeshStandardMaterial({ color: '#7a1f2b', roughness: 0.6 });
  for (const d of plan.doors) {
    const h = toW(d.h[0], d.h[1]);
    const c = toW(d.c[0], d.c[1]);
    const o = toW(d.o[0], d.o[1]);
    const len = h.distanceTo(c);
    const lint = new THREE.Mesh(new THREE.BoxGeometry(len, CEIL - HEAD, 0.15), sillMat);
    lint.position.copy(h.clone().add(c).multiplyScalar(0.5)).setY((HEAD + CEIL) / 2);
    lint.rotation.y = -Math.atan2(c.z - h.z, c.x - h.x);
    scene.add(lint);
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(h.distanceTo(o), HEAD, 0.04), d.main ? mainLeaf : leafMat);
    leaf.position.copy(h.clone().add(o).multiplyScalar(0.5)).setY(HEAD / 2);
    leaf.rotation.y = -Math.atan2(o.z - h.z, o.x - h.x);
    leaf.castShadow = true;
    scene.add(leaf);
    colliders.push(leaf);
  }

  // Balcony railings (glass, 1.1 m) along balcony polygon edges that are not walls – approximated by
  // placing a low translucent band on every balcony edge; walls hide the parts that coincide with them.
  const rail = new THREE.MeshPhysicalMaterial({ color: '#d7e6ee', transparent: true, opacity: 0.28, roughness: 0.1 });
  for (const r of plan.rooms.filter((q) => q.type === 'balcony')) {
    const pts = r.poly;
    for (let i = 0; i < pts.length; i++) {
      const a = toW(pts[i][0], pts[i][1]);
      const b = toW(pts[(i + 1) % pts.length][0], pts[(i + 1) % pts.length][1]);
      const len = a.distanceTo(b);
      if (len < 0.3) continue;
      // Only rail edges that face the outside (not shared with another room / door opening).
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % pts.length];
      const L = Math.hypot(x2 - x1, y2 - y1);
      const nx = -(y2 - y1) / L;
      const ny = (x2 - x1) / L;
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const outside = [6, -6]
        .map((k) => [mx + nx * k, my + ny * k] as [number, number])
        .filter(([px, py]) => !inPoly(px, py, r.poly));
      if (!outside.length || outside.some(([px, py]) => plan.rooms.some((q) => q !== r && inPoly(px, py, q.poly)))) continue;
      const m = new THREE.Mesh(new THREE.BoxGeometry(len, 1.1, 0.03), rail);
      m.position.copy(a.clone().add(b).multiplyScalar(0.5)).setY(0.55);
      m.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x);
      scene.add(m);
      colliders.push(m);
    }
  }

  // Room labels.
  for (const r of plan.rooms) {
    if (r.type === 'service') continue;
    engine.addLabel(r.name, toW(r.label[0], r.label[1], 1.9), 'room ' + r.type, () => engine.onPick?.(r.id), 40);
  }

  const roomAt = (p: THREE.Vector3) => {
    const x = (p.x + ox) / s;
    const y = (p.z + oz) / s;
    // Prefer the smallest containing room (the living polygon wraps passages).
    const hits = plan.rooms.filter((r) => inPoly(x, y, r.poly));
    hits.sort((a, b) => area(a.poly) - area(b.poly));
    return hits[0] ?? null;
  };

  // Start just inside the main door, facing perpendicular to the doorway into the flat.
  const md = plan.doors.find((d) => d.main) ?? plan.doors[0];
  const mid = toW((md.h[0] + md.c[0]) / 2, (md.h[1] + md.c[1]) / 2);
  const center = new THREE.Vector3(0, 0, 0);
  const along = toW(md.c[0], md.c[1]).sub(toW(md.h[0], md.h[1])).setY(0).normalize();
  let dir = new THREE.Vector3(-along.z, 0, along.x);
  const inside = (q: THREE.Vector3) => {
    const r = roomAt(q);
    return !!r && r.type !== 'balcony' && r.type !== 'service';
  };
  if (!inside(mid.clone().addScaledVector(dir, 1.2))) dir = dir.negate();
  const startPos = mid.clone().addScaledVector(dir, 1.2);
  return {
    s,
    toW,
    roomAt,
    floor,
    colliders,
    start: { pos: startPos, yaw: Math.atan2(dir.x, -dir.z) },
    center,
    size: Math.max(plan.width, plan.height) * s,
  };
}

function area(p: [number, number][]) {
  let a = 0;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) a += (p[j][0] + p[i][0]) * (p[j][1] - p[i][1]);
  return Math.abs(a / 2);
}

/** Walk collision: short horizontal rays at knee and chest height in the direction of travel. */
export function makeUnitBlocker(colliders: THREE.Object3D[]) {
  const ray = new THREE.Raycaster();
  return (from: THREE.Vector3, to: THREE.Vector3) => {
    const d = to.clone().sub(from).setY(0);
    const len = d.length();
    if (len < 1e-5) return false;
    d.normalize();
    for (const h of [0.5, 1.3]) {
      ray.set(new THREE.Vector3(from.x, h, from.z), d);
      ray.far = len + 0.28;
      if (ray.intersectObjects(colliders, false).length) return true;
    }
    return false;
  };
}
