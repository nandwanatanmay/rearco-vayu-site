import { memo } from 'react';
import type { Layers, PlanData, Room } from '../data/types';
import { ROOM_TYPES } from '../data/roomTypes';
import { bbox, doorPaths, pts } from '../geometry';

interface Props {
  plan: PlanData;
  layers: Layers;
  sourceOpacity: number;
  hoverId: string | null;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

/**
 * Pure SVG rendering of one floor plan. All coordinates are in the plan's own
 * pixel space (the cropped source drawing), so every layer stays registered
 * with the original artwork.
 *
 * Paint order (bottom → top):
 *   category fills → furniture/finish artwork → hover/selection overlays →
 *   windows & doors → walls → structure → dimensions → labels → source overlay
 */
function PlanCanvasImpl({ plan, layers, sourceOpacity, hoverId, selectedId, onHover, onSelect }: Props) {
  const clipId = `clip-${plan.id}`;
  const visibleRooms = plan.rooms.filter((r) => layers.services || r.type !== 'service');

  return (
    <g className="plan">
      <defs>
        {/* Furniture artwork is only shown inside the flat's rooms. */}
        <clipPath id={clipId}>
          {plan.rooms.map((r) => (
            <polygon key={r.id} points={pts(r.poly)} />
          ))}
        </clipPath>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" className="hatch-line" />
        </pattern>
        <pattern id="xhatch" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0,0 L8,8 M8,0 L0,8" className="hatch-line" />
        </pattern>
      </defs>

      {/* Paper backdrop for the footprint */}
      <rect x={0} y={0} width={plan.width} height={plan.height} className="paper" />

      {/* 1 · Room category fills */}
      {layers.fills && (
        <g className="layer-fills">
          {visibleRooms.map((r) => (
            <polygon key={r.id} points={pts(r.poly)} fill={ROOM_TYPES[r.type].color} />
          ))}
        </g>
      )}

      {/* 2 · Furniture, fixtures & floor finishes (from the source artwork, text removed) */}
      {layers.furniture && (
        <image
          href={plan.furnitureImage}
          x={0}
          y={0}
          width={plan.width}
          height={plan.height}
          clipPath={`url(#${clipId})`}
          className={layers.fills ? 'furniture blend' : 'furniture'}
          preserveAspectRatio="none"
        />
      )}

      {/* Shaft hatching */}
      {layers.services && (
        <g className="layer-services">
          {plan.rooms
            .filter((r) => r.type === 'service')
            .map((r) => (
              <polygon key={r.id} points={pts(r.poly)} fill="url(#xhatch)" />
            ))}
        </g>
      )}

      {/* 3 · Interactive room hit-areas with hover / selected states */}
      <g className="layer-rooms">
        {visibleRooms.map((r) => (
          <polygon
            key={r.id}
            points={pts(r.poly)}
            className={
              'room' +
              (r.id === hoverId ? ' is-hover' : '') +
              (r.id === selectedId ? ' is-selected' : '') +
              (selectedId && r.id !== selectedId ? ' is-dimmed' : '')
            }
            style={{ ['--room-color' as string]: ROOM_TYPES[r.type].color }}
            tabIndex={-1}
            onPointerEnter={() => onHover(r.id)}
            onPointerLeave={() => onHover(null)}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(r.id);
            }}
          >
            <title>{r.name}</title>
          </polygon>
        ))}
      </g>

      {/* 4 · Windows and doors */}
      {layers.openings && (
        <g className="layer-openings">
          {plan.windows.map(([x, y, w, h], i) => (
            <g key={i} className="window">
              <rect x={x} y={y} width={w} height={h} />
              {w >= h ? (
                <line x1={x} x2={x + w} y1={y + h / 2} y2={y + h / 2} />
              ) : (
                <line x1={x + w / 2} x2={x + w / 2} y1={y} y2={y + h} />
              )}
            </g>
          ))}
          {plan.doors.map((d, i) => {
            const p = doorPaths(d);
            return (
              <g key={i} className={'door' + (d.main ? ' main' : '') + (d.uncertain ? ' uncertain' : '')}>
                <path d={p.opening} className="door-threshold" />
                <path d={p.arc} className="door-arc" />
                <path d={p.leaf} className="door-leaf" />
                {d.uncertain && <title>Door swing direction not clearly legible on source</title>}
              </g>
            );
          })}
          <EntryArrow plan={plan} />
        </g>
      )}

