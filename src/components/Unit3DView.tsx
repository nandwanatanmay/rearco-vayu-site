import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { PlanData, Room } from '../data/types';
import { Engine, speak, type Mode } from '../three/engine';
import { buildUnit, makeUnitBlocker, type UnitScene } from '../three/unitScene';
import { ROOM_TYPES } from '../data/roomTypes';
import { Joystick, ModeBar, TourCaption, WalkHelp } from './ThreeControls';

const DWELL = 7;

/** Spoken/caption text for a room, built only from printed values. */
function describe(r: Room) {
  const parts = [r.name.replace(/\s*\(.*\)/, '') + '.'];
  if (r.w && r.l) parts.push(`${r.w} by ${r.l} millimetres.`);
  if (r.width) parts.push(`${r.width}.`);
  if (r.area != null) parts.push(`${r.area.toFixed(2)} square metres.`);
  if (r.fixtures.length) parts.push(`Shown with ${r.fixtures.slice(0, 3).join(', ').toLowerCase()}.`);
  return parts.join(' ');
}

/** 3D walk-through of one unit, generated from the 2D plan data. */
export function Unit3DView({ plan, onBack2D, onSite }: { plan: PlanData; onBack2D: () => void; onSite: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const eng = useRef<Engine | null>(null);
  const unit = useRef<UnitScene | null>(null);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [mode, setModeState] = useState<Mode>('orbit');
  const [sel, setSel] = useState<string | null>(null);
  const [here, setHere] = useState<string | null>(null);
  const [tourI, setTourI] = useState<number | null>(null);
  const [voice, setVoice] = useState(false);
  const voiceRef = useRef(voice);
  voiceRef.current = voice;
  const timer = useRef(0);
  const stops = plan.rooms.filter((r) => r.type !== 'service');

  const overview = useCallback(() => {
    const e = eng.current!;
    const u = unit.current!;
    e.flyTo(new THREE.Vector3(u.size * 0.15, u.size * 0.95, u.size * 0.75), new THREE.Vector3(0, 0, 0), 1.4);
  }, []);

  useEffect(() => {
    const e = new Engine(host.current!, {
      eyeHeight: 1.6,
      walkSpeed: 1.6,
      bounds: new THREE.Box2(new THREE.Vector2(-30, -30), new THREE.Vector2(30, 30)),
    });
    e.controls.maxDistance = 60;
    e.walkLabelRange = 8;
    e.controls.minDistance = 2;
    e.camera.near = 0.05;
    e.camera.updateProjectionMatrix();
    const tex = new THREE.TextureLoader().load(plan.furnitureImage);
    const u = buildUnit(e, plan, tex);
    e.setBlocker(makeUnitBlocker(u.colliders));
    const b = new THREE.Box2(new THREE.Vector2(-u.size / 2 - 1, -u.size / 2 - 1), new THREE.Vector2(u.size / 2 + 1, u.size / 2 + 1));
    e.setBounds(b);
    eng.current = e;
    unit.current = u;
    setEngine(e);
    e.camera.position.set(u.size * 0.15, u.size * 0.95, u.size * 0.75);
    e.controls.target.set(0, 0, 0);

    // Track which room the walker is in.
    let acc = 0;
    let last: string | null = null;
    e.onFrame = (dt) => {
      acc += dt;
      if (acc < 0.25) return;
      acc = 0;
      const p = e.mode === 'walk' ? e.camera.position : e.controls.target;
      const r = u.roomAt(p);
      const id = r?.id ?? null;
      if (id !== last) {
        last = id;
        setHere(id);
      }
    };

    // Click the floor to select a room.
    const ray = new THREE.Raycaster();
    let down: { x: number; y: number } | null = null;
    const pd = (ev: PointerEvent) => (down = { x: ev.clientX, y: ev.clientY });
    const pu = (ev: PointerEvent) => {
      if (!down || Math.hypot(ev.clientX - down.x, ev.clientY - down.y) > 5) return;
      ray.setFromCamera(e.ndc(ev), e.camera);
      const hit = ray.intersectObject(u.floor, false)[0];
      const r = hit ? u.roomAt(hit.point) : null;
      if (r) select(r.id, e.mode !== 'walk');
      else if (e.mode !== 'walk') setSel(null);
    };
    e.renderer.domElement.addEventListener('pointerdown', pd);
    e.renderer.domElement.addEventListener('pointerup', pu);
    return () => {
      e.renderer.domElement.removeEventListener('pointerdown', pd);
      e.renderer.domElement.removeEventListener('pointerup', pu);
      clearTimeout(timer.current);
      speak('', false);
      e.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);

  const flyToRoom = useCallback(
    (id: string) => {
      const e = eng.current;
      const u = unit.current;
      const r = plan.rooms.find((q) => q.id === id);
      if (!e || !u || !r) return;
      const t = u.toW(r.label[0], r.label[1]);
      if (e.mode === 'walk') {
        e.flyTo(t.clone().add(new THREE.Vector3(0, 0, 0.01)), t.clone().add(new THREE.Vector3(0, 0, -2)), 1.4);
      } else {
        e.flyTo(t.clone().add(new THREE.Vector3(0.8, 9, 4.5)), t, 1.4);
      }
    },
    [plan],
  );

  const select = useCallback(
    (id: string, fly = true) => {
      stopTour();
      setSel(id);
      if (fly) flyToRoom(id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flyToRoom],
  );
  useEffect(() => {
    if (engine) engine.onPick = (id) => select(id);
  }, [engine, select]);

  const setMode = (m: Mode) => {
    stopTour();
    const e = eng.current!;
    if (m === 'walk' && e.mode !== 'walk') {
      e.setMode('walk');
      e.placeWalker(unit.current!.start.pos, unit.current!.start.yaw);
    } else e.setMode(m);
    if (m === 'orbit') overview();
    setModeState(m);
  };

  const goStop = useCallback(
    (i: number) => {
      const e = eng.current!;
      clearTimeout(timer.current);
      if (e.mode === 'walk') {
        e.setMode('orbit');
        setModeState('orbit');
      }
      if (i >= stops.length) {
        setTourI(null);
        e.controls.autoRotate = false;
        speak('', false);
        overview();
        return;
      }
      const r = stops[i];
      setTourI(i);
      setSel(r.id);
      e.controls.autoRotate = false;
      const t = unit.current!.toW(r.label[0], r.label[1]);
      e.flyTo(t.clone().add(new THREE.Vector3(1, 8.5, 4.5)), t, 2, () => (e.controls.autoRotate = true));
      speak(describe(r), voiceRef.current);
      timer.current = window.setTimeout(() => goStop(i + 1), DWELL * 1000 + 2000);
    },
    [stops, overview],
  );

  function stopTour() {
    clearTimeout(timer.current);
    if (eng.current) eng.current.controls.autoRotate = false;
    setTourI(null);
    speak('', false);
  }

  const room = plan.rooms.find((r) => r.id === sel) ?? null;
  const hereRoom = plan.rooms.find((r) => r.id === here) ?? null;
  const stop = tourI !== null ? stops[tourI] : null;

  return (
    <div className="workspace">
      <div className="stage-wrap">
        <div className="stage three" ref={host}>
          <ModeBar
            mode={mode}
            touring={tourI !== null}
            voice={voice}
            onMode={setMode}
            onTour={() => (tourI === null ? goStop(0) : stopTour())}
            onVoice={() => {
              const v = !voice;
              setVoice(v);
              speak(stop ? describe(stop) : '', v);
            }}
            onHome={() => {
              stopTour();
              if (eng.current?.mode === 'walk') setMode('orbit');
              else overview();
            }}
          />
          {mode === 'walk' && hereRoom && <div className="here-chip">📍 {hereRoom.name}</div>}
          {mode === 'walk' && tourI === null && (
            <>
              <WalkHelp />
              <Joystick engine={engine} />
            </>
          )}
          {stop && (
            <TourCaption
              title={stop.name}
              text={describe(stop)}
              i={tourI!}
              n={stops.length}
              onPrev={() => goStop(Math.max(0, tourI! - 1))}
              onNext={() => goStop(tourI! + 1)}
              onStop={stopTour}
            />
          )}
        </div>
      </div>
      <aside className="side">
        <section className="card info">
          <div className="info-head">
            <div>
              <div className="eyebrow">3D walk-through · {plan.config}</div>
              <h2>{plan.title}</h2>
            </div>
          </div>
          <div className="btn-row">
            <button className="mini" onClick={onBack2D}>
              ← 2D plan
            </button>
            <button className="mini" onClick={onSite}>
              3D site
            </button>
          </div>
          {room ? (
            <>
              <h4>
                <span className="swatch" style={{ background: ROOM_TYPES[room.type].color }} /> {room.name}
              </h4>
              <dl className="kv">
                <div>
                  <dt>Area</dt>
                  <dd>{room.area != null ? `${room.area.toFixed(2)} m²` : <span className="na">not printed</span>}</dd>
                </div>
                {room.w && room.l ? (
                  <div>
                    <dt>Size (printed)</dt>
                    <dd>
                      {room.w} × {room.l} mm
                    </dd>
                  </div>
                ) : room.width ? (
                  <div>
                    <dt>Width</dt>
                    <dd>{room.width}</dd>
                  </div>
                ) : null}
              </dl>
              {room.fixtures.length > 0 && (
                <ul className="chips" style={{ marginTop: 10 }}>
                  {room.fixtures.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="muted">Click a room (on the floor or its label) to fly there.</p>
          )}
          <h4>Rooms</h4>
          <ul className="room-list">
            {stops.map((r) => (
              <li key={r.id}>
                <button onClick={() => select(r.id)} className={r.id === sel ? 'cur' : ''}>
                  <span className="swatch" style={{ background: ROOM_TYPES[r.type].color }} />
                  <span className="rn">{r.name}</span>
                  <span className="ra">{r.area != null ? `${r.area.toFixed(2)} m²` : '—'}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="source-note">
            Generated from the 2D plan: walls extruded from the drawing, plan artwork on the floor. Scale is estimated from printed room sizes;
            ceiling 2.9 m, sill 0.9 m and door head 2.1 m are assumed.
          </p>
        </section>
      </aside>
    </div>
  );
}
