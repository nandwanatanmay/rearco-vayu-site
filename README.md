# Vāyu (Wind Park) – Interactive Floor Plans + 3D site (React + TypeScript)

> Copy of `kvd-windpark-front`, being extended for the Rearco Vāyu site. Façade finishes follow the approved paint scheme — see `docs/FACADE_ANALYSIS.md`.

An interactive SVG floor plan viewer built from the supplied brochure drawings:
7 unit plans (Tower 1, Tower 2 & 3 – Types 1245 / 1505; Tower 6 & 7 – Types 997‑1/2/3) plus the site master plan.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # -> dist/index.html : ONE self-contained file, open it directly in a browser
```

## Features
- Plan picker (site plan + 7 unit types); site plan towers link to their unit plans
- Click a room to select it (info panel: printed name, area, size, type, fixtures, notes); hover highlight; Esc / ✕ to clear
- Wheel / pinch zoom, drag to pan, zoom buttons, fit to screen (F), reset (0), full screen, smooth transitions
- Layers: walls, room labels, dimensions, doors & windows, furniture & fixtures, structural elements, PL shafts,
  room colours, and the **original drawing overlay** (with opacity) to check alignment
- Colour-coded room types with a clickable legend
- Responsive: desktop, tablet and phone

## 3D (three.js)
- **3D site** (`#site3d`): massing model on the rendered site plan. Towers are extruded from footprints traced off the plan
  (heights from the marked storeys, e.g. S+24, at an assumed 3 m per floor; Towers 4 & 5 have no marking and are shown translucent).
  - **Map** mode: Google-Maps-style – drag to pan, right-drag / two fingers to rotate & tilt, scroll to zoom
  - **Walk** mode: first person at eye height – W A S D / arrows, drag to look, Shift to run, on-screen joystick on touch; buildings block you
  - **Auto tour**: 15 narrated stops (🔊 toggles spoken narration via the browser's speech engine), Prev / Next / pause
  - Click a building, amenity, label or the mini-map to fly there; towers list their unit plans (2D plan / 3D walk)
- **3D walk-through of each unit** (`#u3d:<plan id>`, or the "3D walk-through" button on any plan): walls extruded from the
  vectorised drawing, plan artwork on the floor, windows (sill/glass/lintel), open door leaves, balcony glass rails;
  dollhouse view, walk mode with wall collision, auto tour room-by-room with printed sizes.
  Scale is estimated from the printed room sizes; ceiling 2.9 m, sill 0.9 m, door head 2.1 m are assumptions.

## How the geometry was produced (accuracy notes)
- **Walls** are vectorised from the drawings by colour thresholding + contour tracing, so wall
  positions and thicknesses come from the drawings rather than being hand-drawn.
- **Room boundaries, doors and windows** were traced by hand in source-pixel coordinates
  (`tools/spec/*.json`) and checked against the drawings with overlay renders (`tools/check.py`).
  Tower 2&3 Type 1245 and Type 1505 reuse the Tower 1 Type 1245 tracing, registered onto those drawings.
- **Every number shown is a printed value** (dimensions in mm, areas in m²). Nothing is scaled off the image –
  the drawings are not consistently to scale.
- **Furniture & fixtures** are the drawing's own artwork with the text and door swings removed
  (inpainting), clipped to the rooms.
- Uncertain items are flagged in the UI: unlabelled X‑marked voids (assumed shafts), the unlabelled
  utility balcony on Tower 1 / Tower 2&3 Type 1505, kitchen area not printed on two plans, a few door swings
  that can't be read clearly (amber arcs), and "structural" blocks (thick walls, not marked as RCC on the source).
- Source quirks are kept and noted: "LIVING/DINNIG" spelling; "Tower 2 & 3 Type 1505" has the
  same layout as Type 1245 but different printed areas; Type 997‑3 repeats the Bedroom 2 label in the passage.
- No electrical points appear on the drawings, so that layer is shown as disabled.

## Structure
```
src/
  App.tsx                       plan picker, full-screen
  components/FloorPlanViewer.tsx viewer state: selection, layers, legend filter, shortcuts
  components/PlanCanvas.tsx     SVG rendering of all layers
  components/Panels.tsx         toolbar, layer panel, legend, room info
  components/MasterPlanView.tsx site plan with hotspots
  hooks/usePanZoom.ts           pointer/wheel/pinch pan & zoom
  data/types.ts                 PlanData / Room / Door types
  data/plans.generated.ts       generated plan data (walls, rooms, doors, windows)
  data/masterPlan.ts            site-plan hotspots
tools/                          extraction pipeline (Python + OpenCV) and hand-traced specs
```
Regenerate the data with: `python3 tools/gen.py <folder-with-the-original-jpegs>`.
