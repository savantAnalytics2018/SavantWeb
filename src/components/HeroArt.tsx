import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { homeHero } from '@/content/home';
import { track } from '@/lib/analytics';

const STORAGE_KEY = 'sa-hero-animation';

/**
 * Hero: one outlined circle, one ink. In the middle, the orchestrator. Around
 * it, five workflow icons — a case file, a database, a batch process, a
 * report, a compliance check. One by one the orchestrator reaches each
 * workflow: the connector draws, the icon draws itself, and it is marked
 * done. Then the cycle repeats. Decorative (aria-hidden); the HTML caption
 * carries meaning. Stroke-draw/opacity animation only; pauses offscreen and
 * hidden; honors prefers-reduced-motion; visitor pause control.
 */

const INK = '#1F2937';
const C = { x: 300, y: 300 };
const RADIUS = 178;
const ICON_R = 34;
const STEP = 1.9; // s between workflows
const START = 0.5;

type Icon = { name: string; color: string; paths: string[] };
/** Icons drawn in a 64×64 box centred at 0,0 — simple single-stroke pictograms. */
const ICONS: Icon[] = [
  {
    name: 'case file',
    color: '#2563EB',
    paths: ['M-20 -28 H 8 L 20 -16 V 28 H -20 Z', 'M8 -28 V -16 H 20', 'M-10 -2 H 10', 'M-10 8 H 10', 'M-10 18 H 2'],
  },
  {
    name: 'database',
    color: '#0EA5A4',
    paths: ['M-22 -20 A 22 9 0 0 0 22 -20 A 22 9 0 0 0 -22 -20 Z', 'M-22 -20 V 20 A 22 9 0 0 0 22 20 V -20', 'M-22 0 A 22 9 0 0 0 22 0'],
  },
  {
    name: 'batch process',
    color: '#F59E0B',
    paths: [
      'M0 -26 A 26 26 0 1 1 -0.1 -26',
      'M0 -10 A 10 10 0 1 0 0.1 -10',
      'M0 -32 V -26 M0 26 V 32 M-32 0 H -26 M26 0 H 32 M-22.6 -22.6 L -18.4 -18.4 M18.4 18.4 L 22.6 22.6 M-22.6 22.6 L -18.4 18.4 M18.4 -18.4 L 22.6 -22.6',
    ],
  },
  {
    name: 'report',
    color: '#7C3AED',
    paths: ['M-24 -24 V 24 H 24', 'M-12 24 V 4', 'M0 24 V -8', 'M12 24 V -18'],
  },
  {
    name: 'compliance check',
    color: '#DC2626',
    paths: ['M0 -28 L 24 -18 V 2 C 24 16, 12 26, 0 30 C -12 26, -24 16, -24 2 V -18 Z', 'M-10 2 L -2 10 L 12 -8'],
  },
];

export default function HeroArt() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [motionAllowed, setMotionAllowed] = useState(true);
  const [userPaused, setUserPaused] = useState(false);
  const [autoPaused, setAutoPaused] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setMotionAllowed(!mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY) === 'paused') setUserPaused(true);
    } catch {
      /* storage unavailable */
    }
    return () => mq.removeEventListener?.('change', apply);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let offscreen = false;
    let hidden = document.visibilityState === 'hidden';
    const update = () => setAutoPaused(offscreen || hidden);
    const io = new IntersectionObserver((entries) => {
      offscreen = !entries.some((e) => e.isIntersecting);
      update();
    });
    io.observe(el);
    const onVis = () => {
      hidden = document.visibilityState === 'hidden';
      update();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const toggle = () => {
    const next = !userPaused;
    setUserPaused(next);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, next ? 'paused' : 'playing');
    } catch {
      /* ignore */
    }
    track('animation_toggled', { paused: next });
  };

  const animate = motionAllowed;
  const paused = userPaused || autoPaused;

  return (
    <div ref={rootRef} className="hero__art hero-art" data-animate={animate} data-paused={paused}>
      <svg className="hero-art__svg" viewBox="0 0 600 600" role="presentation" aria-hidden="true" focusable="false">
        <circle cx="300" cy="300" r="268" fill="none" stroke={INK} strokeWidth="1.5" />

        <g fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {/* Orchestrator */}
          <circle className="orch-pulse" cx={C.x} cy={C.y} r="22" strokeWidth="1.5" stroke="#2563EB" style={{ transformOrigin: `${C.x}px ${C.y}px` }} />
          <circle cx={C.x} cy={C.y} r="22" strokeWidth="3" stroke="#2563EB" />
          <circle cx={C.x} cy={C.y} r="7" fill="#F59E0B" stroke="none" />

          {ICONS.map((icon, i) => {
            const angle = (-90 + i * 72) * (Math.PI / 180);
            const x = C.x + RADIUS * Math.cos(angle);
            const y = C.y + RADIUS * Math.sin(angle);
            const x1 = C.x + 26 * Math.cos(angle);
            const y1 = C.y + 26 * Math.sin(angle);
            const x2 = C.x + (RADIUS - ICON_R - 8) * Math.cos(angle);
            const y2 = C.y + (RADIUS - ICON_R - 8) * Math.sin(angle);
            const d = START + i * STEP;
            const style = { '--d': `${d}s` } as CSSProperties;
            return (
              <g key={icon.name}>
                {/* faint resting state so the composition is complete at first paint */}
                <g opacity="0.22" strokeWidth="2">
                  <line x1={x1} y1={y1} x2={x2} y2={y2} />
                  <g transform={`translate(${x} ${y})`}>
                    {icon.paths.map((p, k) => (
                      <path key={k} d={p} />
                    ))}
                  </g>
                </g>
                {/* live: connector draws, icon draws, done mark */}
                <line className="draw draw--link" pathLength="1" style={style} x1={x1} y1={y1} x2={x2} y2={y2} stroke={icon.color} />
                <g transform={`translate(${x} ${y})`} stroke={icon.color}>
                  {icon.paths.map((p, k) => (
                    <path key={k} className="draw draw--icon" pathLength="1" style={{ '--d': `${d + 0.35 + k * 0.12}s` } as CSSProperties} d={p} />
                  ))}
                </g>
                <g className="done" style={{ '--d': `${d + 1.25}s`, transformOrigin: `${x + 30}px ${y - 30}px` } as CSSProperties}>
                  <circle cx={x + 30} cy={y - 30} r="10" fill={icon.color} stroke="none" />
                  <path d={`M${x + 25.5} ${y - 30} l3 3 l6 -6.5`} strokeWidth="2.2" stroke="#FFFFFF" />
                </g>
              </g>
            );
          })}
        </g>
      </svg>

      <p className="hero-art__caption">{homeHero.artCaption}</p>

      {animate && (
        <button type="button" className="hero-art__toggle" onClick={toggle} aria-pressed={userPaused}>
          {userPaused ? 'Resume animation' : 'Pause animation'}
        </button>
      )}
    </div>
  );
}
