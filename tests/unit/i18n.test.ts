import { describe, expect, it } from 'vitest';
import { localePath } from '../../src/lib/i18n';

describe('localePath', () => {
  it('geeft root voor Nederlands en /en/ voor Engels', () => {
    expect(localePath('nl', '/')).toBe('/');
    expect(localePath('en', '/')).toBe('/en/');
  });

  it('neemt een base path mee, met of zonder slash', () => {
    expect(localePath('nl', '/simple-portfolio/')).toBe('/simple-portfolio/');
    expect(localePath('en', '/simple-portfolio/')).toBe('/simple-portfolio/en/');
    expect(localePath('en', '/simple-portfolio')).toBe('/simple-portfolio/en/');
  });
});
