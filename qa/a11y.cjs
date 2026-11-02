/* QA script: token contrast, reduced motion, pause control, keyboard flows,
   heading/landmark checks, head tags, back behavior, and budgets.
   Run: node qa/a11y.cjs  (requires `vite preview` on :4173) */
const { chromium } = require('playwright');
const fs = require('fs');
const zlib = require('zlib');

const lum = (hex) => {
  const [r, g, b] = hex.match(/\w\w/g).map((h) => parseInt(h, 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return ((x + 0.05) / (y + 0.05)).toFixed(2); };

console.log('--- Token contrast (needs 4.5 text / 3 large+UI) ---');
const pairs = [
  ['ink on canvas', '#14251F', '#F7F6F2'], ['ink-2 on canvas', '#46574F', '#F7F6F2'], ['ink-2 on surface', '#46574F', '#FFFFFF'],
  ['teal on canvas (links/eyebrow)', '#0B6B60', '#F7F6F2'], ['teal on surface', '#0B6B60', '#FFFFFF'], ['teal on pale', '#0B6B60', '#E7EFE8'],
  ['green on pale', '#173D31', '#E7EFE8'], ['on-dark on green', '#F7F6F2', '#173D31'], ['on-dark-muted on green', '#C9D6CF', '#173D31'],
  ['accent on green (card eyebrow 13px bold)', '#D7A56F', '#173D31'], ['border-strong on canvas (UI 3:1)', '#6F8077', '#F7F6F2'],
  ['border-strong on surface (UI 3:1)', '#6F8077', '#FFFFFF'], ['error on error-bg', '#9B2C1F', '#FBEEEC'],
  ['white on teal (btn hover)', '#FFFFFF', '#0B6B60'], ['green on canvas (secondary btn)', '#173D31', '#F7F6F2'], ['accent on canvas (decorative only)', '#D7A56F', '#F7F6F2'],
];
for (const [n, a, b] of pairs) console.log(ratio(a, b).padStart(6), n);

(async () => {
  const browser = await chromium.launch();
  const rm = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } });
  const p1 = await rm.newPage();
  await p1.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  console.log('\nreduced-motion: running animations =', await p1.evaluate(() => document.getAnimations().length), '| pause button present =', await p1.locator('.hero-art__toggle').count());
  await rm.close();

  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  console.log('normal: running animations =', await page.evaluate(() => document.getAnimations().length));
  await page.click('.hero-art__toggle');
  console.log('after pause click: play states =', await page.evaluate(() => document.getAnimations().map((a) => a.playState).join(',')));
  await page.reload({ waitUntil: 'networkidle' });
  console.log('after reload (session persists): button =', await page.locator('.hero-art__toggle').textContent());
  await page.evaluate(() => sessionStorage.clear());

  await page.reload({ waitUntil: 'networkidle' });
  const order = [];
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press('Tab');
    order.push(await page.evaluate(() => { const a = document.activeElement; return (a.textContent || a.getAttribute('aria-label') || a.tagName).trim().slice(0, 30); }));
  }
  console.log('tab order:', order.join(' > '));
  console.log('focus outline on focused element:', await page.evaluate(() => getComputedStyle(document.activeElement).outlineWidth + ' ' + getComputedStyle(document.activeElement).outlineStyle));

  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  console.log('skip link -> hash:', await page.evaluate(() => location.hash), '| active =', await page.evaluate(() => document.activeElement.id));

  const m = await browser.newContext({ viewport: { width: 360, height: 700 } });
  const mp = await m.newPage();
  await mp.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await mp.click('.nav-toggle');
  console.log('mobile nav open, links:', await mp.locator('.mobile-nav a').count(), '| toggle label:', await mp.locator('.nav-toggle').textContent());
  await mp.screenshot({ path: 'qa/screenshots/mobile-nav-open.png' });
  await mp.keyboard.press('Escape');
  console.log('after Escape, toggle label:', await mp.locator('.nav-toggle').textContent(), '| focus on toggle:', await mp.evaluate(() => document.activeElement.classList.contains('nav-toggle')));
  // Touch target sizes for primary controls
  const sizes = await mp.evaluate(() => [...document.querySelectorAll('.btn, .nav-toggle, .hero-art__toggle')].map((e) => { const r = e.getBoundingClientRect(); return `${e.textContent.trim().slice(0, 18)}:${Math.round(r.width)}x${Math.round(r.height)}`; }));
  console.log('touch targets (360px):', sizes.join(' | '));
  await m.close();

  for (const r of ['/', '/services', '/services/ai-governance', '/approach', '/about', '/contact', '/privacy', '/missing']) {
    await page.goto('http://localhost:4173' + r, { waitUntil: 'networkidle' });
    const info = await page.evaluate(() => {
      const hs = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => +h.tagName[1]);
      let skips = 0;
      for (let i = 1; i < hs.length; i++) if (hs[i] > hs[i - 1] + 1) skips++;
      return {
        h1: hs.filter((h) => h === 1).length, skips,
        landmarks: ['header', 'nav', 'main', 'footer'].filter((t) => document.querySelector(t)).length,
        title: document.title, robots: document.querySelector('meta[name=robots]')?.content,
        canonical: document.querySelector('link[rel=canonical]')?.href,
      };
    });
    console.log(r.padEnd(26), JSON.stringify(info));
  }
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.click('text=Explore services');
  await page.waitForURL('**/services');
  await page.goBack();
  console.log('back from /services ->', new URL(page.url()).pathname);
  await browser.close();

  const html = fs.readFileSync('dist/index.html', 'utf8');
  const svg = html.match(/<svg class="hero-art__svg[\s\S]*?<\/svg>/)[0];
  console.log('\nhero svg bytes:', svg.length, '| gzip:', zlib.gzipSync(svg).length, '(budget 25600)');
  let js = 0;
  for (const f of fs.readdirSync('dist/assets')) if (f.endsWith('.js')) js += zlib.gzipSync(fs.readFileSync('dist/assets/' + f)).length;
  console.log('first-load JS gzip total:', js, 'bytes (budget 153600)');
  const all = fs.readdirSync('dist', { recursive: true }).filter((f) => f.endsWith('.html')).map((f) => fs.readFileSync('dist/' + f, 'utf8')).join('');
  console.log('placeholder scan (lorem/TODO/FIXME):', /lorem ipsum|TODO|FIXME/i.test(all) ? 'FOUND' : 'none');
  console.log('env leak scan (RESEND|CONTACT_TO=):', /RESEND_API_KEY|CONTACT_TO=/.test(all + fs.readdirSync('dist/assets').map((f) => fs.readFileSync('dist/assets/' + f, 'utf8')).join('')) ? 'FOUND' : 'none');
})();
