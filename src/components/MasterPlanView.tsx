import { useState } from 'react';
import { HOTSPOTS, MASTER } from '../data/masterPlan';
import type { Hotspot } from '../data/masterPlan';
import { PLANS } from '../data/plans.generated';
import { usePanZoom } from '../hooks/usePanZoom';
import { Toolbar } from './Panels';

/** Site master plan with clickable towers / amenities. Towers link to their unit plans. */
export function MasterPlanView({ onOpenPlan, onFullscreen, isFullscreen, onOpen3D }: { onOpenPlan: (id: string) => void; onFullscreen: () => void; isFullscreen: boolean; onOpen3D: () => void }) {
  const pz = usePanZoom(MASTER.width, MASTER.height);
  const [hover, setHover] = useState<string | null>(null);
  const [sel, setSel] = useState<Hotspot | null>(null);
  const [showHotspots, setShowHotspots] = useState(true);

  return (
    <div className="workspace">
      <div className="stage-wrap">
        <div
          ref={pz.containerRef}
          className={'stage' + (pz.dragging ? ' grabbing' : '')}
          {...pz.handlers}
          onClick={() => !pz.wasDrag() && setSel(null)}
        >
          <svg width="100%" height="100%">
            <g
              style={{ transform: `translate(${pz.view.x}px,${pz.view.y}px) scale(${pz.view.k})` }}
              className={'viewport' + (pz.animate ? ' animate' : '')}
            >
              <image href={MASTER.image} width={MASTER.width} height={MASTER.height} />
              {showHotspots &&
                HOTSPOTS.map((h) => (
                  <g
                    key={h.id}
                    className={'hotspot ' + h.kind + (hover === h.id ? ' is-hover' : '') + (sel?.id === h.id ? ' is-selected' : '')}
                    onPointerEnter={() => setHover(h.id)}
                    onPointerLeave={() => setHover(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!pz.wasDrag()) setSel(h);
                    }}
                  >
                    <title>{h.name}</title>
                    {h.rects.map(([x, y, w, ht], i) => (
                      <rect key={i} x={x} y={y} width={w} height={ht} rx={4} />
                    ))}
                  </g>
                ))}
            </g>
          </svg>
          <button className="cta3d" onClick={(e) => { e.stopPropagation(); onOpen3D(); }} onPointerDown={(e) => e.stopPropagation()}>
            🧊 Explore in 3D
          </button>
          <Toolbar
            zoomPct={Math.round(pz.view.k * 100)}
            onZoomIn={() => pz.zoomBy(1.3)}
            onZoomOut={() => pz.zoomBy(1 / 1.3)}
            onFit={pz.fit}
            onReset={() => {
              setSel(null);
              pz.fit();
            }}
            onFullscreen={onFullscreen}
            isFullscreen={isFullscreen}
          />
        </div>
      </div>
      <aside className="side">
        <section className="card info">
          {sel ? (
            <>
              <div className="info-head">
                <div>
                  <div className="eyebrow">{sel.kind === 'tower' ? 'Residential tower' : sel.kind === 'commercial' ? 'Commercial' : 'Amenity'}</div>
                  <h2>{sel.name}</h2>
                </div>
                <button className="ghost" onClick={() => setSel(null)} aria-label="Clear selection">
                  ✕
                </button>
              </div>
              {sel.detail && <p className="notes">{sel.detail}</p>}
              {sel.plans && (
                <>
                  <h4>Unit plans</h4>
                  <ul className="room-list">
                    {sel.plans.map((pid) => {
                      const p = PLANS.find((q) => q.id === pid)!;
                      return (
                        <li key={pid}>
                          <button onClick={() => onOpenPlan(pid)}>
                            <span className="rn">{p.title}</span>
                            <span className="ra">{p.config}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </>
          ) : (
            <>
              <div className="eyebrow">Site</div>
              <h2>Master plan</h2>
              <p className="muted">Select a tower to open its unit plans, or an amenity to identify it.</p>
              <ul className="room-list">
                {HOTSPOTS.filter((h) => h.kind === 'tower').map((h) => (
                  <li key={h.id}>
                    <button onClick={() => setSel(h)}>
                      <span className="rn">{h.name}</span>
                      <span className="ra">{h.plans ? `${h.plans.length} plans` : 'no plan'}</span>
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
                <input type="checkbox" checked={showHotspots} onChange={() => setShowHotspots((v) => !v)} />
                <span className="switch" aria-hidden />
                <span>Show hotspots</span>
              </label>
            </li>
          </ul>
          <p className="source-note">Hotspot outlines are approximate, traced over the rendered site plan.</p>
        </section>
      </aside>
    </div>
  );
}
