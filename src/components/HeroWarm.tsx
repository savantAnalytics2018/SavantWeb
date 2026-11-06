import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import HeroArt from '@/components/HeroArt';
import { homeHero } from '@/content/home';
import { track } from '@/lib/analytics';

/**
 * "Warm" theme hero (test2): full-bleed band with the animation as the backdrop,
 * headline on the left, and a large white panel overlapping the bottom edge
 * with a status chip and pill-shaped option tiles — one per service, plus the
 * free market-research study. Used only when VITE_THEME=warm.
 */

const OPTIONS: { label: string; href: string; icon: ReactElement }[] = [
  {
    label: 'AI strategy',
    href: '/services#ai-strategy',
    icon: <path d="M4 20 L10 12 L14 15 L20 6" />,
  },
  {
    label: 'Legacy modernization',
    href: '/services#legacy-modernization',
    icon: <path d="M4 7 h16 v10 H4 Z M8 12 h8" />,
  },
  {
    label: 'Digital twins & evaluation',
    href: '/services#digital-twins-evaluation',
    icon: <path d="M7 12 a5 5 0 1 0 0.1 0 M17 12 a5 5 0 1 0 0.1 0" />,
  },
  {
    label: 'AI deployment',
    href: '/services#ai-deployment',
    icon: <path d="M12 4 v12 M6 10 l6 -6 l6 6 M5 20 h14" />,
  },
  {
    label: 'AI governance',
    href: '/services#ai-governance',
    icon: <path d="M12 3 l8 3 v6 c0 5 -4 8 -8 9 c-4 -1 -8 -4 -8 -9 V6 Z" />,
  },
  {
    label: 'Run a free market-research study',
    href: '/market-research',
    icon: <path d="M4 18 h16 M7 18 v-6 M12 18 v-10 M17 18 v-4" />,
  },
];

export default function HeroWarm() {
  const headline = homeHero.headline.split('\n').map((l, i, arr) => {
    const m = l.match(/^(.*?)<em>(.*?)<\/em>(.*)$/);
    return (
      <span key={l}>
        {m ? (
          <>
            {m[1]}
            <em className="hero__em">{m[2]}</em>
            {m[3]}
          </>
        ) : (
          l
        )}
        {i < arr.length - 1 && <br />}
      </span>
    );
  });

  return (
    <>
      <section className="whero" aria-labelledby="hero-heading">
        <div className="whero__bg" aria-hidden="true">
          <HeroArt />
        </div>
        <div className="container">
          <div className="whero__inner">
            <p className="eyebrow">{homeHero.eyebrow}</p>
            <h1 id="hero-heading">{headline}</h1>
            <p className="lede">
              {homeHero.lines.map((l, i) => (
                <span key={l} className="line">
                  {l}
                  {i < homeHero.lines.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
        </div>
      </section>

      {/* Overlapping panel */}
      <section className="wpanel-wrap" aria-labelledby="wpanel-heading">
        <div className="container">
          <div className="wchip" role="note">
            <span className="wchip__dot" aria-hidden="true" />
            First study free · about 10 minutes · no sales call
          </div>
          <div className="wpanel">
            <div className="wpanel__head">
              <h2 id="wpanel-heading">Start with one problem</h2>
              <Link to={homeHero.primaryCta.href} className="btn btn--primary" onClick={() => track('contact_cta_click', { location: 'hero' })}>
                {homeHero.primaryCta.label}
              </Link>
            </div>
            <ul className="wtiles">
              {OPTIONS.map((o) => (
                <li key={o.label}>
                  <Link to={o.href} className="wtile">
                    <svg className="wtile__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {o.icon}
                    </svg>
                    <span>{o.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="small muted wpanel__micro">
              {homeHero.micro}{' '}
              <a href={homeHero.source.href} rel="noopener">
                {homeHero.source.label}
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
