import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { footer, headerCta, navigation, site } from '@/content/site';
import { track } from '@/lib/analytics';

function Header() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

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
          <span className="wordmark__dot" aria-hidden="true" />
          {site.name}
        </Link>
        <nav className="nav" aria-label="Primary">
          {navigation.map((item) => (
            <NavLink key={item.id} to={item.href} className="nav__link">
              {item.label}
            </NavLink>
          ))}
          <Link
            to={headerCta.href}
            className="btn btn--primary nav__cta"
            onClick={() => track('contact_cta_click', { location: 'header' })}
          >
            {headerCta.label}
          </Link>
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
          {navigation.map((item) => (
            <li key={item.id}>
              <NavLink to={item.href}>{item.label}</NavLink>
            </li>
          ))}
          <li>
            <NavLink to={headerCta.href} onClick={() => track('contact_cta_click', { location: 'mobile-nav' })}>
              {headerCta.label}
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <p>
            <strong style={{ color: 'var(--color-ink)' }}>{site.name}</strong>
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
            {footer.links.map((l) => (
              <li key={l.id}>
                <Link to={l.href}>{l.label}</Link>
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
