import type { RoomType } from './types';

/** Colour coding per room category (fill uses CSS variables so it adapts to theme). */
export const ROOM_TYPES: Record<RoomType, { label: string; color: string }> = {
  bedroom: { label: 'Bedroom', color: 'var(--c-bedroom)' },
  living: { label: 'Living / Dining', color: 'var(--c-living)' },
  kitchen: { label: 'Kitchen', color: 'var(--c-kitchen)' },
  toilet: { label: 'Toilet / Powder', color: 'var(--c-toilet)' },
  study: { label: 'Study', color: 'var(--c-study)' },
  balcony: { label: 'Balcony', color: 'var(--c-balcony)' },
  service: { label: 'Shaft / PL', color: 'var(--c-service)' },
};
