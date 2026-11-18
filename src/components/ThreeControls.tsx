import { useEffect, useRef } from 'react';
import type { Engine, Mode } from '../three/engine';

/** Mode switcher: Map (orbit) · Walk · Auto tour, plus narration toggle. */
export function ModeBar(p: {
  mode: Mode;
  touring: boolean;
  voice: boolean;
  onMode: (m: Mode) => void;
  onTour: () => void;
  onVoice: () => void;
  onHome: () => void;
}) {
  return (
    <div className="modebar" role="toolbar" aria-label="3D view mode">
      <button className={p.mode === 'orbit' && !p.touring ? 'on' : ''} onClick={() => p.onMode('orbit')} title="Map view: drag to pan, right-drag / two fingers to rotate and tilt, scroll to zoom">
        🗺️ <span>Map</span>
      </button>
      <button className={p.mode === 'walk' && !p.touring ? 'on' : ''} onClick={() => p.onMode('walk')} title="Walk: W A S D / arrows to move, drag to look, Shift to run">
        🚶 <span>Walk</span>
      </button>
      <button className={p.touring ? 'on' : ''} onClick={p.onTour} title="Auto tour">
        {p.touring ? '⏸' : '▶'} <span>{p.touring ? 'Pause tour' : 'Auto tour'}</span>
      </button>
      <span className="sep" />
      <button onClick={p.onVoice} title={p.voice ? 'Narration on' : 'Narration off'} aria-pressed={p.voice}>
        {p.voice ? '🔊' : '🔈'}
      </button>
      <button onClick={p.onHome} title="Overview">
        ⌂
      </button>
    </div>
  );
}

/** Tour caption with previous / next. */
export function TourCaption(p: { title: string; text: string; i: number; n: number; onPrev: () => void; onNext: () => void; onStop: () => void }) {
  return (
    <div className="tour-caption" aria-live="polite">
      <div className="tc-head">
        <span className="tc-step">
          {p.i + 1} / {p.n}
        </span>
        <strong>{p.title}</strong>
        <button className="tc-x" onClick={p.onStop} aria-label="End tour">
          ✕
        </button>
      </div>
      <p>{p.text}</p>
      <div className="tc-nav">
        <button onClick={p.onPrev} disabled={p.i === 0}>
          ‹ Prev
        </button>
        <button onClick={p.onNext}>{p.i === p.n - 1 ? 'Finish' : 'Next ›'}</button>
      </div>
    </div>
  );
}

/** On-screen joystick for walking on touch devices (also works with a mouse). */
export function Joystick({ engine }: { engine: Engine | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !engine) return;
    let id: number | null = null;
    const set = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      let x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      let y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      const m = Math.hypot(x, y);
      if (m > 1) {
        x /= m;
        y /= m;
      }
      engine.stick.x = x;
      engine.stick.y = y;
      if (knob.current) knob.current.style.transform = `translate(${x * 28}px,${y * 28}px)`;
    };
    const down = (e: PointerEvent) => {
      id = e.pointerId;
      el.setPointerCapture(e.pointerId);
      set(e);
      e.stopPropagation();
    };
    const move = (e: PointerEvent) => e.pointerId === id && set(e);
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = null;
      engine.stick.x = engine.stick.y = 0;
      if (knob.current) knob.current.style.transform = '';
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [engine]);
  return (
    <div className="joystick" ref={ref} aria-label="Move joystick">
      <div className="knob" ref={knob} />
    </div>
  );
}

export function WalkHelp() {
  return (
    <div className="walk-help">
      <b>W A S D</b> / arrows move · drag to look · <b>Shift</b> run · <b>Q / E</b> turn
    </div>
  );
}
