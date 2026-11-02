const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto('file://' + process.cwd() + '/qa/og.html');
  await p.screenshot({ path: 'public/og-image.png' });
  await b.close();
})();
