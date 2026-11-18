import type { LayerKey, Layers, PlanData, Room, RoomType } from '../data/types';
import { ROOM_TYPES } from '../data/roomTypes';
import { metres } from '../geometry';

/* ------------------------------------------------------------------ Toolbar */

interface ToolbarProps {
  zoomPct: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onReset: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
}

export function Toolbar(p: ToolbarProps) {
  return (
    <div className="toolbar" role="toolbar" aria-label="Plan navigation">
      <button onClick={p.onZoomOut} title="Zoom out (−)" aria-label="Zoom out">
        <Icon d="M5 12h14" />
      </button>
      <span className="zoom-readout" aria-live="polite">
        {p.zoomPct}%
      </span>
      <button onClick={p.onZoomIn} title="Zoom in (+)" aria-label="Zoom in">
        <Icon d="M12 5v14M5 12h14" />
      </button>
      <span className="sep" />
      <button onClick={p.onFit} title="Fit to screen (F)" aria-label="Fit to screen">
        <Icon d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
      </button>
      <button onClick={p.onReset} title="Reset view & selection (0)" aria-label="Reset view">
        <Icon d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" />
      </button>
      <button onClick={p.onFullscreen} title="Full screen" aria-label="Toggle full screen">
        {p.isFullscreen ? (
          <Icon d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
        ) : (
          <Icon d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5M9 9h6v6H9z" />
        )}
      </button>
    </div>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

/* ------------------------------------------------------------- Layer panel */

const LAYER_DEFS: { key: LayerKey; label: string; hint?: string }[] = [
  { key: 'walls', label: 'Walls' },
  { key: 'labels', label: 'Room labels' },
  { key: 'dimensions', label: 'Dimensions', hint: 'Printed room dimensions (mm)' },
  { key: 'openings', label: 'Doors & windows' },
  { key: 'furniture', label: 'Furniture & fixtures', hint: 'Artwork from the source drawing with text removed' },
  { key: 'structure', label: 'Structural elements', hint: 'Thick wall blocks – likely RCC; not marked as such on the source' },
  { key: 'services', label: 'Plumbing shafts (PL) / ducts' },
  { key: 'fills', label: 'Room colours' },
  { key: 'source', label: 'Original drawing overlay', hint: 'Superimpose the supplied plan to check alignment' },
];

interface LayerPanelProps {
  layers: Layers;
  onToggle: (k: LayerKey) => void;
  sourceOpacity: number;
  onSourceOpacity: (v: number) => void;
}

export function LayerPanel({ layers, onToggle, sourceOpacity, onSourceOpacity }: LayerPanelProps) {
  return (
    <section className="card" aria-labelledby="layers-h">
      <h3 id="layers-h">Layers</h3>
      <ul className="layers">
        {LAYER_DEFS.map((l) => (
          <li key={l.key}>
            <label title={l.hint}>
              <input type="checkbox" checked={layers[l.key]} onChange={() => onToggle(l.key)} />
              <span className="switch" aria-hidden />
              <span>{l.label}</span>
            </label>
            {l.key === 'source' && layers.source && (
              <input
                className="range"
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={sourceOpacity}
                onChange={(e) => onSourceOpacity(+e.target.value)}
                aria-label="Overlay opacity"
              />
            )}
          </li>
        ))}
        <li>
          <label className="disabled" title="No electrical points are shown on the supplied drawings">
            <input type="checkbox" disabled checked={false} readOnly />
            <span className="switch" aria-hidden />
            <span>
              Electrical <em>— not on source</em>
            </span>
          </label>
        </li>
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ Legend */

export function Legend({ types, filter, onFilter }: { types: RoomType[]; filter: RoomType | null; onFilter: (t: RoomType | null) => void }) {
  return (
    <section className="card" aria-labelledby="legend-h">
      <h3 id="legend-h">Room types</h3>
      <ul className="legend">
        {types.map((t) => (
          <li key={t}>
            <button
              className={filter === t ? 'on' : ''}
              onClick={() => onFilter(filter === t ? null : t)}
              title="Highlight this room type"
            >
              <span className="swatch" style={{ background: ROOM_TYPES[t].color }} />
              {ROOM_TYPES[t].label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* --------------------------------------------------------------- Room info */

interface InfoProps {
  plan: PlanData;
  room: Room | null;
  onClear: () => void;
  onPick: (id: string) => void;
}

export function RoomInfo({ plan, room, onClear, onPick }: InfoProps) {
  if (!room) {
    return (
      <section className="card info" aria-live="polite">
        <div className="info-head">
          <div>
            <div className="eyebrow">{plan.config}</div>
            <h2>{plan.title}</h2>
          </div>
        </div>
        <dl className="kv three">
          <div>
            <dt>Carpet area</dt>
            <dd>{plan.areas.carpet}</dd>
          </div>
          <div>
            <dt>Built-up area</dt>
            <dd>{plan.areas.builtUp}</dd>
          </div>
          <div>
            <dt>Balcony area</dt>
            <dd>{plan.areas.balcony}</dd>
          </div>
        </dl>
        {plan.note && <p className="flag">{plan.note}</p>}
        <p className="muted">Click a room on the plan, or pick one below.</p>
        <ul className="room-list">
          {plan.rooms.map((r) => (
            <li key={r.id}>
              <button onClick={() => onPick(r.id)}>
                <span className="swatch" style={{ background: ROOM_TYPES[r.type].color }} />
                <span className="rn">{r.name}</span>
                <span className="ra">{r.area != null ? `${r.area.toFixed(2)} m²` : '—'}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const dims = room.dims;
  return (
    <section className="card info" aria-live="polite">
      <div className="info-head">
        <div>
          <div className="eyebrow">
            <span className="swatch" style={{ background: ROOM_TYPES[room.type].color }} />
            {ROOM_TYPES[room.type].label}
          </div>
          <h2>
            {room.name}
            {room.uncertain && <span className="badge">uncertain</span>}
          </h2>
        </div>
        <button className="ghost" onClick={onClear} aria-label="Clear selection" title="Clear selection (Esc)">
          ✕
        </button>
      </div>

      <dl className="kv">
        <div>
          <dt>Area</dt>
          <dd>{room.area != null ? `${room.area.toFixed(2)} m²` : <span className="na">not printed</span>}</dd>
        </div>
        {room.w && room.l ? (
          <div>
            <dt>Size (as printed)</dt>
            <dd>
              {room.w} × {room.l} mm
            </dd>
          </div>
        ) : null}
        {dims && (
          <>
            <div>
              <dt>Horizontal on plan</dt>
              <dd>{metres(dims.horizontal)}</dd>
            </div>
            <div>
              <dt>Vertical on plan</dt>
              <dd>{metres(dims.vertical)}</dd>
            </div>
          </>
        )}
        {room.width && (
          <div>
            <dt>Width</dt>
            <dd>{room.width}</dd>
          </div>
        )}
      </dl>
      {room.areaNote && <p className="flag">{room.areaNote}</p>}

      {room.fixtures.length > 0 && (
        <>
          <h4>Furniture & fixtures shown</h4>
          <ul className="chips">
            {room.fixtures.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      )}
      {room.notes && (
        <>
          <h4>Notes</h4>
          <p className="notes">{room.notes}</p>
        </>
      )}
      <p className="source-note">Values are taken from the labels on the supplied drawing; nothing is scaled off the image.</p>
    </section>
  );
}
