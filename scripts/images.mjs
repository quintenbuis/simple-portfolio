// Maakt de PNG's in public/ uit de SVG-bronnen. Draai na het aanpassen van og.svg of favicon.svg: npm run images
import { readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

function render(svg, width, out) {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: true } })
    .render()
    .asPng();
  writeFileSync(out, png);
  console.log(`${out} geschreven`);
}

render(readFileSync('public/og.svg', 'utf8'), 1200, 'public/og.png');

const favicon = readFileSync('public/favicon.svg', 'utf8');
render(favicon, 96, 'public/favicon-96.png');
// iOS rondt de hoeken zelf af; zonder eigen afronding geen transparante hoeken.
render(favicon.replace(/ rx="[^"]*"/, ''), 180, 'public/apple-touch-icon.png');
