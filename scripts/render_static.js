// Renders og.jpg (1200x630) and favicon PNGs with Playwright. Run: node scripts/render_static.js
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const root = path.resolve(__dirname, '..');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto('file://' + path.join(root, 'scripts/og.html'));
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(root, 'og.jpg'), type: 'jpeg', quality: 82 });
  for (const [size, name] of [[180, 'apple-touch-icon.png'], [32, 'favicon-32.png'], [512, 'icon-512.png']]) {
    const q = await b.newPage({ viewport: { width: size, height: size } });
    await q.setContent(`<html><body style="margin:0"><img src="file://${path.join(root, 'favicon.svg')}" width="${size}" height="${size}"></body></html>`);
    await q.waitForTimeout(200);
    await q.screenshot({ path: path.join(root, name), omitBackground: true });
  }
  await b.close();
})();
