import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { site } from '@/content/site';
import { detailBasePath, detailCopy } from '@/content/twinDetail';
import { detailPath } from '@/lib/host';

/**
 * Minimal shell for the private tier menu (twindetail.<domain>): wordmark, a tag, the
 * content, and a one-line footer. No site nav — the site is not meant to be discovered
 * from here, and this is not meant to be discovered from the site.
 */
export default function DetailShell({ tag, children, showBack }: { tag: string; children: ReactNode; showBack?: boolean }) {
  return (
    <div className="ds">
      <header className="ds__header">
        <div className="container ds__header-inner">
          <span className="wordmark" aria-label={site.name}>
            <img className="wordmark__mark" src="/logo-mark.svg" alt="" width="28" height="28" aria-hidden="true" />
            <span className="wordmark__text">
              <span className="wordmark__a">Savant</span> <span className="wordmark__b">Analytics</span>
            </span>
          </span>
          {showBack ? (
            <Link to={detailPath(detailBasePath)} className="link-arrow link-arrow--back">
              {detailCopy.back}
            </Link>
          ) : (
            <span className="ds__tag">{tag}</span>
          )}
        </div>
      </header>
      <main id="main" className="section">
        {children}
      </main>
      <footer className="ds__footer">
        <div className="container">
          <p className="small muted">
            © {new Date().getFullYear()} {site.name}. {detailCopy.tag}. <Link to="/privacy">Privacy</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