      {/* 5 · Walls (vectorised from the drawing) */}
      {layers.walls && <path d={plan.walls} className="walls" fillRule="evenodd" />}

      {/* 6 · Thick wall blocks – probable structural members */}
      {layers.structure && <path d={plan.structure} className="structure" fillRule="evenodd" />}

      {/* 7 · Dimension strings (printed values only) */}
      {layers.dimensions && (
        <g className="layer-dims">
          {visibleRooms.map((r) => (r.dims ? <Dimensions key={r.id} room={r} /> : null))}
        </g>
      )}

      {/* 8 · Room labels */}
      {layers.labels && (
        <g className="layer-labels">
          {visibleRooms.map((r) => (
            <RoomLabel key={r.id} room={r} active={r.id === selectedId} />
          ))}
        </g>
      )}

      {/* 9 · Original drawing overlay for verification */}
      {layers.source && (
        <image
          href={plan.sourceImage}
          x={0}
          y={0}
          width={plan.width}
          height={plan.height}
          opacity={sourceOpacity}
          className="source-overlay"
          preserveAspectRatio="none"
        />
      )}
    </g>
  );
}

function RoomLabel({ room, active }: { room: Room; active: boolean }) {
  const [x, y] = room.label;
  const small = room.type === 'service';
  const lines: string[] = [];
  if (room.w && room.l) lines.push(`${room.w} × ${room.l}`);
  if (room.width) lines.push(room.width.toUpperCase());
  if (room.area != null) lines.push(`${room.area.toFixed(2)} m²`);
  const lh = 13;
  const y0 = y - (lines.length * lh) / 2;
  return (
    <g className={'room-label' + (active ? ' active' : '') + (small ? ' small' : '')} transform={`translate(${x},${y0})`}>
      <text className="name" y={0}>
        {small ? room.name.replace(/ \(.*\)/, '') : room.name.toUpperCase()}
        {room.uncertain && !small ? ' ?' : ''}
      </text>
      {!small &&
        lines.map((l, i) => (
          <text key={i} className="meta" y={(i + 1) * lh}>
            {l}
          </text>
        ))}
    </g>
  );
}

/** Dimension strings drawn just inside the room's clear rectangle. */
function Dimensions({ room }: { room: Room }) {
  const d = room.dims!;
  const [x, y, w, h] = d.rect;
  const o = 9; // inset from the wall face
  const t = 4; // tick half-length
  const hy = y + o;
  const vx = x + o;
  return (
    <g className="dim">
      <line x1={x} x2={x + w} y1={hy} y2={hy} />
      <line x1={x + 0} x2={x + 0} y1={hy - t} y2={hy + t} />
      <line x1={x + w} x2={x + w} y1={hy - t} y2={hy + t} />
      <text x={x + w / 2} y={hy - 3}>
        {d.horizontal}
      </text>
      <line x1={vx} x2={vx} y1={y} y2={y + h} />
      <line x1={vx - t} x2={vx + t} y1={y} y2={y} />
      <line x1={vx - t} x2={vx + t} y1={y + h} y2={y + h} />
      <text x={vx - 3} y={y + h / 2} transform={`rotate(-90 ${vx - 3} ${y + h / 2})`}>
        {d.vertical}
      </text>
    </g>
  );
}

function EntryArrow({ plan }: { plan: PlanData }) {
  const { x, y, dir } = plan.entry;
  const s = dir === 'up' ? 1 : -1;
  return (
    <g className="entry" transform={`translate(${x},${y}) scale(1,${s})`}>
      <path d="M0,-22 L12,-6 L4,-6 L4,22 L-4,22 L-4,-6 L-12,-6 Z" />
      <text y={s > 0 ? 36 : -30} transform={`scale(1,${s})`}>
        ENTRY
      </text>
    </g>
  );
}

export const PlanCanvas = memo(PlanCanvasImpl);
export { bbox };
