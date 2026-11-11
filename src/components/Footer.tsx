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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <div className="brand-mark">CW</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.08rem' }}>
                  {REGION_CONFIG.brandName}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-on-dark-muted)' }}>
                  {REGION_CONFIG.countyName} ({REGION_CONFIG.postcodePrefix}1–{REGION_CONFIG.postcodePrefix}11)
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.86rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Independent local trades directory built for homeowners in Crewe, Nantwich, Sandbach and surrounding South Cheshire villages. Filter by 24/7 emergency response, no call-out fee and trade accreditation.
            </p>
            <div style={{ fontSize: '0.8rem' }}>
              <strong>Local Support:</strong> {REGION_CONFIG.supportEmail}
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
                  <Link href={`/${town.slug}`} style={{ color: 'hsl(154, 65%, 74%)', fontWeight: 600 }}>
                    View All {town.name} Trades →
                  </Link>
                </li>
              </ul>
            </div>
          ))}

          <div>
            <h3 className="footer-heading">For Local Tradespeople</h3>
            <ul className="footer-links">
              <li>
                <Link href="/for-businesses">Claim Your Free Business Profile</Link>
              </li>
              <li>
                <Link href="/for-businesses#pricing">
                  Lock In a Top 3 Featured Spot (£29/mo)
                </Link>
              </li>
              <li>
                <Link href="/for-businesses#pricing">
                  Digital Shopfront for Trades Without a Website (£59/mo)
                </Link>
              </li>
              <li>
                <Link href="/admin">Owner Outreach & Lead Hub (/admin)</Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
          }}
        >
          <div>
            © 2026 {REGION_CONFIG.brandName}. Built with Multi-City Copy & Paste Architecture for Crewe, Nantwich & Sandbach.
          </div>
          <div>
            Serving Wistaston • Shavington • Haslington • Willaston • Stapeley • Elworth • Wheelock • Audlem
          </div>
        </div>
      </div>
    </footer>
  );
}
