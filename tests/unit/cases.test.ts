import { describe, expect, it } from 'vitest';
import { localizeCases, type CaseEntry } from '../../src/lib/cases';

const entry = (id: string, order: number, extra: Partial<CaseEntry['data']> = {}): CaseEntry => ({
  id,
  data: {
    order,
    stack: ['Laravel'],
    nl: { title: `NL ${id}`, client: 'Klant', role: 'Rol', summary: 'Samenvatting' },
    en: { title: `EN ${id}`, client: 'Client', role: 'Role', summary: 'Summary' },
    ...extra,
  },
});

describe('localizeCases', () => {
  it('sorteert op order', () => {
    const result = localizeCases([entry('b', 2), entry('a', 1)], 'nl');
    expect(result.map((c) => c.id)).toEqual(['a', 'b']);
  });

  it('sorteert gelijke order stabiel op id', () => {
    const result = localizeCases([entry('zeta', 1), entry('alpha', 1), entry('mid', 0)], 'nl');
    expect(result.map((c) => c.id)).toEqual(['mid', 'alpha', 'zeta']);
  });

  it('kiest de teksten van de gevraagde taal', () => {
    const [nl] = localizeCases([entry('a', 1)], 'nl');
    const [en] = localizeCases([entry('a', 1)], 'en');
    expect(nl.title).toBe('NL a');
    expect(en.title).toBe('EN a');
    expect(en.client).toBe('Client');
  });

  it('zet year om naar tekst en laat optionele velden weg als ze ontbreken', () => {
    const [withYear] = localizeCases([entry('a', 1, { year: 2024, link: 'https://x.nl' })], 'nl');
    const [without] = localizeCases([entry('b', 1)], 'nl');
    expect(withYear.year).toBe('2024');
    expect(withYear.link).toBe('https://x.nl');
    expect(without.year).toBeUndefined();
    expect(without.link).toBeUndefined();
  });

  it('muteert de invoer niet', () => {
    const input = [entry('b', 2), entry('a', 1)];
    localizeCases(input, 'nl');
    expect(input.map((c) => c.id)).toEqual(['b', 'a']);
  });
});
