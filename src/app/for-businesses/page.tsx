import React from 'react';
import type { Metadata } from 'next';
import { REGION_CONFIG } from '@/config/region';
import { CATEGORIES } from '@/config/categories';
import { getFeaturedSlotStatus } from '@/lib/listings';
import BusinessClaimPortal from '@/components/BusinessClaimPortal';

export const metadata: Metadata = {
  title: 'For Local Tradespeople in Crewe, Nantwich & Sandbach | South Cheshire Locals',
  description:
    'Claim your free local CW trade listing or support our community-run South Cheshire directory. 0% commission on local jobs across CW1–CW11.',
};

export default function ForBusinessesPage() {
  return (
    <>
      <section className="hero-section">
        <div className="container">
          <div className="hero-eyebrow">
            For Independent Local Trades in Crewe (CW1/CW2), Nantwich (CW5) &amp; Sandbach (CW11)
          </div>
          <h1 className="hero-title">
            Keep Your Trade Booked by Neighbours Down the Road — Not National Call Centres
          </h1>
          <p className="hero-subtitle">
            National lead websites charge £30+ every time they sell the same homeowner enquiry to five firms. Claim your{' '}
            <strong>free CW community listing</strong> or become a{' '}
            <strong>Local Community Supporter (£29/mo)</strong> to keep the directory free for neighbours — always with 0% commission.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <a href="#claim-form" className="btn btn-primary btn-lg">
              Claim or Update Your Local Listing (60 Secs) →
            </a>
            <a href="#scarcity-matrix" className="btn btn-outline btn-lg">
              View Local Supporter Slots by Town ↓
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
