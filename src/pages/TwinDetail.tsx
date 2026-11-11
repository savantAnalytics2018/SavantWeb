import { Link } from 'react-router-dom';
import DetailShell from '@/components/DetailShell';
import { detailBasePath, detailCopy, tiers } from '@/content/twinDetail';
import { pageMeta } from '@/content/meta';
import { detailPath } from '@/lib/host';
import { useHead } from '@/lib/head';
import { track } from '@/lib/analytics';

/** Page 1 of the private menu: the three tiers side by side. */
export default function TwinDetail() {
  useHead(pageMeta.twinDetail);
  return (
    <DetailShell tag={detailCopy.eyebrow}>
      <div className="container">
        <div className="ds__hero" style={{ paddingTop: 0 }}>
          <p className="eyebrow">{detailCopy.eyebrow}</p>
          <h1 className="h1--page ds__title">{detailCopy.title}</h1>
          <p className="lede">{detailCopy.lede}</p>
        </div>
        <div className="tiers">
          {tiers.map((t) => (
            <article key={t.id} className="tier" data-tier={t.id}>
              <p className="eyebrow">{t.name}</p>
              <p className="tier__price">
                {t.price}
                <span className="tier__price-note">{t.priceNote}</span>
              </p>
              <p className="tier__summary">{t.summary}</p>
              <ul className="checklist small">
                {t.includes.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <p className="tier__bestfor small">
                <strong>Best for:</strong> {t.bestFor}
              </p>
              <p className="tier__cta">
                <Link
                  to={detailPath(`${detailBasePath}/start/${t.id}`)}
                  className={`btn ${t.id === 'snapshot' ? 'btn--secondary' : 'btn--primary'}`}
                  onClick={() => track('tier_cta_click', { tier: t.id })}
                >
                  {t.cta}
                </Link>
              </p>
            </article>
          ))}
        </div>
        <p className="muted" style={{ maxWidth: 'var(--measure)', marginTop: 'var(--s-6)' }}>
          {detailCopy.compareNote}
        </p>
      </div>
    </DetailShell>
  );
}
