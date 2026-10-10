import { describe, expect, it } from 'vitest';
import { getTechIcon, isDarkColor } from '../../src/lib/tech-icons';

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

describe('isDarkColor', () => {
  it('herkent zwarte en zeer donkere merkkleuren', () => {
    expect(isDarkColor('000000')).toBe(true);
    expect(isDarkColor('181717')).toBe(true);
  });

  it('laat gekleurde merkkleuren met rust', () => {
    expect(isDarkColor('FF2D20')).toBe(false);
    expect(isDarkColor('512BD4')).toBe(false);
    expect(isDarkColor('4169E1')).toBe(false);
  });
});
