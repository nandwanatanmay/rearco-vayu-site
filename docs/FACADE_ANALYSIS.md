# Vāyu façade & finishes — analysis of supplied material

Sources: three marketing renders; "External paint sample approval on 31.07.2026" (signed 02/08/26);
Flying Vertex Studio 3D-walkthrough proposal (scope only).

## 1. Approved external paint scheme (authoritative)
| Location | Finish | Notes |
| --- | --- | --- |
| Feature wall – elevation with minimum offsets, maximum plain surface | **Daisy Blue**, code read as *BB 5017* | pale blue; scan ≈ `#A1BADC` |
| Base wall – where offsets are major | **Steamed Idlis**, code read as *WW 0026* | warm cream; scan ≈ `#DBD9CC` |
| Balcony ceiling | External-grade emulsion, no texture, **white** | |
| Balcony walls | **Texture finish, base colour** | |
| Balcony railing upstand | **Texture finish + white emulsion** | |

Caveats: hex values come from a photograph of the paint cards (exposure-shifted), and the two shade codes are
handwriting-sized text on a scan — **confirm names/codes and official hex with the paint supplier**.

## 2. What the renders show (form & detail)
- Towers: white / pale cool-grey bodies with blue-grey feature panels, **dark (near-black) metal balcony railings**,
  stepped / wedge balcony slabs, warm-grey side wings; one tower in a darker slate-blue with glazed balconies and lit windows.
- **Crown:** circular compass medallion (ReaRCo mark) inside a decorative lattice panel on the top storeys; rooftop planters.
- **Podium:** double-height commercial arcade with arched windows, pale facade, planters.
- **Entrance gate:** white wall with ReaRCo and Vayu signage, timber-fin screens, timber-soffit canopy, lamp posts.
- Landscape: **palms** along roads and the entrance, podium lawns, amphitheatre steps, multisport court (red / blue / teal),
  turquoise pool, club with striped roof, ramp road; blue sky with cumulus.

## 3. Proposal (scope only)
Phase-2 site: 2 towers, landscape, terrace, 3 unit interiors, basement and stilt parking floors; 3D walkthrough ≤ 2 min
and 10 stills. (Commercial terms deliberately not copied into the repo.)

## 4. Implemented in this branch (`feature/approved-facade`)
- `src/data/facade.ts` – the palette, with sources and caveats.
- Façade tile redesigned: blue feature bay + cream balcony bay, white ceiling edge/upstand/slab, dark railings.
- Taupe crown cap, turquoise pool, bluer sky, **palm trees** (edges + entrance).

## 5. Still to do (needs drawings / decisions)
1. Confirm paint codes + official colour values (replace the approximations in `facade.ts`).
2. Tower elevations (drawings) → real feature/base wall layout instead of a repeating tile.
3. Crown: compass medallion + lattice panel, rooftop planters (needs elevation + facing direction per tower).
4. Podium/commercial: arcade, arched windows, stilt level; basement parking level.
5. Entrance gate with signage and timber fins; lamp posts.
6. Amenity colours (court, pool, club roof) in the ground texture — currently the master-plan rendering.
7. Re-skin UI from "Wind Park" to Vāyu / ReaRCo branding (logo, name, colours).
8. Unit walk-through: balcony/exterior finishes seen from inside; interiors for the 3 units in the proposal.
