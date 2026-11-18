import masterImg from '../assets/master-plan.jpg';

/**
 * Site master plan hotspots. Rectangles are approximate outlines traced over the
 * rendered site plan (800 × 1542 px). Towers link to the unit plans that were supplied.
 */
export interface Hotspot {
  id: string;
  name: string;
  kind: 'tower' | 'amenity' | 'commercial';
  rects: [number, number, number, number][];
  detail?: string;
  plans?: string[];
}

export const MASTER = { image: masterImg, width: 800, height: 1542 };

export const HOTSPOTS: Hotspot[] = [
  { id: 'tower7', name: 'Tower 7', kind: 'tower', rects: [[536, 185, 150, 298]], detail: 'S+24 (as marked). Units 1–8 per floor across two cores.', plans: ['t67-997-1', 't67-997-2', 't67-997-3'] },
  { id: 'tower6', name: 'Tower 6', kind: 'tower', rects: [[536, 488, 150, 300]], detail: 'S+24 (as marked). Units 1–8 per floor across two cores.', plans: ['t67-997-1', 't67-997-2', 't67-997-3'] },
  { id: 'tower5', name: 'Tower 5', kind: 'tower', rects: [[138, 455, 152, 185]], detail: 'No unit plan supplied for this tower.' },
  { id: 'tower4', name: 'Tower 4', kind: 'tower', rects: [[138, 690, 152, 212]], detail: 'No unit plan supplied for this tower.' },
  { id: 'tower3', name: 'Tower 3', kind: 'tower', rects: [[503, 832, 180, 182]], detail: 'S+22 (as marked). Units 1–4 per floor.', plans: ['t23-1245', 't23-1505'] },
  { id: 'tower1', name: 'Tower 1', kind: 'tower', rects: [[132, 1025, 170, 172]], detail: 'S+22 (as marked). Units 1–4 per floor.', plans: ['t1-1245', 't1-1505'] },
  { id: 'tower2', name: 'Tower 2 · Sky Villa', kind: 'tower', rects: [[503, 1025, 170, 172]], detail: 'S+22 (as marked). Units 1–4 per floor.', plans: ['t23-1245', 't23-1505'] },
  { id: 'club', name: 'Club', kind: 'amenity', rects: [[335, 1245, 135, 55]] },
  { id: 'commercial', name: 'Commercial', kind: 'commercial', rects: [[160, 1300, 480, 110]] },
  { id: 'amph', name: 'Amphitheatre', kind: 'amenity', rects: [[355, 285, 130, 45]] },
  { id: 'court', name: 'Synthetic Multisports Court', kind: 'amenity', rects: [[352, 335, 122, 215]] },
  { id: 'changing', name: 'Changing Room', kind: 'amenity', rects: [[372, 556, 80, 26]] },
  { id: 'pool', name: 'Half Olympic Length Pool & Kids Pool', kind: 'amenity', rects: [[330, 585, 115, 185]] },
  { id: 'shrine', name: 'Shrine & Meditation Garden', kind: 'amenity', rects: [[340, 790, 125, 90]] },
  { id: 'lawns', name: 'Lawns with Sit-out Areas', kind: 'amenity', rects: [[330, 880, 150, 170]] },
  { id: 'stage', name: 'Stage for Events', kind: 'amenity', rects: [[360, 1052, 100, 30]] },
  { id: 'reflection', name: 'Reflection Pool with Fountains', kind: 'amenity', rects: [[310, 1105, 180, 85]] },
  { id: 'skating', name: 'Skating Rink', kind: 'amenity', rects: [[132, 930, 130, 85]] },
  { id: 'kids', name: 'Kids Play Area', kind: 'amenity', rects: [[232, 900, 70, 80]] },
  { id: 'badminton', name: 'Badminton Court', kind: 'amenity', rects: [[522, 790, 90, 40]] },
  { id: 'gym', name: 'Outdoor Gym', kind: 'amenity', rects: [[614, 790, 66, 40]] },
];
