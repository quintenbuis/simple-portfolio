import { describe, expect, it } from 'vitest';
import { interpolate, yearsSince } from '../../src/lib/text';

describe('yearsSince', () => {
  it('telt het aantal volle kalenderjaren sinds het startjaar', () => {
    expect(yearsSince(2020, new Date('2026-10-10'))).toBe(6);
    expect(yearsSince(2020, new Date('2027-01-01'))).toBe(7);
  });
});

describe('interpolate', () => {
  it('vult plaatshouders in', () => {
    expect(interpolate('ruim {years} jaar', { years: 6 })).toBe('ruim 6 jaar');
  });

  it('laat tekst zonder plaatshouders ongemoeid', () => {
    expect(interpolate('geen plaatshouder', { years: 6 })).toBe('geen plaatshouder');
  });

  it('geeft een duidelijke fout bij een onbekende plaatshouder (typfout)', () => {
    expect(() => interpolate('ruim {jaren} jaar', { years: 6 })).toThrow(/Onbekende plaatshouder \{jaren\}/);
  });
});
