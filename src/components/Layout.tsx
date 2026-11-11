import { useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { footer, headerCta, navigation, site } from '@/content/site';
import { track } from '@/lib/analytics';
import { isResearchHost, mainOrigin, researchHref } from '@/lib/host';
import type { NavItem } from '@/content/types';

/** Nav for the research subdomain: the offer, the wizard, and a way back. */
const RESEARCH_NAV: NavItem[] = [
  { id: 'market-research', label: 'Digital-Twin Market Research', href: '/' },
  { id: 'start', label: 'Start your free study', href: '/start' },
];

/** Set after mount so prerendered HTML (main-site version) hydrates cleanly. */
function useResearchHost(): boolean {
  const [research, setResearch] = useState(false);
  useEffect(() => setResearch(isResearchHost()), []);
  return research;
}

/** Internal links render as NavLink; absolute ones (the subdomain) as a plain anchor. */
function NavAnchor({ item, className, children }: { item: NavItem; className: string; children: ReactNode }) {
  return item.href.startsWith('http') ? (
    <a href={item.href} className={className}>
      {children}
    </a>
  ) : (
    <NavLink to={item.href} className={className}>
      {children}
    </NavLink>
  );
}

const WARM = (import.meta.env.VITE_THEME ?? '').trim() === 'warm';
const NAV_ICONS: Record<string, ReactElement> = {
  services: <path d="M4 5 h6 v6 H4 Z M14 5 h6 v6 h-6 Z M4 15 h6 v6 H4 Z M14 15 h6 v6 h-6 Z" />,
  approach: <path d="M4 18 c4 0 4 -12 8 -12 s4 12 8 12 M18 6 h2 v2" />,
  about: <path d="M8 11 a3 3 0 1 0 0.1 0 M16 11 a3 3 0 1 0 0.1 0 M3 20 c1 -3 3 -4 5 -4 s4 1 5 4 M11 20 c1 -3 3 -4 5 -4 s4 1 5 4" />,
  'market-research': <path d="M4 19 h16 M7 19 v-6 M12 19 v-10 M17 19 v-4" />,
};

function Header() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const research = useResearchHost();
  const items: NavItem[] = research
    ? RESEARCH_NAV
    : navigation.map((n) => (n.id === 'market-research' ? { ...n, href: researchHref('/market-research') } : n));
  const cta = research ? { label: 'Savant Analytics →', href: mainOrigin || '/' } : headerCta;

  // Close the mobile menu on navigation and on Escape.
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="wordmark" aria-label={`${site.name} home`}>
          <img className="wordmark__mark" src="/logo-mark.svg" alt="" width="28" height="28" aria-hidden="true" />
          <span className="wordmark__text">
            <span className="wordmark__a">Savant</span> <span className="wordmark__b">Analytics</span>
          </span>
        </Link>
        <nav className="nav" aria-label="Primary">
          {items.map((item) => (
            <NavAnchor key={item.id} item={item} className="nav__link">
              {WARM && NAV_ICONS[item.id] && (
                <svg className="nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {NAV_ICONS[item.id]}
                </svg>
              )}
              {item.sub ? (
                <span className="nav__stack">
                  <span>{item.label}</span>
                  <small>{item.sub}</small>
                </span>
              ) : (
                item.label
              )}
            </NavAnchor>
          ))}
          {cta.href.startsWith('http') ? (
            <a href={cta.href} className="btn btn--primary nav__cta">
              {cta.label}
            </a>
          ) : (
            <Link to={cta.href} className="btn btn--primary nav__cta" onClick={() => track('contact_cta_click', { location: 'header' })}>
              {cta.label}
            </Link>
          )}
        </nav>
        <button
          ref={toggleRef}
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      <nav id={menuId} className="mobile-nav" data-open={open} aria-label="Primary mobile" hidden={!open}>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <NavAnchor item={item} className="">
                {item.label}
                {item.sub ? <small className="menu__sub"> — {item.sub}</small> : null}
              </NavAnchor>
            </li>
          ))}
          <li>
            {cta.href.startsWith('http') ? (
              <a href={cta.href}>{cta.label}</a>
            ) : (
              <NavLink to={cta.href} onClick={() => track('contact_cta_click', { location: 'mobile-nav' })}>
                {cta.label}
              </NavLink>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}

function Footer() {
  const research = useResearchHost();
  const links: NavItem[] = footer.links.map((l) => {
    if (l.id === 'market-research') return research ? { ...l, href: '/market-research' } : { ...l, href: researchHref('/market-research') };
    return research && mainOrigin ? { ...l, href: `${mainOrigin}${l.href}` } : l;
  });
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <p>
            <strong className="wordmark__text">
              <span className="wordmark__a">Savant</span> <span className="wordmark__b">Analytics</span>
            </strong>
          </p>
          <p>{footer.line}</p>
          {site.certifications.length > 0 && (
            <ul className="cert-list cert-list--footer" aria-label="Certifications">
              {site.certifications.map((c) => (
                <li key={c.id}>
                  <img src={c.image} alt={c.alt} width="72" height="89" loading="lazy" />
                  <span>{c.label}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="small" style={{ marginTop: 'var(--s-3)' }}>
            &copy; {new Date().getFullYear()} {site.name}
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="footer__links">
            {links.map((l) => (
              <li key={l.id}>
                {l.href.startsWith('http') ? <a href={l.href}>{l.label}</a> : <Link to={l.href}>{l.label}</Link>}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}

/** Scrolls to top on route change (not on hash navigation or back/forward). */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

export default function Layout() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <ScrollManager />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
