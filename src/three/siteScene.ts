import * as THREE from 'three';
import footprints from '../data/siteFootprints.json';
import { HOTSPOTS, MASTER } from '../data/masterPlan';
import { Engine, facadeTexture, inPoly } from './engine';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { FACADE, SITE_COLOURS } from '../data/facade';

/**
 * 3D massing model of the site, built on top of the rendered master plan.
 *
 * Scale: 1 px of the master plan ≈ 0.2 m (estimated from car and carriageway sizes on the
 * rendering – the site plan has no scale bar). Heights use the storey counts marked on the
 * plan (e.g. "S+24" = stilt + 24 floors) at an assumed 3.0 m floor-to-floor.
 */
export const PX = 0.2;
const CX = MASTER.width / 2;
const CY = MASTER.height / 2;
export const toWorld = (x: number, y: number) => new THREE.Vector3((x - CX) * PX, 0, (y - CY) * PX);
export const toPx = (v: THREE.Vector3) => ({ x: v.x / PX + CX, y: v.z / PX + CY });

export const FLOOR_H = 3.0;

export interface BuildingInfo {
  id: string;
  name: string;
  marking?: string; // storey marking as printed on the site plan
  levels: number;
  heightNote: string;
  ghost?: boolean;
  plans?: string[];
  detail: string;
}

export const BUILDINGS: BuildingInfo[] = [
  { id: 'tower7', name: 'Tower 7', marking: 'S+24', levels: 25, heightNote: '≈ 75 m (25 levels × 3 m, assumed)', plans: ['t67-997-1', 't67-997-2', 't67-997-3'], detail: 'Two cores, units 1–8 per floor as numbered on the site plan.' },
  { id: 'tower6', name: 'Tower 6', marking: 'S+24', levels: 25, heightNote: '≈ 75 m (25 levels × 3 m, assumed)', plans: ['t67-997-1', 't67-997-2', 't67-997-3'], detail: 'Two cores, units 1–8 per floor as numbered on the site plan.' },
  { id: 'tower3', name: 'Tower 3', marking: 'S+22', levels: 23, heightNote: '≈ 69 m (23 levels × 3 m, assumed)', plans: ['t23-1245', 't23-1505'], detail: 'Four units per floor (1–4).' },
  { id: 'tower2', name: 'Tower 2 · Sky Villa', marking: 'S+22', levels: 23, heightNote: '≈ 69 m (23 levels × 3 m, assumed)', plans: ['t23-1245', 't23-1505'], detail: 'Four units per floor (1–4). Labelled “Sky Villa”. Massing traced approximately.' },
  { id: 'tower1', name: 'Tower 1', marking: 'S+22', levels: 23, heightNote: '≈ 69 m (23 levels × 3 m, assumed)', plans: ['t1-1245', 't1-1505'], detail: 'Four units per floor (1–4). Massing traced approximately.' },
  { id: 'tower4', name: 'Tower 4', levels: 23, ghost: true, heightNote: 'Storeys not marked on site plan – shown translucent at a nominal height', detail: 'No unit plan was supplied for this tower.' },
  { id: 'tower5', name: 'Tower 5', levels: 23, ghost: true, heightNote: 'Storeys not marked on site plan – shown translucent at a nominal height', detail: 'Marked “Tower-5 **” on the site plan (footnote not supplied). No unit plan supplied.' },
  { id: 'club', name: 'Club', levels: 2, ghost: false, heightNote: 'Height not stated – nominal 2 storeys', detail: 'Marked “Club **” on the site plan (footnote not supplied).' },
  { id: 'commercial', name: 'Commercial', levels: 2, heightNote: 'Height not stated – nominal 2 storeys', detail: 'Commercial block along the main road, between the site entry and exit.' },
];

export interface TourStop {
  id: string; // building or hotspot id ('' for overview)
  title: string;
  text: string;
  target: [number, number]; // master-plan px
  dist: number;
  polar: number; // degrees from vertical
  azim: number; // degrees
  y?: number;
}

