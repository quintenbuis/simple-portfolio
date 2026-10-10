import { readFileSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { load } from 'js-yaml';
import { parse } from 'node-html-parser';
import { beforeAll, describe, expect, it } from 'vitest';
import CaseCard from '../../src/components/CaseCard.astro';
import type { LocalizedCase } from '../../src/lib/cases';
import type { I18nData } from '../../src/lib/schemas';

const t = load(readFileSync('src/content/i18n/nl.yml', 'utf8')) as I18nData;

const item: LocalizedCase = {
  id: 'a',
  title: 'Titel',
  client: 'Klant BV',
  role: 'Rol',
  summary: 'Samenvatting',
  stack: ['Laravel'],
};

describe('CaseCard', () => {
  let container: AstroContainer;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  const render = async (props: LocalizedCase) =>
    parse(await container.renderToString(CaseCard, { props: { item: props, t } }));

  it('toont het klantlogo naast de titel als er een logo is', async () => {
    const logo = { src: '/_astro/klant.svg', width: 120, height: 40, format: 'svg' as const };
    const html = await render({ ...item, logo });
    const img = html.querySelector('.case-header .case-logo img');
    expect(img).not.toBeNull();
    // De klantnaam staat er al als tekst naast; het logo is decoratief.
    expect(img?.getAttribute('alt')).toBe('');
    expect(html.querySelector('.case-header h3')?.text).toBe('Titel');
  });

  it('toont geen logo-element zonder logo', async () => {
    const html = await render(item);
    expect(html.querySelector('.case-logo')).toBeNull();
    expect(html.querySelector('.case-header h3')?.text).toBe('Titel');
  });
});
