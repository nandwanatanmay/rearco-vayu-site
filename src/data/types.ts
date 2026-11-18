/** Room categories used for colour-coding and the legend. */
export type RoomType =
  | 'bedroom'
  | 'living'
  | 'kitchen'
  | 'toilet'
  | 'study'
  | 'balcony'
  | 'service';

export type Point = [number, number];

export interface RoomDims {
  /** [x, y, width, height] of the clear rectangle the printed dimensions refer to */
  rect: [number, number, number, number];
  /** Printed dimension (mm) running horizontally on the drawing */
  horizontal: number;
  /** Printed dimension (mm) running vertically on the drawing */
  vertical: number;
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  /** Interactive boundary polygon, in plan pixel coordinates */
  poly: Point[];
  /** Position of the room label (matches the label position on the source drawing) */
  label: Point;
  /** Printed dimensions in mm, exactly as labelled on the source (first × second) */
  w?: number;
  l?: number;
  /** Printed area in m² (null/undefined when the source does not print one) */
  area?: number;
  /** Explanation when an area is not printed on the source */
  areaNote?: string;
  /** Printed width text for balconies (e.g. "1500 wide") */
  width?: string;
  dims?: RoomDims;
  fixtures: string[];
  notes?: string;
  /** True when the room's identity is not stated on the source drawing */
  uncertain?: boolean;
}

export interface Door {
  /** Hinge point */
  h: Point;
  /** Leaf tip in the closed position (opposite jamb) */
  c: Point;
  /** Leaf tip in the open (90°) position */
  o: Point;
  main?: boolean;
  /** Swing direction could not be read reliably from the source */
  uncertain?: boolean;
}

export interface PlanData {
  id: string;
  title: string;
  config: string;
  areas: { carpet: string; builtUp: string; balcony: string };
  note?: string;
  width: number;
  height: number;
  /** SVG path (even-odd) of all walls, extracted from the drawing */
  walls: string;
  /** SVG path of thick wall blocks (≥ ~19 px) – probable structural elements */
  structure: string;
  rooms: Room[];
  doors: Door[];
  /** [x, y, w, h] window rectangles */
  windows: [number, number, number, number][];
  entry: { x: number; y: number; dir: 'up' | 'down' };
  sourceFile: string;
  furnitureImage: string;
  sourceImage: string;
}

export type LayerKey =
  | 'fills'
  | 'walls'
  | 'labels'
  | 'dimensions'
  | 'openings'
  | 'furniture'
  | 'structure'
  | 'services'
  | 'source';

export type Layers = Record<LayerKey, boolean>;
