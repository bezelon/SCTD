import React from 'react';
import Link from 'next/link';
import { REGION_CONFIG } from '@/config/region';
import QuoteModal from '@/components/QuoteModal';

export default function Header() {
  return (
    <>
      <div className="top-notice-bar">
        <div className="container top-notice-inner">
          <div>
            <strong>{REGION_CONFIG.regionName} Local Directory:</strong> Covering{' '}
            {REGION_CONFIG.towns.map((t) => `${t.name} (${t.postcodes.join('/')})`).join(' • ')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              href="/for-businesses"
              style={{ color: 'hsl(154, 65%, 74%)', fontWeight: 700 }}
            >
              Tradesperson in CW1–CW11? Claim or Upgrade to Top 3 (£29/mo) →
            </Link>
            <Link
              href="/admin"
              style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.78rem' }}
            >
              Owner Hub
            </Link>
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
                Crewe • Nantwich • Sandbach Verified Pros
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
            <Link href="/for-businesses" className="nav-link" id="nav-for-businesses">
              For Local Trades
            </Link>
          </nav>

          <div className="header-actions">
            <Link
              href="/for-businesses#claim-form"
              className="btn btn-outline btn-sm"
              id="header-claim-listing-btn"
            >
              Add / Claim Business
            </Link>
            <QuoteModal
              buttonLabel="Get 3 Free Quotes"
              buttonClassName="btn btn-primary btn-sm"
              triggerId="header-get-quotes-btn"
            />
          </div>
        </div>
      </header>
    </>
  );
}
