import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LayerKey, Layers, PlanData, RoomType } from '../data/types';
import { usePanZoom } from '../hooks/usePanZoom';
import { bbox } from '../geometry';
import { PlanCanvas } from './PlanCanvas';
import { Legend, LayerPanel, RoomInfo, Toolbar } from './Panels';

export const DEFAULT_LAYERS: Layers = {
  fills: true,
  walls: true,
  labels: true,
  dimensions: false,
  openings: true,
  furniture: true,
  structure: false,
  services: true,
  source: false,
};

interface Props {
  plan: PlanData;
  onFullscreen: () => void;
  isFullscreen: boolean;
  onOpen3D?: () => void;
}

/**
 * Interactive viewer for one unit plan: SVG canvas with pan/zoom, room
 * selection, layer toggles, legend and an information panel.
 */
export function FloorPlanViewer({ plan, onFullscreen, isFullscreen, onOpen3D }: Props) {
  const pz = usePanZoom(plan.width, plan.height);
  const [layers, setLayers] = useState<Layers>(DEFAULT_LAYERS);
  const [sourceOpacity, setSourceOpacity] = useState(0.5);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<RoomType | null>(null);

  // Clear selection whenever a different plan is shown.
  useEffect(() => {
    setSelectedId(null);
    setHoverId(null);
    setTypeFilter(null);
  }, [plan.id]);

  const room = useMemo(() => plan.rooms.find((r) => r.id === selectedId) ?? null, [plan, selectedId]);
  const hoverRoom = useMemo(() => plan.rooms.find((r) => r.id === hoverId) ?? null, [plan, hoverId]);
  const types = useMemo(() => [...new Set(plan.rooms.map((r) => r.type))] as RoomType[], [plan]);

  const toggle = useCallback((k: LayerKey) => setLayers((l) => ({ ...l, [k]: !l[k] })), []);

  const select = useCallback(
    (id: string) => {
      if (pz.wasDrag()) return; // a pan gesture that ended on a room is not a click
      setSelectedId((cur) => (cur === id ? null : id));
      setTypeFilter(null);
    },
    [pz],
  );

  /** Select a room from the list and bring it into view. */
  const pick = useCallback(
    (id: string) => {
      const r = plan.rooms.find((q) => q.id === id);
      if (!r) return;
      setSelectedId(id);
      const [x, y, w, h] = bbox(r.poly);
      pz.focusRect(x, y, w, h);
    },
    [plan, pz],
  );

  const reset = useCallback(() => {
    setSelectedId(null);
    setTypeFilter(null);
    setLayers(DEFAULT_LAYERS);
    pz.fit();
  }, [pz]);

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === 'Escape') setSelectedId(null);
      else if (e.key === '+' || e.key === '=') pz.zoomBy(1.3);
      else if (e.key === '-') pz.zoomBy(1 / 1.3);
      else if (e.key.toLowerCase() === 'f') pz.fit();
      else if (e.key === '0') reset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pz, reset]);

  // Legend filter highlights all rooms of a type by selecting none and dimming others via CSS.
  const filterIds = typeFilter ? new Set(plan.rooms.filter((r) => r.type === typeFilter).map((r) => r.id)) : null;

  return (
    <div className="workspace">
      <div className="stage-wrap">
        <div
          ref={pz.containerRef}
          className={'stage' + (pz.dragging ? ' grabbing' : '') + (filterIds ? ' filtering' : '')}
          {...pz.handlers}
          onClick={() => {
            if (!pz.wasDrag()) setSelectedId(null);
          }}
        >
          <svg width="100%" height="100%" role="img" aria-label={`${plan.title} floor plan`}>
            <g
              style={{ transform: `translate(${pz.view.x}px,${pz.view.y}px) scale(${pz.view.k})` }}
              className={'viewport' + (pz.animate ? ' animate' : '')}
            >
              <PlanCanvas
                plan={plan}
                layers={layers}
                sourceOpacity={sourceOpacity}
                hoverId={hoverId}
                selectedId={selectedId}
                onHover={setHoverId}
                onSelect={select}
              />
              {filterIds && (
                <g className="type-filter">
                  {plan.rooms
                    .filter((r) => filterIds.has(r.id))
                    .map((r) => (
                      <polygon key={r.id} points={r.poly.map((p) => p.join(',')).join(' ')} />
                    ))}
                </g>
              )}
            </g>
          </svg>

          {hoverRoom && !pz.dragging && (
            <div className="hover-tip" aria-hidden>
              <strong>{hoverRoom.name}</strong>
              {hoverRoom.area != null && <span>{hoverRoom.area.toFixed(2)} m²</span>}
            </div>
          )}

          <Toolbar
            zoomPct={Math.round(pz.view.k * 100)}
            onZoomIn={() => pz.zoomBy(1.3)}
            onZoomOut={() => pz.zoomBy(1 / 1.3)}
            onFit={pz.fit}
            onReset={reset}
            onFullscreen={onFullscreen}
            isFullscreen={isFullscreen}
          />
          {onOpen3D && (
            <button className="cta3d" onClick={(e) => { e.stopPropagation(); onOpen3D(); }} onPointerDown={(e) => e.stopPropagation()}>
              🧊 3D walk-through
            </button>
          )}
          <div className="hint">Drag to pan · scroll / pinch to zoom · click a room</div>
        </div>
      </div>

      <aside className="side">
        <RoomInfo plan={plan} room={room} onClear={() => setSelectedId(null)} onPick={pick} />
        <Legend types={types} filter={typeFilter} onFilter={(t) => { setTypeFilter(t); setSelectedId(null); }} />
        <LayerPanel layers={layers} onToggle={toggle} sourceOpacity={sourceOpacity} onSourceOpacity={setSourceOpacity} />
      </aside>
    </div>
  );
}
