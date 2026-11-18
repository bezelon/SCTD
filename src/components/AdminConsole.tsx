'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OutreachCampaignItem } from '@/lib/listings';
import { HomeownerLead } from '@/app/api/leads/route';
import { BusinessClaim } from '@/app/api/claims/route';
import { CommunityNomination } from '@/app/api/nominations/route';
import type { ApprovedListingRecord } from '@/lib/db';
import { REGION_CONFIG } from '@/config/region';
import { CATEGORIES } from '@/config/categories';

interface AdminConsoleProps {
  initialOutreach: OutreachCampaignItem[];
  sampleListingsCount: number;
  initialShowDemo: boolean;
  authMode: 'authenticated' | 'dev-open' | 'unconfigured' | 'required';
}

export default function AdminConsole({
  initialOutreach,
  sampleListingsCount,
  initialShowDemo,
  authMode,
}: AdminConsoleProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    'nominations' | 'live-trades' | 'outreach' | 'leads' | 'claims' | 'copypaste'
  >('nominations');
  const [townFilter, setTownFilter] = useState<string>('all');
  const [onlyNoWebsite, setOnlyNoWebsite] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [nominations, setNominations] = useState<CommunityNomination[]>([]);
  const [approvedListings, setApprovedListings] = useState<ApprovedListingRecord[]>([]);
  const [leads, setLeads] = useState<HomeownerLead[]>([]);
  const [claims, setClaims] = useState<BusinessClaim[]>([]);
  const [showDemoListings, setShowDemoListings] = useState<boolean>(initialShowDemo);
  const [togglingDemo, setTogglingDemo] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Quick-add real CW trade form state
  const [quickName, setQuickName] = useState('');
  const [quickTown, setQuickTown] = useState('crewe');
  const [quickCategory, setQuickCategory] = useState('plumbers');
  const [quickContact, setQuickContact] = useState('');
  const [quickArea, setQuickArea] = useState('');
  const [quickPostcode, setQuickPostcode] = useState('');
  const [quickSummary, setQuickSummary] = useState('');
  const [addingTrade, setAddingTrade] = useState(false);

  async function refreshAllData() {
    await Promise.all([
      fetch('/api/nominations')
        .then((r) =>
          r.ok
            ? (r.json() as Promise<{ nominations?: CommunityNomination[] }>)
            : null
        )
        .then((d) => {
          if (d?.nominations) setNominations(d.nominations);
        })
        .catch(() => {}),
      fetch('/api/admin/listings')
        .then((r) =>
          r.ok
            ? (r.json() as Promise<{ listings?: ApprovedListingRecord[] }>)
            : null
        )
        .then((d) => {
          if (d?.listings) setApprovedListings(d.listings);
        })
        .catch(() => {}),
      fetch('/api/leads')
        .then((r) =>
          r.ok ? (r.json() as Promise<{ leads?: HomeownerLead[] }>) : null
        )
        .then((d) => {
          if (d?.leads) setLeads(d.leads);
        })
        .catch(() => {}),
      fetch('/api/claims')
        .then((r) =>
          r.ok ? (r.json() as Promise<{ claims?: BusinessClaim[] }>) : null
        )
        .then((d) => {
          if (d?.claims) setClaims(d.claims);
        })
        .catch(() => {}),
    ]);
  }

  useEffect(() => {
    refreshAllData();
  }, []);

  async function handleToggleDemo() {
    setTogglingDemo(true);
    setStatusMessage('');
    const nextValue = !showDemoListings;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showDemoListings: nextValue }),
      });
      if (res.ok) {
        setShowDemoListings(nextValue);
        setStatusMessage(
          nextValue
            ? 'Sample Preview listings are now visible alongside real CW trades.'
            : 'Sample Preview listings hidden — showing only real neighbour-approved CW trades!'
        );
      }
    } finally {
      setTogglingDemo(false);
    }
  }

  async function handleApproveNomination(nom: CommunityNomination) {
    setApprovingId(nom.id);
    setStatusMessage('');
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nominationId: nom.id,
          name: nom.tradeName,
          townSlug: nom.townSlug,
          categorySlug: nom.categorySlug,
          phoneOrFacebook: nom.phoneOrFacebook,
          nominatedBy: nom.nominatedBy,
          shortSummary:
            nom.reason ||
            `Recommended by ${nom.nominatedBy} (${nom.relationshipNote}).`,
        }),
      });
      const data = (await res.json()) as {
        listing?: ApprovedListingRecord;
        error?: string;
      };
      if (res.ok && data.listing) {
        setStatusMessage(
          `Published "${data.listing.name}" live to /${data.listing.primaryTownSlug}/${data.listing.categorySlug} and /pro/${data.listing.slug}!`
        );
        await refreshAllData();
      }
    } finally {
      setApprovingId(null);
    }
  }

  async function handleQuickAddTrade(e: React.FormEvent) {
    e.preventDefault();
    setAddingTrade(true);
    setStatusMessage('');
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: quickName,
          townSlug: quickTown,
          categorySlug: quickCategory,
          phoneOrFacebook: quickContact,
          areaLabel: quickArea,
          postcode: quickPostcode,
          shortSummary: quickSummary,
          nominatedBy: 'Steward Verified Local',
        }),
      });
      const data = (await res.json()) as {
        listing?: ApprovedListingRecord;
        error?: string;
      };
      if (res.ok && data.listing) {
        setQuickName('');
        setQuickContact('');
        setQuickArea('');
        setQuickPostcode('');
        setQuickSummary('');
        setStatusMessage(
          `Added "${data.listing.name}" live! Profile: /pro/${data.listing.slug}`
        );
        await refreshAllData();
      }
    } finally {
      setAddingTrade(false);
    }
  }

  async function handleDeleteApprovedListing(id: string) {
    await fetch(`/api/admin/listings?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    await refreshAllData();
  }

  async function handleSignOut() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.refresh();
  }

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
      {/* Steward Controls Bar (Demo/Live Switch + Auth Status) */}
      <div
        className="listing-card"
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--bg-subtle)',
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.96rem', marginBottom: '0.2rem' }}>
            Directory Mode:{' '}
            <span style={{ color: showDemoListings ? 'var(--accent-amber-text)' : 'var(--brand-emerald)' }}>
              {showDemoListings
                ? `Sample Preview + Real Locals (${approvedListings.length} real + ${sampleListingsCount} sample)`
                : `Real CW Locals Only (${approvedListings.length} live)`}
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {authMode === 'dev-open'
              ? 'Local dev mode (set ADMIN_PASSWORD in .dev.vars or Cloudflare Secrets before deploying).'
              : 'Protected session active (Cloudflare D1 / local JSON synced).'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            id="toggle-demo-mode-btn"
            type="button"
            className={`btn btn-sm ${showDemoListings ? 'btn-amber' : 'btn-primary'}`}
            onClick={handleToggleDemo}
            disabled={togglingDemo}
          >
            {togglingDemo
              ? 'Updating...'
              : showDemoListings
              ? 'Switch to Real CW Locals Only (Hide Sample)'
              : 'Show Sample Preview Listings'}
          </button>

          {authMode === 'authenticated' && (
            <button
              id="admin-logout-btn"
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div
          style={{
            backgroundColor: 'var(--brand-emerald-soft)',
            color: 'var(--brand-emerald)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            fontSize: '0.88rem',
            marginBottom: '1.25rem',
          }}
        >
          ✓ {statusMessage}
        </div>
      )}

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
            NEIGHBOUR NOMINATIONS (FB / LOCAL)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.2rem' }}>
            {nominations.length} Submitted
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--brand-emerald)', fontWeight: 600 }}>
            1-click approve into live CW directory
          </div>
        </div>

        <div className="listing-card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            REAL APPROVED CW TRADES
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.2rem' }}>
            {approvedListings.length} Live
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--brand-emerald)', fontWeight: 600 }}>
            {showDemoListings ? `+ ${sampleListingsCount} sample preview active` : 'Sample preview hidden'}
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
            1-Click WhatsApp &amp; Email Templates
          </div>
        </div>

        <div className="listing-card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            HOMEOWNER ENQUIRIES
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.2rem' }}>
            {leads.length} Active Requests
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--brand-emerald)', fontWeight: 600 }}>
            Routed to Crewe, Nantwich &amp; Sandbach
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
          id="tab-nominations-btn"
          type="button"
          className={`btn ${activeTab === 'nominations' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveTab('nominations')}
        >
          1. Neighbour Nominations ({nominations.length})
        </button>
        <button
          id="tab-live-trades-btn"
          type="button"
          className={`btn ${activeTab === 'live-trades' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveTab('live-trades')}
        >
          2. Real CW Trades ({approvedListings.length})
        </button>
        <button
          id="tab-outreach-btn"
          type="button"
          className={`btn ${activeTab === 'outreach' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveTab('outreach')}
        >
          3. Local Outreach ({initialOutreach.length})
        </button>
        <button
          id="tab-leads-btn"
          type="button"
          className={`btn ${activeTab === 'leads' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveTab('leads')}
        >
          4. Homeowner Quote Requests ({leads.length})
        </button>
        <button
          id="tab-claims-btn"
          type="button"
          className={`btn ${activeTab === 'claims' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveTab('claims')}
        >
          5. Trade Claims &amp; Supporters ({claims.length})
        </button>
        <button
          id="tab-copypaste-btn"
          type="button"
          className={`btn ${activeTab === 'copypaste' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveTab('copypaste')}
        >
          6. Multi-City Cloner Guide
        </button>
      </div>

      {/* TAB 1: NEIGHBOUR NOMINATIONS */}
      {activeTab === 'nominations' && (
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
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Word-of-mouth trades recommended by Crewe, Nantwich &amp; Sandbach residents. Verify their local number/Facebook page and publish them live in 1 click.
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nomination ID &amp; Date</th>
                  <th>Recommended Trade &amp; Town</th>
                  <th>Phone / Facebook</th>
                  <th>Nominated By</th>
                  <th>Why Neighbours Recommend Them</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {nominations.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No community nominations submitted yet.
                    </td>
                  </tr>
                ) : (
                  nominations.map((nom) => {
                    const isApproved = nom.status === 'Approved & Live';
                    return (
                      <tr key={nom.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{nom.id}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {new Date(nom.createdAt).toLocaleDateString('en-GB')}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 800 }}>{nom.tradeName}</div>
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--text-secondary)',
                              textTransform: 'capitalize',
                            }}
                          >
                            {nom.townSlug} • {nom.categorySlug.replace('-', ' ')}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--brand-emerald)' }}>
                          {nom.phoneOrFacebook}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{nom.nominatedBy}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {nom.relationshipNote}
                          </div>
                        </td>
                        <td style={{ maxWidth: '300px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                          {nom.reason || '—'}
                        </td>
                        <td>
                          {isApproved ? (
                            <span className="badge badge-verified">✓ Approved &amp; Live</span>
                          ) : (
                            <button
                              id={`approve-nom-btn-${nom.id}`}
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => handleApproveNomination(nom)}
                              disabled={approvingId === nom.id}
                            >
                              {approvingId === nom.id ? 'Publishing...' : '✓ Approve & Publish'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: REAL CW TRADES (QUICK ADD + LIVE D1 LIST) */}
      {activeTab === 'live-trades' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <form
            onSubmit={handleQuickAddTrade}
            className="listing-card"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}
          >
            <div>
              <span className="badge badge-featured" style={{ marginBottom: '0.35rem' }}>
                + Quick Add Real CW1–CW11 Trade
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Add a Trusted Local Tradesperson Straight to Live Directory
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div className="form-field">
                <label htmlFor="quick-name" className="form-label">Business / Tradesperson Name *</label>
                <input
                  id="quick-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Wistaston Heating (Dave)"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="quick-town" className="form-label">Primary Town</label>
                <select
                  id="quick-town"
                  className="form-select"
                  value={quickTown}
                  onChange={(e) => setQuickTown(e.target.value)}
                >
                  {REGION_CONFIG.towns.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.name} ({t.postcodes.join('/')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="quick-category" className="form-label">Trade Category</label>
                <select
                  id="quick-category"
                  className="form-select"
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.shortName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="quick-contact" className="form-label">Phone or Facebook Page *</label>
                <input
                  id="quick-contact"
                  type="text"
                  className="form-input"
                  placeholder="07742... or facebook.com/..."
                  value={quickContact}
                  onChange={(e) => setQuickContact(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="quick-area" className="form-label">Village / Area</label>
                <input
                  id="quick-area"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Wistaston / Willaston"
                  value={quickArea}
                  onChange={(e) => setQuickArea(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="quick-postcode" className="form-label">Postcode Prefix</label>
                <input
                  id="quick-postcode"
                  type="text"
                  className="form-input"
                  placeholder="e.g. CW2"
                  value={quickPostcode}
                  onChange={(e) => setQuickPostcode(e.target.value)}
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="quick-summary" className="form-label">Short Local Recommendation Note</label>
              <input
                id="quick-summary"
                type="text"
                className="form-input"
                placeholder="e.g. Recommended in Crewe Community group for fast boiler repairs and fair pricing."
                value={quickSummary}
                onChange={(e) => setQuickSummary(e.target.value)}
              />
            </div>

            <div>
              <button
                id="quick-add-trade-submit-btn"
                type="submit"
                className="btn btn-primary"
                disabled={addingTrade}
              >
                {addingTrade ? 'Publishing...' : '+ Publish Real Local Trade Now'}
              </button>
            </div>
          </form>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name &amp; Profile Link</th>
                  <th>Town &amp; Category</th>
                  <th>Direct Contact</th>
                  <th>Nominated By</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {approvedListings.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No real community-approved trades added yet. Approve a nomination in Tab 1 or use Quick Add above.
                    </td>
                  </tr>
                ) : (
                  approvedListings.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 800 }}>
                          <Link href={`/pro/${item.slug}`} style={{ color: 'var(--brand-emerald)' }}>
                            {item.name}
                          </Link>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          /pro/{item.slug}
                        </div>
                      </td>
                      <td>
                        <div>{item.primaryTownName} ({item.outwardPostcode})</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {item.categoryName}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.84rem' }}>
                        {item.phone !== 'Via Facebook Page' ? item.phone : item.facebookUrl}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {item.nominatedBy || 'Steward Verified'}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handleDeleteApprovedListing(item.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: OUTREACH CAMPAIGNS */}
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
                  <th>Business &amp; Town</th>
                  <th>Trade &amp; Website Status</th>
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

      {/* TAB 4: HOMEOWNER LEADS */}
      {activeTab === 'leads' && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lead ID &amp; Date</th>
                <th>Homeowner &amp; Postcode</th>
                <th>Trade &amp; Urgency</th>
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

      {/* TAB 5: BUSINESS CLAIMS & SUPPORTERS */}
      {activeTab === 'claims' && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Business &amp; Town</th>
                <th>Contact Details</th>
                <th>Selected Plan &amp; MRR</th>
                <th>Status &amp; Notes</th>
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

      {/* TAB 6: MULTI-CITY COPY & PASTE PLAYBOOK */}
      {activeTab === 'copypaste' && (
        <div className="listing-card">
          <span className="badge badge-featured" style={{ marginBottom: '0.5rem' }}>
            Multi-City Replication Blueprint
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.6rem' }}>
            How to &ldquo;Copy &amp; Paste&rdquo; This Directory to Another UK Town Cluster in 15 Minutes
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
            Once Crewe, Nantwich &amp; Sandbach is established, you can launch your next regional cluster (e.g. <strong>Mid Cheshire: Northwich, Winsford &amp; Middlewich</strong>, <strong>East Cheshire: Macclesfield, Congleton &amp; Wilmslow</strong>, or <strong>Chester &amp; Ellesmere Port</strong>) without touching a single UI component:
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
                Step 2: Run the Seeding &amp; Outreach Scripts
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Run <code>node scripts/import-and-enrich.mjs --input google-maps.json</code> and <code>node scripts/generate-outreach-csv.mjs</code> to generate your new database and WhatsApp outreach list.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1.15rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 800, marginBottom: '0.35rem' }}>
                Step 3: Deploy on Cloudflare Workers + D1
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Push to GitHub, connect Cloudflare Workers Builds (<code>npm run deploy</code>), bind your D1 database <code>DB</code>, and set <code>ADMIN_PASSWORD</code>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
