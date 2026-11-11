import React from 'react';
import type { Metadata } from 'next';
import { REGION_CONFIG } from '@/config/region';
import { CATEGORIES } from '@/config/categories';
import { getFeaturedSlotStatus } from '@/lib/listings';
import BusinessClaimPortal from '@/components/BusinessClaimPortal';

export const metadata: Metadata = {
  title: 'For Local Tradespeople in Crewe, Nantwich & Sandbach | Claim Top 3 Spot (£29/mo)',
  description:
    'Claim your free trade business profile or lock in a Top 3 Featured Pro spot in Crewe (CW1/CW2), Nantwich (CW5) or Sandbach (CW11). 0% commission on jobs.',
};

export default function ForBusinessesPage() {
  return (
    <>
      <section className="hero-section">
        <div className="container">
          <div className="hero-eyebrow">
            For Local Tradespeople in Crewe (CW1/CW2), Nantwich (CW5) & Sandbach (CW11)
          </div>
          <h1 className="hero-title">
            Be First When Homeowners in South Cheshire Need a Trusted Trade
          </h1>
          <p className="hero-subtitle">
            Stop paying £30+ per shared lead on national lead-buying websites. Pin your business in the{' '}
            <strong>Top 3 Featured Box</strong> for your town at a flat £29/month — or let us host your complete{' '}
            <strong>Digital Shopfront</strong> if you currently only use Facebook.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <a href="#claim-form" className="btn btn-primary btn-lg">
              Claim or Upgrade Your Listing (60 Secs) →
            </a>
            <a href="#scarcity-matrix" className="btn btn-ghost-dark btn-lg">
              Check Open Top-3 Slots by Town ↓
            </a>
          </div>
        </div>
      </section>

      <BusinessClaimPortal />

      {/* Live Top-3 Scarcity Matrix across Crewe, Nantwich & Sandbach */}
      <section className="section" id="scarcity-matrix">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                Live Top-3 Featured Slot Availability (CW1–CW11)
              </h2>
              <p className="section-subtitle">
                Each town & trade category is strictly capped at {REGION_CONFIG.monetization.maxFeaturedPerCategoryTown} Featured Pros. Once all 3 spots are taken, new applicants join the waiting list.
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Trade Category</th>
                  {REGION_CONFIG.towns.map((town) => (
                    <th key={town.slug}>
                      {town.name} ({town.postcodes.join('/')})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map((cat) => (
                  <tr key={cat.slug}>
                    <td style={{ fontWeight: 700 }}>{cat.name}</td>
                    {REGION_CONFIG.towns.map((town) => {
                      const status = getFeaturedSlotStatus(town.slug, cat.slug);
                      return (
                        <td key={`${cat.slug}-${town.slug}`}>
                          <span className="badge badge-amber">
                            {status.taken}/{status.maxSlots} Taken • {status.remaining} Spot Open
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
