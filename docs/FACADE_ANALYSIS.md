# Vāyu façade & finishes — what the supplied material says, and what the 3D hero uses

Sources: three marketing renders (aerial courtyard, tower front with podium, entrance gate),
"External paint sample approval on 31.07.2026" (signed 02/08/26), and the Flying Vertex Studio 3D-walkthrough
proposal (scope only — commercial terms are deliberately not copied here).

## Approved external paint scheme
| Location | Finish | Used in the scene as |
| --- | --- | --- |
| Feature wall (minimum offsets, maximum plain surface) | **Daisy Blue**, code read as *BB 5017* | `#aec5e3` (scan ≈ `#A1BADC`) — the central spine of each tower |
| Base wall (where offsets are major) | **Steamed Idlis**, code read as *WW 0026* | `#ebe6d6` (scan ≈ `#DBD9CC`) — the body of each tower |
| Balcony ceiling | External-grade emulsion, no texture, white | `#f6f5f0` slab edges |
| Balcony walls | Texture finish, base colour | slightly deeper cream recess |
| Balcony railing upstand | Texture finish + white emulsion | white upstand under the railing |

**Caveat:** the hex values come from a *photograph* of the paint cards, and the shade codes are handwriting on a scan.
Confirm names/codes and the manufacturer's official values, then edit `FINISH` in `components/three/siteHero.ts`.

## Details taken from the renders
- Dark (near-black) metal balcony railings; cool blue-grey glass.
- Crown: grey-taupe cap with rooftop planters, and a circular compass medallion (the ReaRCo mark) in a lattice panel.
- Podium: double-height commercial arcade with arched shop bays and arched upper windows.
- Landscape: palms along the avenue and entrance, turquoise pool, saturated blue sky.

## Implemented (components/three/siteHero.ts)
Façade atlas with the paint scheme · crown cap, planters and medallion panel · arcade texture on club/commercial ·
palm trees · turquoise pool · bluer day sky.

## Still needs input
1. Official paint codes / hex values.
2. Tower elevation drawings → real feature/base wall layout instead of a repeating tile.
3. Official ReaRCo / Vāyu logo files (crown medallion, gate signage).
4. The entrance gate (white wall, timber fins, timber-soffit canopy, lamp posts) — needs its position on the plan.
5. Which towers carry the darker slate-blue scheme seen on one tower in the aerial render.
6. Basement / stilt levels and interiors for the three units in the walkthrough proposal.
