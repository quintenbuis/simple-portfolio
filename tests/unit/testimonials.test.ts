import { describe, expect, it } from 'vitest';
import { localizeTestimonials, type TestimonialEntry } from '../../src/lib/testimonials';

const entry = (id: string, order: number, extra: Partial<TestimonialEntry['data']> = {}): TestimonialEntry => ({
  id,
  data: {
    order,
    name: `Naam ${id}`,
    nl: { role: 'Rol', quote: `NL ${id}` },
    en: { role: 'Role', quote: `EN ${id}` },
    ...extra,
  },
});

describe('localizeTestimonials', () => {
  it('sorteert op order en daarna op id', () => {
    const result = localizeTestimonials([entry('b', 2), entry('z', 1), entry('a', 1)], 'nl');
    expect(result.map((t) => t.id)).toEqual(['a', 'z', 'b']);
  });

  it('kiest quote en rol in de gevraagde taal en geeft bedrijf en link door', () => {
    const [nl] = localizeTestimonials([entry('a', 1, { company: 'Acme', link: 'https://x.nl' })], 'nl');
    const [en] = localizeTestimonials([entry('a', 1)], 'en');
    expect(nl).toEqual({ id: 'a', name: 'Naam a', role: 'Rol', quote: 'NL a', company: 'Acme', link: 'https://x.nl' });
    expect(en.quote).toBe('EN a');
    expect(en.role).toBe('Role');
    expect(en.company).toBeUndefined();
  });
});
