import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Engine, speak, type Mode } from '../three/engine';
import { BUILDINGS, TOUR, buildSite, makeSiteBlocker, stopPose, toPx, toWorld, type SiteScene } from '../three/siteScene';
import { HOTSPOTS, MASTER } from '../data/masterPlan';
import { PLANS } from '../data/plans.generated';
import { Joystick, ModeBar, TourCaption, WalkHelp } from './ThreeControls';

interface Props {
  onOpenPlan: (id: string) => void;
  onOpenUnit3D: (id: string) => void;
}

const TOUR_DWELL = 9; // seconds per stop

/**
 * 3D site: massing model on the rendered master plan.
 * Click a building/amenity (or its label, or the mini-map) to fly there and see its details.
 */
export function Site3DView({ onOpenPlan, onOpenUnit3D }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const eng = useRef<Engine | null>(null);
  const site = useRef<SiteScene | null>(null);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [mode, setModeState] = useState<Mode>('orbit');
  const [sel, setSel] = useState<string | null>(null);
  const [tourI, setTourI] = useState<number | null>(null);
  const [voice, setVoice] = useState(false);
  const [ghosts, setGhosts] = useState(true);
  const dot = useRef<HTMLDivElement>(null);
  const tourTimer = useRef(0);
  const voiceRef = useRef(voice);
  voiceRef.current = voice;

  /* ---------------------------------------------------------- setup */
  useEffect(() => {
    const el = host.current!;
    const e = new Engine(el, {
      eyeHeight: 1.7,
      walkSpeed: 4,
      bounds: new THREE.Box2(new THREE.Vector2(-78, -152), new THREE.Vector2(78, 152)),
    });
    const tex = new THREE.TextureLoader().load(MASTER.image);
    const sc = buildSite(e, tex);
    e.setBlocker(makeSiteBlocker(sc.colliders));
    eng.current = e;
    site.current = sc;
    e.walkLabelRange = 90;
    setEngine(e);
    const home = stopPose(TOUR[0]);
    e.camera.position.copy(home.pos);
    e.controls.target.copy(home.target);

    // Click picking (ignore drags).
    let down: { x: number; y: number } | null = null;
    const ray = new THREE.Raycaster();
    const ground = e.scene.getObjectByName('ground')!;
    const pd = (ev: PointerEvent) => (down = { x: ev.clientX, y: ev.clientY });
    const pu = (ev: PointerEvent) => {
      if (!down || Math.hypot(ev.clientX - down.x, ev.clientY - down.y) > 5) return;
      ray.setFromCamera(e.ndc(ev), e.camera);
      const hit = ray.intersectObjects(sc.buildingMeshes.filter((m) => m.visible), false)[0];
      if (hit) return pick(hit.object.userData.id);
      const g = ray.intersectObject(ground, false)[0];
      if (g) {
        const { x, y } = toPx(g.point);
        const h = HOTSPOTS.find((q) => q.kind !== 'tower' && q.rects.some(([rx, ry, rw, rh]) => x >= rx && x <= rx + rw && y >= ry && y <= ry + rh));
        if (h) return pick(h.id);
        if (e.mode === 'walk') return; // in walk mode a ground click shouldn't deselect
      }
      setSel(null);
    };
    e.renderer.domElement.addEventListener('pointerdown', pd);
    e.renderer.domElement.addEventListener('pointerup', pu);

    // Mini-map marker.
    e.onFrame = () => {
      const d = dot.current;
      if (!d) return;
      const p = e.mode === 'walk' ? e.camera.position : e.controls.target;
      const { x, y } = toPx(p);
      const dir = new THREE.Vector3();
      e.camera.getWorldDirection(dir);
      const ang = Math.atan2(dir.x, -dir.z);
      d.style.left = `${(x / MASTER.width) * 100}%`;
      d.style.top = `${(y / MASTER.height) * 100}%`;
      d.style.transform = `translate(-50%,-50%) rotate(${ang}rad)`;
    };

    return () => {
      e.renderer.domElement.removeEventListener('pointerdown', pd);
      e.renderer.domElement.removeEventListener('pointerup', pu);
      clearTimeout(tourTimer.current);
      speak('', false);
      e.dispose();
      eng.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    site.current?.setHighlight(sel);
  }, [sel]);
  useEffect(() => {
    site.current?.setShowGhost(ghosts);
  }, [ghosts]);

  /* ---------------------------------------------------------- actions */
  const flyToId = useCallback((id: string) => {
    const e = eng.current;
    if (!e) return;
    const stop = TOUR.find((t) => t.id === id);
    if (stop) {
      const { pos, target } = stopPose(stop);
      if (e.mode === 'walk') {
        // Walk: land in front of it at ground level.
        const dir = pos.clone().sub(target).setY(0).normalize();
        const b = BUILDINGS.find((q) => q.id === id);
        e.flyTo(target.clone().addScaledVector(dir, b ? 45 : 18), target.clone().setY(b ? 20 : 0), 1.8);
      } else e.flyTo(pos, target, 1.8);
      return;
    }
    const h = HOTSPOTS.find((q) => q.id === id);
    if (h) {
      const [x, y, w, hh] = h.rects[0];
      const target = toWorld(x + w / 2, y + hh / 2);
      const span = Math.max(w, hh) * 0.2;
      if (e.mode === 'walk') e.flyTo(target.clone().add(new THREE.Vector3(0, 0, span + 10)), target, 1.6);
      else e.flyTo(target.clone().add(new THREE.Vector3(0, span * 1.6 + 25, span * 1.6 + 30)), target, 1.6);
    }
  }, []);

  const pick = useCallback(
    (id: string) => {
      stopTour();
      setSel(id);
      flyToId(id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flyToId],
  );
  useEffect(() => {
    if (engine) engine.onPick = pick;
  }, [engine, pick]);

  const setMode = (m: Mode) => {
    stopTour();
    const e = eng.current;
    if (!e) return;
    const was = e.mode;
    e.setMode(m);
    if (m === 'walk' && was !== 'walk') {
      // Start somewhere open: in front of the selected building, else on the central boulevard.
      const stop = TOUR.find((t) => t.id === sel && t.id);
      if (stop) {
        const { pos, target } = stopPose(stop);
        const dir = pos.clone().sub(target).setY(0).normalize();
        const p0 = target.clone().addScaledVector(dir, 35);
        e.placeWalker(p0, Math.atan2(-dir.x, dir.z));
      } else {
        e.placeWalker(toWorld(400, 1222), 0); // road south of the reflection pool, facing north
      }
    }
    setModeState(m);
  };

  /* ------------------------------------------------------------- tour */
  const goStop = useCallback((i: number) => {
    const e = eng.current;
    if (!e) return;
    if (e.mode === 'walk') {
      e.setMode('orbit');
      setModeState('orbit');
    }
    clearTimeout(tourTimer.current);
    if (i >= TOUR.length) {
      setTourI(null);
      e.controls.autoRotate = false;
      speak('', false);
      return;
    }
    const t = TOUR[i];
    setTourI(i);
    setSel(t.id || null);
    e.controls.autoRotate = false;
    const { pos, target } = stopPose(t);
    e.flyTo(pos, target, 2.6, () => {
      e.controls.autoRotate = true;
    });
    speak(t.text, voiceRef.current);
    tourTimer.current = window.setTimeout(() => goStop(i + 1), TOUR_DWELL * 1000 + 2600);
  }, []);

  function stopTour() {
    clearTimeout(tourTimer.current);
    if (eng.current) eng.current.controls.autoRotate = false;
    setTourI(null);
    speak('', false);
  }

  const toggleTour = () => (tourI === null ? goStop(0) : stopTour());

  const home = () => {
    stopTour();
    setSel(null);
    if (eng.current?.mode === 'walk') {
      eng.current.setMode('orbit');
      setModeState('orbit');
    }
    const { pos, target } = stopPose(TOUR[0]);
    eng.current?.flyTo(pos, target, 1.8);
  };

  const miniClick = (ev: React.MouseEvent<HTMLDivElement>) => {
    const r = ev.currentTarget.getBoundingClientRect();
    const x = ((ev.clientX - r.left) / r.width) * MASTER.width;
    const y = ((ev.clientY - r.top) / r.height) * MASTER.height;
    const e = eng.current!;
    const target = toWorld(x, y);
    stopTour();
    if (e.mode === 'walk') {
      const fwd = new THREE.Vector3();
      e.camera.getWorldDirection(fwd);
      e.flyTo(target, target.clone().add(fwd.setY(0).multiplyScalar(10)), 1.4);
    } else {
      const off = e.camera.position.clone().sub(e.controls.target);
      e.flyTo(target.clone().add(off), target, 1.4);
    }
  };

  /* ------------------------------------------------------------- info */
  const b = BUILDINGS.find((q) => q.id === sel);
  const h = !b ? HOTSPOTS.find((q) => q.id === sel) : undefined;
  const stop = tourI !== null ? TOUR[tourI] : null;

  return (
    <div className="workspace">
      <div className="stage-wrap">
        <div className="stage three" ref={host}>
          <ModeBar
            mode={mode}
            touring={tourI !== null}
            voice={voice}
            onMode={setMode}
            onTour={toggleTour}
            onVoice={() => {
              const v = !voice;
              setVoice(v);
              if (stop) speak(stop.text, v);
              else speak('', false);
            }}
            onHome={home}
          />
          <div className="minimap" onClick={miniClick} title="Click to go there">
            <img src={MASTER.image} alt="Site plan mini-map" draggable={false} />
            <div className="you" ref={dot} />
          </div>
          {mode === 'walk' && tourI === null && (
            <>
              <WalkHelp />
              <Joystick engine={engine} />
            </>
          )}
          {stop && (
            <TourCaption
              title={stop.title}
              text={stop.text}
              i={tourI!}
              n={TOUR.length}
              onPrev={() => goStop(Math.max(0, tourI! - 1))}
              onNext={() => goStop(tourI! + 1)}
              onStop={stopTour}
            />
          )}
        </div>
      </div>

      <aside className="side">
        <section className="card info">
          {b ? (
            <>
              <div className="info-head">
                <div>
                  <div className="eyebrow">{b.id.startsWith('tower') ? 'Residential tower' : 'Building'}</div>
                  <h2>
                    {b.name}
                    {b.ghost && <span className="badge">not to height</span>}
                  </h2>
                </div>
                <button className="ghost" onClick={() => setSel(null)} aria-label="Clear selection">
                  ✕
                </button>
              </div>
              <dl className="kv">
                {b.marking && (
                  <div>
                    <dt>Storeys (as marked)</dt>
                    <dd>{b.marking}</dd>
                  </div>
                )}
                <div>
                  <dt>3D height</dt>
                  <dd className="small">{b.heightNote}</dd>
                </div>
              </dl>
              <p className="notes" style={{ marginTop: 12 }}>
                {b.detail}
              </p>
              {b.plans && (
                <>
                  <h4>Unit plans</h4>
                  <ul className="room-list plans3d">
                    {b.plans.map((pid) => {
                      const p = PLANS.find((q) => q.id === pid)!;
                      return (
                        <li key={pid}>
                          <div className="pl-row">
                            <span className="rn">
                              {p.title.split('·')[1]}
                              <small>{p.config}</small>
                            </span>
                            <button className="mini" onClick={() => onOpenPlan(pid)}>
                              2D plan
                            </button>
                            <button className="mini accent" onClick={() => onOpenUnit3D(pid)}>
                              3D walk
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </>
          ) : h ? (
            <>
              <div className="info-head">
                <div>
                  <div className="eyebrow">Amenity</div>
                  <h2>{h.name}</h2>
                </div>
                <button className="ghost" onClick={() => setSel(null)} aria-label="Clear selection">
                  ✕
                </button>
              </div>
              <p className="muted">As labelled on the site plan. Shown on the ground plane (not modelled in 3D).</p>
            </>
          ) : (
            <>
              <div className="eyebrow">3D site</div>
              <h2>Vāyu · Wind Park</h2>
              <p className="muted">Click a tower, an amenity, a label or the mini-map to fly there. Try <b>Walk</b> or <b>Auto tour</b>.</p>
              <ul className="room-list">
                {BUILDINGS.map((q) => (
                  <li key={q.id}>
                    <button onClick={() => pick(q.id)}>
                      <span className="rn">{q.name}</span>
                      <span className="ra">{q.marking ?? '—'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
        <section className="card">
          <ul className="layers">
            <li>
              <label>
                <input type="checkbox" checked={ghosts} onChange={() => setGhosts((v) => !v)} />
                <span className="switch" aria-hidden />
                <span>Towers 4 &amp; 5 (height not marked)</span>
              </label>
            </li>
          </ul>
          <p className="source-note">
            Massing model: footprints traced from the site plan; scale ≈ 0.2 m per plan pixel (estimated from cars and roads); heights from the
            marked storeys at an assumed 3 m per floor. Façades are illustrative, not the actual elevation design.
          </p>
        </section>
      </aside>
    </div>
  );
}
