import { getViteConfig } from 'astro/config';

// getViteConfig laat Vitest .astro-componenten en astro:*-modules begrijpen.
export default getViteConfig({
  test: { include: ['tests/**/*.test.ts'] },
});
