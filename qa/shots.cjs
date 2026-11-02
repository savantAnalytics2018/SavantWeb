const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const widths = [360, 768, 1024, 1440];
  const routes = ['/', '/services', '/services/ai-strategy', '/approach', '/about', '/contact', '/privacy', '/nope'];
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    const page = await ctx.newPage();
    for (const r of routes) {
      await page.goto('http://localhost:4173' + r, { waitUntil: 'networkidle' });
      const name = (r === '/' ? 'home' : r.replace(/\//g, '_').slice(1));
      await page.screenshot({ path: `qa/screenshots/${name}-${w}.png`, fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      if (overflow) console.log('HORIZONTAL OVERFLOW', r, w);
    }
    await ctx.close();
  }
  // 320px overflow check on all routes
  const ctx = await browser.newContext({ viewport: { width: 320, height: 700 } });
  const page = await ctx.newPage();
  for (const r of routes) {
    await page.goto('http://localhost:4173' + r, { waitUntil: 'networkidle' });
    const sw = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    console.log('320px', r, sw[0] > sw[1] ? 'OVERFLOW ' + sw : 'ok');
  }
  // above-the-fold check at 360x640 and 1366x768: is the primary CTA visible without scrolling?
  for (const vp of [[360, 640], [1366, 768]]) {
    const c2 = await browser.newContext({ viewport: { width: vp[0], height: vp[1] } });
    const p2 = await c2.newPage();
    await p2.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    const box = await p2.locator('a.btn--primary', { hasText: 'Discuss your AI priorities' }).first().boundingBox();
    console.log('CTA above fold', vp, box && box.y + box.height <= vp[1] ? 'yes' : 'NO ' + JSON.stringify(box));
    await p2.screenshot({ path: `qa/screenshots/fold-${vp[0]}x${vp[1]}.png` });
    await c2.close();
  }
  await browser.close();
})();
