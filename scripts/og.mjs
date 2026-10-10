// Zet public/og.svg om naar public/og.png (1200×630). Draai na het aanpassen van og.svg: npm run og
import { readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const svg = readFileSync('public/og.svg', 'utf8');
const png = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  font: { loadSystemFonts: true },
}).render().asPng();

writeFileSync('public/og.png', png);
console.log('public/og.png geschreven');
