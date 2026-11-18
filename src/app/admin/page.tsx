import React from 'react';
import type { Metadata } from 'next';
import { getAllListings, getOutreachCampaigns } from '@/lib/listings';
import { checkAdminAuthorized } from '@/lib/auth';
import { getShowDemoListings } from '@/lib/db';
import AdminConsole from '@/components/AdminConsole';
import AdminLoginGate from '@/components/AdminLoginGate';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Community Steward Console – South Cheshire Locals',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const auth = await checkAdminAuthorized();
  const allListings = getAllListings();
  const outreachCampaigns = getOutreachCampaigns();
  const initialShowDemo = await getShowDemoListings();

  return (
    <>
      <section className="hero-section" style={{ padding: '2rem 0' }}>
        <div className="container">
          <div className="hero-eyebrow">CW1–CW11 Community Steward Console</div>
          <h1 className="hero-title" style={{ fontSize: '1.9rem', marginBottom: '0.4rem' }}>
            South Cheshire Locals — Nominations, Live Trades &amp; Enquiries
          </h1>
          <p className="hero-subtitle" style={{ marginBottom: 0, fontSize: '0.95rem' }}>
            Review neighbour recommendations from Crewe, Nantwich &amp; Sandbach residents, publish real CW trades in 1 click, toggle Sample Preview mode, and track direct homeowner quote requests.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {!auth.authorized ? (
            <AdminLoginGate
              mode={auth.mode === 'unconfigured' ? 'unconfigured' : 'required'}
            />
          ) : (
            <AdminConsole
              initialOutreach={outreachCampaigns}
              sampleListingsCount={allListings.length}
              initialShowDemo={initialShowDemo}
              authMode={auth.mode}
            />
          )}
        </div>
      </section>
    </>
  );
}
