import { readFileSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { load } from 'js-yaml';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import Testimonials from '../../src/components/Testimonials.astro';
import type { I18nData } from '../../src/lib/schemas';
import type { LocalizedTestimonial } from '../../src/lib/testimonials';

const t = load(readFileSync('src/content/i18n/nl.yml', 'utf8')) as I18nData;

const items: LocalizedTestimonial[] = [
  { id: 'a', name: 'Jan Jansen', role: 'CTO', company: 'Acme', quote: 'Fijne samenwerking.', link: 'https://x.nl/jan' },
  { id: 'b', name: 'Piet Pieters', role: 'Product owner', quote: 'Snel en zorgvuldig.' },
];

describe('Testimonials', () => {
  it('toont elke quote met naam en rol, bedrijf en link alleen als ze er zijn', async () => {
    const container = await AstroContainer.create();
    const html = parse(await container.renderToString(Testimonials, { props: { items, t } }));

    expect(html.querySelector('#testimonials h2')?.text).toBe(t.testimonials.heading);
    const cards = html.querySelectorAll('.testimonial');
    expect(cards).toHaveLength(2);

    expect(cards[0].querySelector('blockquote')?.text.trim()).toBe('Fijne samenwerking.');
    expect(cards[0].querySelector('.testimonial-name')?.text.trim()).toBe('Jan Jansen');
    expect(cards[0].querySelector('.testimonial-name a')?.getAttribute('href')).toBe('https://x.nl/jan');
    expect(cards[0].querySelector('.testimonial-role')?.text.trim()).toBe('CTO, Acme');

    expect(cards[1].querySelector('.testimonial-name a')).toBeNull();
    expect(cards[1].querySelector('.testimonial-role')?.text.trim()).toBe('Product owner');
  });
});
