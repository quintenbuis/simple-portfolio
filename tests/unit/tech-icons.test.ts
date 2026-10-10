import { describe, expect, it } from 'vitest';
import { getTechIcon } from '../../src/lib/tech-icons';

describe('getTechIcon', () => {
  it('geeft pad en merkkleur voor een bekende slug', () => {
    const icon = getTechIcon('laravel');
    expect(icon.path).toMatch(/^M/);
    expect(icon.hex).toBe('FF2D20');
  });

  it('geeft een duidelijke fout bij een onbekende slug', () => {
    expect(() => getTechIcon('bestaat-niet')).toThrow(/Onbekend icoon "bestaat-niet".*simpleicons\.org/);
  });
});
