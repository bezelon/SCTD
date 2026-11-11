'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { OutreachCampaignItem } from '@/lib/listings';
import { HomeownerLead } from '@/app/api/leads/route';
import { BusinessClaim } from '@/app/api/claims/route';

interface AdminConsoleProps {
  initialOutreach: OutreachCampaignItem[];
  totalListingsCount: number;
}

export default function AdminConsole({
  initialOutreach,
  totalListingsCount,
}: AdminConsoleProps) {
  const [activeTab, setActiveTab] = useState<
    'outreach' | 'leads' | 'claims' | 'copypaste'
  >('outreach');
  const [townFilter, setTownFilter] = useState<string>('all');
  const [onlyNoWebsite, setOnlyNoWebsite] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [leads, setLeads] = useState<HomeownerLead[]>([]);
  const [claims, setClaims] = useState<BusinessClaim[]>([]);

  useEffect(() => {
    fetch('/api/leads')
      .then((r) => r.json())
      .then((d) => {
        if (d.leads) setLeads(d.leads);
      })
      .catch(() => {});

    fetch('/api/claims')
      .then((r) => r.json())
      .then((d) => {
        if (d.claims) setClaims(d.claims);
      })
      .catch(() => {});
  }, []);

  const filteredOutreach = initialOutreach.filter((item) => {
    if (townFilter !== 'all' && item.town.toLowerCase() !== townFilter) {
      return false;
    }
    if (onlyNoWebsite && !item.noWebsiteOpportunity) {
      return false;
    }
    return true;
  });

  function copyPitch(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  }

  return (
    <div>
      {/* KPI Overview Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div className="listing-card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            SEEDED LOCAL PROS (CW1–CW11)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.2rem' }}>
            {totalListingsCount} Businesses
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--brand-emerald)', fontWeight: 600 }}>
            30 Programmatic SEO Pages Live
          </div>
        </div>

        <div className="listing-card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            OUTREACH TARGETS (NO WEBSITE / UNCLAIMED)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.2rem' }}>
            {initialOutreach.length} Ready Pitches
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-amber-text)', fontWeight: 600 }}>
            1-Click WhatsApp & Email Templates
          </div>
        </div>

        <div className="listing-card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            HOMEOWNER QUOTE LEADS (PHASE 2)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.2rem' }}>
            {leads.length} Active Leads
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--brand-emerald)', fontWeight: 600 }}>
            Routed to Crewe, Nantwich & Sandbach Pros
          </div>
        </div>

        <div className="listing-card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            30-SLOT POTENTIAL MRR (AT 50% FILL)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.2rem' }}>
            £1,305 / mo
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            45 Featured Pros × £29/mo across 3 towns
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.85rem',
        }}
      >
        <button
          id="tab-outreach-btn"
          type="button"
          className={`btn ${activeTab === 'outreach' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveTab('outreach')}
        >
          1. Automated &ldquo;Claim Profile&rdquo; Outreach ({initialOutreach.length})
        </button>
        <button
          id="tab-leads-btn"
          type="button"
          className={`btn ${activeTab === 'leads' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveTab('leads')}
        >
          2. Homeowner Quote Leads ({leads.length})
        </button>
        <button
          id="tab-claims-btn"
          type="button"
          className={`btn ${activeTab === 'claims' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveTab('claims')}
        >
          3. Business Claims & Upgrades ({claims.length})
        </button>
        <button
          id="tab-copypaste-btn"
          type="button"
          className={`btn ${activeTab === 'copypaste' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveTab('copypaste')}
        >
          4. Multi-City &ldquo;Copy & Paste&rdquo; Cloner Guide
        </button>
      </div>

      {/* TAB 1: OUTREACH CAMPAIGNS */}
      {activeTab === 'outreach' && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <select
                id="outreach-town-filter"
                className="form-select"
                style={{ width: 'auto' }}
                value={townFilter}
                onChange={(e) => setTownFilter(e.target.value)}
              >
                <option value="all">All Towns (Crewe, Nantwich, Sandbach)</option>
                <option value="crewe">Crewe (CW1/CW2)</option>
                <option value="nantwich">Nantwich (CW5)</option>
                <option value="sandbach">Sandbach (CW11)</option>
              </select>

              <button
                type="button"
                className={`filter-chip ${onlyNoWebsite ? 'active' : ''}`}
                onClick={() => setOnlyNoWebsite((v) => !v)}
              >
                {onlyNoWebsite ? '✓' : '+'} Only Trades With No Website (FB Only)
              </button>
            </div>

            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Full CSV exported at: <code>src/data/outreach-campaigns.csv</code>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Business & Town</th>
                  <th>Trade & Website Status</th>
                  <th>Pre-Written Automated Pitch (Email / WhatsApp / FB DM)</th>
                  <th>1-Click Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOutreach.slice(0, 25).map((item) => {
                  const cleanDigits = item.phone.replace(/\s+/g, '').replace(/^0/, '44');
                  const waLink = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(
                    item.whatsappOrFbMessage
                  )}`;
                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 800 }}>
                          <Link
                            href={item.profileUrl.replace('https://southcheshiretrades.co.uk', '')}
                            style={{ color: 'var(--brand-emerald)' }}
                          >
                            {item.businessName}
                          </Link>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {item.town} ({item.postcode})
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {item.phone} • {item.email}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                          {item.category}
                        </div>
                        {item.noWebsiteOpportunity ? (
                          <span className="badge badge-amber">
                            🔥 No Website (FB Only)
                          </span>
                        ) : (
                          <span className="badge badge-neutral">Has Website</span>
                        )}
                      </td>
                      <td style={{ maxWidth: '460px' }}>
                        <div
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            marginBottom: '0.2rem',
                            color: 'var(--text-primary)',
                          }}
                        >
                          Subject: {item.subjectLine}
                        </div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            backgroundColor: 'var(--bg-subtle)',
                            padding: '0.55rem 0.7rem',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          {item.whatsappOrFbMessage}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() =>
                              copyPitch(item.id, item.whatsappOrFbMessage)
                            }
                          >
                            {copiedId === item.id ? '✓ Copied!' : '📋 Copy Pitch'}
                          </button>
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm"
                          >
                            💬 Open WhatsApp
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: HOMEOWNER LEADS (PHASE 2) */}
      {activeTab === 'leads' && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lead ID & Date</th>
                <th>Homeowner & Postcode</th>
                <th>Trade & Urgency</th>
                <th>Job Description</th>
                <th>Routed To Local Pros</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{lead.id}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(lead.createdAt).toLocaleDateString('en-GB')}
                    </div>
                    <span className="badge badge-verified" style={{ marginTop: '0.25rem' }}>
                      Est. Job £{lead.estimatedValueGbp}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{lead.homeownerName}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--brand-emerald)', fontWeight: 700 }}>
                      {lead.phone}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {lead.postcode}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>
                      {lead.categorySlug.replace('-', ' ')} ({lead.townSlug})
                    </div>
                    <span className="badge badge-amber" style={{ marginTop: '0.25rem' }}>
                      {lead.urgency}
                    </span>
                  </td>
                  <td style={{ maxWidth: '340px', fontSize: '0.85rem' }}>
                    {lead.jobDescription}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                      {lead.routedTo.join(' • ')}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--brand-emerald)', marginTop: '0.2rem' }}>
                      {lead.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: BUSINESS CLAIMS & SUBSCRIPTIONS (PHASE 1) */}
      {activeTab === 'claims' && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Business & Town</th>
                <th>Contact Details</th>
                <th>Selected Plan & MRR</th>
                <th>Status & Notes</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id}>
                  <td style={{ fontWeight: 700 }}>{claim.id}</td>
                  <td>
                    <div style={{ fontWeight: 800 }}>{claim.businessName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {claim.townSlug} • {claim.categorySlug}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{claim.contactName}</div>
                    <div style={{ fontSize: '0.8rem' }}>{claim.phone}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {claim.email}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-featured">
                      {claim.selectedPlan.toUpperCase()} (£{claim.monthlyValueGbp}/mo)
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{claim.status}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {claim.notes}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: MULTI-CITY COPY & PASTE PLAYBOOK */}
      {activeTab === 'copypaste' && (
        <div className="listing-card">
          <span className="badge badge-featured" style={{ marginBottom: '0.5rem' }}>
            Multi-City Replication Blueprint
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.6rem' }}>
            How to &ldquo;Copy & Paste&rdquo; This Directory to Another UK Town Cluster in 15 Minutes
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
            Once Crewe, Nantwich & Sandbach is ranking and generating Featured subscriptions, you can launch your next regional cluster (e.g. <strong>Mid Cheshire: Northwich, Winsford & Middlewich</strong>, <strong>East Cheshire: Macclesfield, Congleton & Wilmslow</strong>, or <strong>Chester & Ellesmere Port</strong>) without touching a single UI component:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.15rem' }}>
            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1.15rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 800, marginBottom: '0.35rem' }}>
                Step 1: Edit <code>src/config/region.ts</code>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Change <code>brandName</code>, <code>domain</code>, and the 3 towns in the <code>towns</code> array (postcodes, nearby villages, landmarks).
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1.15rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 800, marginBottom: '0.35rem' }}>
                Step 2: Run the Seeding & Outreach Scripts
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Run <code>node scripts/import-and-enrich.mjs --input google-maps.json</code> and <code>node scripts/generate-outreach-csv.mjs</code> to generate your new database and WhatsApp outreach list.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1.15rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 800, marginBottom: '0.35rem' }}>
                Step 3: Deploy Free on Vercel / Cloudflare
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Push to a new GitHub repo or branch and connect a £6/yr <code>.co.uk</code> domain on Vercel. All 30+ Programmatic SEO pages build automatically.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
