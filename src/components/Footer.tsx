import React from 'react';
import Link from 'next/link';
import { REGION_CONFIG } from '@/config/region';
import { CATEGORIES } from '@/config/categories';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                marginBottom: '0.85rem',
              }}
            >
              <div className="brand-mark">CW</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.08rem' }}>
                  {REGION_CONFIG.brandName}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-on-dark-muted)' }}>
                  Crewe • Nantwich • Sandbach (CW1–CW11)
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.86rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              A neighbour-built black book for Crewe, Nantwich, Sandbach and surrounding Cheshire villages. Built so locals can hire real people down the road instead of feeding national lead brokers or guessing on search engines.
            </p>
            <div style={{ fontSize: '0.8rem' }}>
              <strong>Community Desk:</strong> {REGION_CONFIG.supportEmail}
            </div>
          </div>

          {REGION_CONFIG.towns.map((town) => (
            <div key={town.slug}>
              <h3 className="footer-heading">
                <Link href={`/${town.slug}`}>
                  {town.name} ({town.postcodes.join('/')})
                </Link>
              </h3>
              <ul className="footer-links">
                {CATEGORIES.slice(0, 7).map((cat) => (
                  <li key={`${town.slug}-${cat.slug}`}>
                    <Link href={`/${town.slug}/${cat.slug}`}>
                      {cat.shortName} in {town.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href={`/${town.slug}`}
                    style={{ color: '#B7CEBE', fontWeight: 600 }}
                  >
                    All {town.name} Trades →
                  </Link>
                </li>
              </ul>
            </div>
          ))}

          <div>
            <h3 className="footer-heading">Community &amp; Trades</h3>
            <ul className="footer-links">
              <li>
                <Link href="/#why-back-local">Why Back Local (CW1–CW11)</Link>
              </li>
              <li>
                <Link href="/for-businesses">
                  For Local Trades: Update or Support Your Listing
                </Link>
              </li>
              <li>
                <Link href="/for-businesses#claim-form">
                  Claim Free Local Profile (£0)
                </Link>
              </li>
              <li>
                <Link href="/admin" style={{ opacity: 0.72 }}>
                  Community Steward Console
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.78rem',
          }}
        >
          <div>
            © 2026 {REGION_CONFIG.brandName}. Keeping money in CW1–CW11 — Crewe, Nantwich &amp; Sandbach.
          </div>
          <div>
            Local town photography via Wikimedia Commons (CC BY-SA / Public Domain): Jo Turner, FREON101, Jonathanawhite, fotodiscs4u.
          </div>
        </div>
      </div>
    </footer>
  );
}
