import React from 'react';
import type { Metadata } from 'next';
import { getAllListings, getOutreachCampaigns } from '@/lib/listings';
import AdminConsole from '@/components/AdminConsole';

export const metadata: Metadata = {
  title: 'Owner Command Centre – Outreach, Leads & Subscriptions',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  const allListings = getAllListings();
  const outreachCampaigns = getOutreachCampaigns();

  return (
    <>
      <section className="hero-section" style={{ padding: '2rem 0' }}>
        <div className="container">
          <div className="hero-eyebrow">Directory Owner Command Centre</div>
          <h1 className="hero-title" style={{ fontSize: '1.9rem', marginBottom: '0.4rem' }}>
            South Cheshire Trades — Automated Outreach, Leads & MRR Hub
          </h1>
          <p className="hero-subtitle" style={{ marginBottom: 0, fontSize: '0.95rem' }}>
            Manage your Phase 1 &ldquo;Claim Your Profile&rdquo; automated outreach campaigns (60 unclaimed Crewe, Nantwich & Sandbach trades), track Phase 2 homeowner quote leads, and clone to new cities.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <AdminConsole
            initialOutreach={outreachCampaigns}
            totalListingsCount={allListings.length}
          />
        </div>
      </section>
    </>
  );
}