export const TOUR: TourStop[] = [
  { id: '', title: 'Wind Park', text: 'Welcome to Wind Park. The site has seven residential towers, a club, a commercial block and landscaped central amenities.', target: [400, 760], dist: 330, polar: 50, azim: 200 },
  { id: 'commercial', title: 'Entry & Commercial', text: 'Vehicles enter and exit from the main road at the south, on either side of the commercial block.', target: [400, 1340], dist: 120, polar: 62, azim: 180 },
  { id: 'club', title: 'Club', text: 'The club sits just behind the commercial block, facing the residential towers.', target: [402, 1272], dist: 80, polar: 60, azim: 160 },
  { id: 'reflection', title: 'Reflection Pool', text: 'A reflection pool with fountains leads into the central landscape, between Tower 1 and Tower 2.', target: [400, 1148], dist: 90, polar: 58, azim: 180 },
  { id: 'tower1', title: 'Tower 1', text: 'Tower 1 is stilt plus 22 floors with four homes per floor: Type 1245, three bedrooms and two toilets, and Type 1505, three bedrooms, three toilets, a study and a powder room.', target: [215, 1110], dist: 170, polar: 62, azim: 215 },
  { id: 'tower2', title: 'Tower 2 · Sky Villa', text: 'Tower 2, the Sky Villa tower, is stilt plus 22 floors with four homes per floor.', target: [585, 1110], dist: 170, polar: 62, azim: 145 },
  { id: 'lawns', title: 'Lawns & Stage', text: 'Lawns with sit-out areas and a stage for events form the green spine of the site.', target: [405, 970], dist: 110, polar: 55, azim: 180 },
  { id: 'kids', title: 'Kids Play & Skating', text: 'On the west are the kids play area and the skating rink.', target: [215, 960], dist: 90, polar: 55, azim: 230 },
  { id: 'tower3', title: 'Tower 3', text: 'Tower 3 is stilt plus 22 floors with four homes per floor, using the same unit types as Tower 2.', target: [592, 922], dist: 170, polar: 62, azim: 120 },
  { id: 'shrine', title: 'Shrine & Meditation Garden', text: 'The shrine and meditation garden sits at the head of the central lawns.', target: [402, 835], dist: 80, polar: 55, azim: 180 },
  { id: 'pool', title: 'Half-Olympic Pool', text: 'A half Olympic length pool with a kids pool and changing room.', target: [387, 670], dist: 120, polar: 55, azim: 200 },
  { id: 'court', title: 'Multisports Court', text: 'A synthetic multisports court, with the amphitheatre beyond it to the north.', target: [413, 420], dist: 130, polar: 55, azim: 190 },
  { id: 'tower7', title: 'Tower 7', text: 'Towers 6 and 7 are stilt plus 24 floors, each with two cores and eight two-bedroom homes per floor, in Types 997-1, 997-2 and 997-3.', target: [611, 334], dist: 220, polar: 62, azim: 120 },
  { id: 'tower6', title: 'Tower 6', text: 'Tower 6, with the badminton court and outdoor gym at its southern end.', target: [611, 640], dist: 220, polar: 62, azim: 110 },
  { id: 'tower4', title: 'Towers 4 & 5', text: 'Towers 4 and 5 are on the west side. Their storey count is not marked on the site plan and no unit plans were supplied, so they are shown translucent.', target: [214, 680], dist: 230, polar: 60, azim: 250 },
];

/** Positions of the large trees drawn on the rendering (master-plan px), used for 3D trees. */
const TREES: [number, number, number][] = [
  [745, 330, 1], [742, 510, 1], [738, 690, 1], [733, 860, 1], [742, 1040, 0.8], [745, 1220, 1],
  [65, 605, 1], [62, 780, 1], [60, 950, 1], [60, 1320, 1], [70, 1140, 0.8],
  [350, 905, 0.6], [440, 905, 0.6], [350, 990, 0.6], [440, 990, 0.6], [395, 1035, 0.6],
  [330, 1150, 0.55], [470, 1150, 0.55], [180, 1390, 0.6], [330, 1385, 0.6], [460, 1385, 0.6], [610, 1390, 0.6],
];

export interface SiteScene {
  buildingMeshes: THREE.Mesh[];
  colliders: [number, number][][]; // XZ polygons
  meshById: Map<string, THREE.Mesh[]>;
  setHighlight: (id: string | null) => void;
  setShowGhost: (on: boolean) => void;
}

