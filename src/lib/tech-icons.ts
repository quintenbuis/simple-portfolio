import * as simpleIcons from 'simple-icons';
import type { SimpleIcon } from 'simple-icons';

const bySlug = new Map<string, SimpleIcon>(
  Object.values(simpleIcons)
    .filter((icon): icon is SimpleIcon => typeof icon === 'object' && 'slug' in icon)
    .map((icon) => [icon.slug, icon]),
);

export function getTechIcon(slug: string): { path: string; hex: string } {
  const icon = bySlug.get(slug);
  if (!icon) {
    throw new Error(`Onbekend icoon "${slug}" in src/config.ts — zoek de juiste slug op via https://simpleicons.org`);
  }
  return { path: icon.path, hex: icon.hex };
}
