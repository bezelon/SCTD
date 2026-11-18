import React from 'react';
import Link from 'next/link';
import { REGION_CONFIG } from '@/config/region';
import QuoteModal from '@/components/QuoteModal';
import NominateModal from '@/components/NominateModal';

export default function Header() {
  return (
    <>
      <div className="top-notice-bar">
        <div className="container top-notice-inner">
          <div style={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
            <span className="pledge-dot" aria-hidden="true" />
            <span>
              <strong>CW1–CW11 Community Black Book:</strong>{' '}
              {REGION_CONFIG.towns
                .map((t) => `${t.name} (${t.postcodes.join('/')})`)
                .join(' • ')}{' '}
              — Independent &amp; Neighbour-Backed
            </span>
          </div>
          <div>
            <NominateModal
              buttonLabel="Know a reliable local mate or trade? Nominate them (£0) →"
              buttonClassName="nav-link"
              triggerId="topbar-nominate-btn"
            />
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand-link" id="header-brand-link">
            <div className="brand-mark">CW</div>
            <div>
              <span className="brand-title">{REGION_CONFIG.brandName}</span>
              <span className="brand-sub">
                CW1–CW11 • Crewe, Nantwich &amp; Sandbach
              </span>
            </div>
          </Link>

          <nav className="nav-links" aria-label="Main Navigation">
            {REGION_CONFIG.towns.map((town) => (
              <Link
                key={town.slug}
                href={`/${town.slug}`}
                className="nav-link"
                id={`nav-town-${town.slug}`}
              >
                {town.name} ({town.postcodes[0]})
              </Link>
            ))}
            <Link href="/#why-back-local" className="nav-link" id="nav-why-local">
              Back Our Own
            </Link>
          </nav>

          <div className="header-actions">
            <NominateModal
              buttonLabel="+ Nominate a Local Trade"
              buttonClassName="btn btn-outline btn-sm"
              triggerId="header-nominate-btn"
            />
            <QuoteModal
              buttonLabel="Ask 3 Neighbour Pros"
              buttonClassName="btn btn-primary btn-sm"
              triggerId="header-get-quotes-btn"
            />
          </div>
        </div>
      </header>
    </>
  );
}