export function buildSite(engine: Engine, groundTex: THREE.Texture): SiteScene {
  const { scene } = engine;
  scene.background = new THREE.Color(SITE_COLOURS.sky);
  scene.fog = new THREE.Fog(SITE_COLOURS.sky, 400, 1400);

  // Lights: soft sky + sun with shadows.
  scene.add(new THREE.HemisphereLight('#ffffff', '#8a9a7a', 1.1));
  const sun = new THREE.DirectionalLight('#fff4e0', 2.2);
  sun.position.set(-160, 260, 120);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera as THREE.OrthographicCamera;
  sc.left = -220;
  sc.right = 220;
  sc.top = 220;
  sc.bottom = -220;
  sc.far = 800;
  sun.shadow.bias = -0.0005;
  scene.add(sun);

  // Ground: the rendered master plan, plus a wider neutral apron.
  const W = MASTER.width * PX;
  const H = MASTER.height * PX;
  groundTex.colorSpace = THREE.SRGBColorSpace;
  groundTex.anisotropy = engine.renderer.capabilities.getMaxAnisotropy();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshStandardMaterial({ map: groundTex, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = 'ground';
  scene.add(ground);
  const apron = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshStandardMaterial({ color: '#c9c6bd', roughness: 1 }));
  apron.rotation.x = -Math.PI / 2;
  apron.position.y = -0.05;
  apron.receiveShadow = true;
  scene.add(apron);

  // Buildings: extrude the footprints traced from the plan.
  const fac = facadeTexture();
  const facGhost = facadeTexture({ base: '#f1eee6', feature: '#cbd8ea', white: '#f6f5f0', balconyWall: '#e6e1d4', railing: '#8b9296', glass: '#9fb0bf' });
  const roofMat = new THREE.MeshStandardMaterial({ color: FACADE.crown, roughness: 0.95 });
  const fp = footprints as Record<string, number[][][]>;
  const buildingMeshes: THREE.Mesh[] = [];
  const meshById = new Map<string, THREE.Mesh[]>();
  const colliders: [number, number][][] = [];
  const baseMats = new Map<THREE.Mesh, THREE.Material[]>();

  for (const b of BUILDINGS) {
    const polys = fp[b.id] ?? [];
    const height = b.levels * FLOOR_H;
    const sideMat = new THREE.MeshStandardMaterial({
      map: b.ghost ? facGhost : fac,
      roughness: 0.85,
      transparent: !!b.ghost,
      opacity: b.ghost ? 0.55 : 1,
    });
    const top = b.ghost ? new THREE.MeshStandardMaterial({ color: '#e9e6e0', transparent: true, opacity: 0.55 }) : roofMat;
    const list: THREE.Mesh[] = [];
    for (const poly of polys) {
      const shape = new THREE.Shape(poly.map(([x, y]) => {
        const w = toWorld(x, y);
        return new THREE.Vector2(w.x, -w.z);
      }));
      const geo = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
      geo.rotateX(-Math.PI / 2); // shape (x, −z) → world XZ, extrusion → +Y
      const mesh = new THREE.Mesh(geo, [top, sideMat]);
      mesh.castShadow = !b.ghost;
      mesh.receiveShadow = true;
      mesh.userData.id = b.id;
      scene.add(mesh);
      list.push(mesh);
      buildingMeshes.push(mesh);
      baseMats.set(mesh, [top, sideMat]);
      colliders.push(poly.map(([x, y]) => {
        const w = toWorld(x, y);
        return [w.x, w.z];
      }));
      // Roof parapet edge for definition.
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), new THREE.LineBasicMaterial({ color: '#8f8a80', transparent: true, opacity: 0.5 }));
      mesh.add(edges);
    }
    meshById.set(b.id, list);
    const c = centroid(polys.flat() as unknown as [number, number][]);
    engine.addLabel(`${b.name}${b.marking ? ' · ' + b.marking : ''}`, toWorld(c[0], c[1]).setY(height + 4), 'bldg', () => engine.onPick?.(b.id));
  }

  // Water on the pools for a little sheen.
  const water = new THREE.MeshStandardMaterial({ color: SITE_COLOURS.pool, transparent: true, opacity: 0.55, roughness: 0.1, metalness: 0.2 });
  for (const [x, y, w, h] of [[352, 598, 82, 168], [413, 588, 32, 34]] as const) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w * PX, h * PX), water);
    m.rotation.x = -Math.PI / 2;
    m.position.copy(toWorld(x + w / 2, y + h / 2)).setY(0.08);
    scene.add(m);
  }

  // Trees: palms along the edges and at the entrance (as in the renders), round-canopy trees inside.
  const isPalm = (x: number, y: number) => y > 1370 || x < 80 || x > 720;
  const palms = TREES.filter(([x, y]) => isPalm(x, y));
  const round = TREES.filter(([x, y]) => !isPalm(x, y));

  const trunkGeo = new THREE.CylinderGeometry(0.35, 0.5, 4, 6);
  const crownGeo = new THREE.IcosahedronGeometry(3.6, 1);
  const trunks = new THREE.InstancedMesh(trunkGeo, new THREE.MeshStandardMaterial({ color: '#6b4f36' }), round.length);
  const crowns = new THREE.InstancedMesh(crownGeo, new THREE.MeshStandardMaterial({ color: '#4f7d36', roughness: 0.9, flatShading: true }), round.length);
  const m4 = new THREE.Matrix4();
  round.forEach(([x, y, s], i) => {
    const p = toWorld(x, y);
    m4.compose(p.clone().setY(2 * s), new THREE.Quaternion(), new THREE.Vector3(s, s, s));
    trunks.setMatrixAt(i, m4);
    m4.compose(p.clone().setY(6.5 * s), new THREE.Quaternion(), new THREE.Vector3(s, s * 0.9, s));
    crowns.setMatrixAt(i, m4);
  });
  trunks.castShadow = crowns.castShadow = true;
  scene.add(trunks, crowns);

  const palmTrunkGeo = new THREE.CylinderGeometry(0.28, 0.42, 9, 6);
  palmTrunkGeo.translate(0, 4.5, 0);
  const frondParts: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 9; k++) {
    const f = new THREE.ConeGeometry(0.55, 5.2, 4);
    f.scale(1, 1, 0.25); // flatten into a blade
    f.translate(0, 2.6, 0);
    f.rotateZ(THREE.MathUtils.degToRad(72 + (k % 2) * 12)); // droop outwards
    f.rotateY((k / 9) * Math.PI * 2);
    f.translate(0, 9, 0);
    frondParts.push(f);
  }
  const palmFrondGeo = mergeGeometries(frondParts)!;
  const palmTrunks = new THREE.InstancedMesh(palmTrunkGeo, new THREE.MeshStandardMaterial({ color: SITE_COLOURS.palmTrunk, roughness: 1 }), palms.length);
  const palmFronds = new THREE.InstancedMesh(palmFrondGeo, new THREE.MeshStandardMaterial({ color: SITE_COLOURS.palmFrond, roughness: 0.9, side: THREE.DoubleSide }), palms.length);
  palms.forEach(([x, y, s], i) => {
    const p = toWorld(x, y);
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), i * 1.7);
    m4.compose(p, q, new THREE.Vector3(s, s, s));
    palmTrunks.setMatrixAt(i, m4);
    palmFronds.setMatrixAt(i, m4);
  });
  palmTrunks.castShadow = palmFronds.castShadow = true;
  scene.add(palmTrunks, palmFronds);

  // Amenity labels (visible when reasonably close).
  for (const h of HOTSPOTS) {
    if (h.kind === 'tower' || h.id === 'club' || h.id === 'commercial') continue;
    const [x, y, w, hh] = h.rects[0];
    engine.addLabel(h.name, toWorld(x + w / 2, y + hh / 2).setY(h.id === 'club' || h.id === 'commercial' ? 11 : 3), 'amenity', () => engine.onPick?.(h.id), h.id === 'commercial' ? undefined : 260);
  }

  // Highlight by swapping in an emissive copy of the materials.
  const hiCache = new Map<THREE.Material, THREE.Material>();
  const hi = (m: THREE.Material) => {
    if (!hiCache.has(m)) {
      const c = (m as THREE.MeshStandardMaterial).clone();
      c.emissive = new THREE.Color('#7a1f2b');
      c.emissiveIntensity = 0.35;
      hiCache.set(m, c);
    }
    return hiCache.get(m)!;
  };
  let showGhost = true;
  return {
    buildingMeshes,
    colliders,
    meshById,
    setHighlight(id) {
      for (const m of buildingMeshes) {
        const base = baseMats.get(m)!;
        m.material = m.userData.id === id ? base.map(hi) : base;
      }
    },
    setShowGhost(on) {
      showGhost = on;
      for (const b of BUILDINGS) if (b.ghost) meshById.get(b.id)?.forEach((m) => (m.visible = showGhost));
    },
  };
}

function centroid(pts: [number, number][]): [number, number] {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
}

/** Walk-mode collision against building footprints (with a 0.6 m body radius). */
export function makeSiteBlocker(colliders: [number, number][][]) {
  const r = 0.6;
  return (_from: THREE.Vector3, to: THREE.Vector3) =>
    colliders.some((p) =>
      [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]].some(([dx, dz]) => inPoly(to.x + dx, to.z + dz, p)),
    );
}

/** Camera pose for a stop: orbit around a target at (dist, polar°, azimuth°). */
export function stopPose(t: TourStop) {
  const target = toWorld(t.target[0], t.target[1]).setY(t.y ?? 0);
  const ph = THREE.MathUtils.degToRad(t.polar);
  const th = THREE.MathUtils.degToRad(t.azim);
  const pos = target.clone().add(new THREE.Vector3(Math.sin(ph) * Math.sin(th), Math.cos(ph), -Math.sin(ph) * Math.cos(th)).multiplyScalar(t.dist));
  return { pos, target };
}
