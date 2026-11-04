const { chromium } = require('playwright');
const P = {
  '1 Monochrome + red': { canvas:'#FAFAF8', ink:'#111111', ink2:'#4A4A4A', dark:'#111111', sec:'#111111', pale:'#EFEFEA', border:'#DDDDD6', strong:'#777770', accent:'#D7442C', sharp:'#C8381F', tint:'#FF9C8A', ondark:'#FAFAF8', muted:'#BDBDB7' },
  '2 Charcoal + electric blue': { canvas:'#F6F7F9', ink:'#15181D', ink2:'#4B5563', dark:'#1F2937', sec:'#2563EB', pale:'#E8EEF9', border:'#D7DCE4', strong:'#6B7280', accent:'#F59E0B', sharp:'#2563EB', tint:'#93B4FF', ondark:'#F6F7F9', muted:'#C3CAD6' },
  '3 Oxblood + cream + gold': { canvas:'#FBF7F1', ink:'#2A1518', ink2:'#5C464A', dark:'#4A1C24', sec:'#8A2F3B', pale:'#F3E9E1', border:'#E3D6CB', strong:'#8C7A72', accent:'#D8A24A', sharp:'#B8322E', tint:'#F0B8A8', ondark:'#FBF7F1', muted:'#D9C4BC' },
  '4 Slate + orange': { canvas:'#F4F6F8', ink:'#1C2730', ink2:'#4E5D6A', dark:'#2F3E4E', sec:'#1E6F8F', pale:'#E6ECF0', border:'#D3DBE2', strong:'#73818E', accent:'#F26430', sharp:'#D9521F', tint:'#FFB08F', ondark:'#F4F6F8', muted:'#C4CED6' },
};
(async () => {
  const b = await chromium.launch();
  for (const [name, c] of Object.entries(P)) {
    const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
    await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    await p.addStyleTag({ content: `
      :root{--color-canvas:${c.canvas}!important;--color-ink:${c.ink}!important;--color-ink-2:${c.ink2}!important;--color-green:${c.dark}!important;--color-teal:${c.sec}!important;--color-pale:${c.pale}!important;--color-border:${c.border}!important;--color-border-strong:${c.strong}!important;--color-accent:${c.accent}!important;--color-sharp:${c.sharp}!important;--color-on-dark:${c.ondark}!important;--color-on-dark-muted:${c.muted}!important;--color-surface:#fff!important}
      a,.link-arrow,.eyebrow,.do-list__title:hover,.nav__link:hover{color:${c.sec}!important}
      .hero{background:radial-gradient(60rem 30rem at 85% -10%, ${c.sec}22, transparent 60%),radial-gradient(40rem 24rem at 0% 110%, ${c.sharp}1f, transparent 60%),${c.canvas}!important}
      .evidence__stat,.specialty--1 .eyebrow,.card--lead .eyebrow{color:${c.tint}!important}
      .specialty--2{border-color:${c.sharp}!important}.specialty--2 .eyebrow{color:${c.sharp}!important}
      .hero__em{color:${c.sharp}!important}.hero__em::after{background:${c.sharp}!important}
      .pain-list li{border-left-color:${c.sec}!important}.pain-list li:nth-child(even){border-left-color:${c.sharp}!important}
      .do-list__num,.stage__num{color:${c.sharp}!important}.stage{border-top-color:${c.accent}!important}
      .hero-art svg *[stroke="#1B2A4A"]{stroke:${c.dark}!important}.hero-art svg *[fill="#1B2A4A"]{fill:${c.dark}!important}.hero-art svg *[fill="#D7442C"]{fill:${c.sharp}!important}
      .why-list li::before{background:${c.accent}!important}
    `});
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `qa/screenshots/pal-${name[0]}.png`, fullPage: true });
    await p.close();
  }
  await b.close();
})();
