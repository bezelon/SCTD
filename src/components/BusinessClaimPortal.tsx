'use client';

import React, { useState } from 'react';
import { REGION_CONFIG } from '@/config/region';
import { CATEGORIES } from '@/config/categories';

export default function BusinessClaimPortal() {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'featured' | 'shopfront'>('featured');
  const [townSlug, setTownSlug] = useState('crewe');
  const [categorySlug, setCategorySlug] = useState('plumbers');
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // ROI Calculator state
  const [avgJobProfit, setAvgJobProfit] = useState(280);
  const [extraJobsPerMonth, setExtraJobsPerMonth] = useState(3);

  const [submitting, setSubmitting] = useState(false);
  const [submittedClaim, setSubmittedClaim] = useState<{
    id: string;
    businessName: string;
    selectedPlan: string;
    monthlyValueGbp: number;
    status: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const monthlyRevenueEstimate = avgJobProfit * extraJobsPerMonth;
  const planCost = selectedPlan === 'shopfront' ? 59 : selectedPlan === 'featured' ? 29 : 0;
  const netMonthlyGain = monthlyRevenueEstimate - planCost;

  async function handleClaimSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          contactName,
          phone,
          email,
          townSlug,
          categorySlug,
          selectedPlan,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Please check all fields and try again.');
      } else {
        setSubmittedClaim(data.claim);
      }
    } catch {
      setErrorMsg('Network error submitting claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Pricing Tiers Section */}
      <section className="section" id="pricing">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                Simple, High-ROI Plans for South Cheshire Trades
              </h2>
              <p className="section-subtitle">
                We strictly cap Featured TOP 3 spots at <strong>3 businesses per trade in each town</strong> (Crewe, Nantwich & Sandbach) so you never get buried under 50 competitors.
              </p>
            </div>
          </div>

          <div className="pricing-grid">
            {REGION_CONFIG.pricingTiers.map((tier) => {
              const isSelected = selectedPlan === tier.id;
              return (
                <div
                  key={tier.id}
                  className={`pricing-card ${tier.popular ? 'popular' : ''}`}
                  id={`pricing-tier-${tier.id}`}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.65rem',
                      }}
                    >
                      <span
                        className={`badge ${
                          tier.popular ? 'badge-featured' : 'badge-neutral'
                        }`}
                      >
                        {tier.badgeText}
                      </span>
                      {isSelected && (
                        <span className="badge badge-verified">Selected Plan</span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                      {tier.name}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.65rem' }}>
                      <span style={{ fontSize: '2.25rem', fontWeight: 800 }}>
                        £{tier.priceMonthlyGbp}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        / month (no contract)
                      </span>
                    </div>

                    {tier.scarcityNote && (
                      <div
                        style={{
                          backgroundColor: 'var(--accent-amber-soft)',
                          color: 'var(--accent-amber-text)',
                          padding: '0.45rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          marginBottom: '0.85rem',
                        }}
                      >
                        ⚡ {tier.scarcityNote}
                      </div>
                    )}

                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      {tier.description}
                    </p>

                    <ul
                      style={{
                        listStyle: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        fontSize: '0.88rem',
                      }}
                    >
                      {tier.features.map((feat) => (
                        <li key={feat}>✓ {feat}</li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href="#claim-form"
                    onClick={() => setSelectedPlan(tier.id)}
                    className={`btn ${
                      tier.popular ? 'btn-primary' : 'btn-outline'
                    }`}
                    style={{ width: '100%' }}
                    id={`select-plan-btn-${tier.id}`}
                  >
                    {tier.ctaText}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator + Self-Serve Claim Form */}
      <section className="section section-alt" id="claim-form">
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              alignItems: 'start',
            }}
          >
            {/* Left: Interactive Trade ROI Calculator */}
            <div className="listing-card">
              <span className="badge badge-verified" style={{ marginBottom: '0.5rem' }}>
                Trade ROI Calculator (Crewe • Nantwich • Sandbach)
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                See How Fast 1 Local Job Pays for Your Listing
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Unlike national lead sites that charge £25–£45 per shared lead even when you don&apos;t win the job, we charge a flat monthly fee with <strong>0% commission</strong>.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-field">
                  <label htmlFor="roi-job-value" className="form-label">
                    Your Average Profit Per Local Job: £{avgJobProfit}
                  </label>
                  <input
                    id="roi-job-value"
                    type="range"
                    min={80}
                    max={1000}
                    step={20}
                    value={avgJobProfit}
                    onChange={(e) => setAvgJobProfit(Number(e.target.value))}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="roi-jobs-count" className="form-label">
                    Estimated Extra Jobs Won Per Month: {extraJobsPerMonth} jobs
                  </label>
                  <input
                    id="roi-jobs-count"
                    type="range"
                    min={1}
                    max={12}
                    step={1}
                    value={extraJobsPerMonth}
                    onChange={(e) => setExtraJobsPerMonth(Number(e.target.value))}
                  />
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--bg-navy)',
                    color: '#fff',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    marginTop: '0.5rem',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-on-dark-muted)' }}>
                    Estimated Monthly Net Return (after £{planCost}/mo plan):
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'hsl(154, 65%, 72%)' }}>
                    +£{netMonthlyGain.toLocaleString('en-GB')} / month
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-on-dark-muted)', marginTop: '0.25rem' }}>
                    Just <strong>1 job</strong> (£{avgJobProfit}) covers{' '}
                    <strong>
                      {planCost > 0 ? Math.max(1, Math.round(avgJobProfit / planCost)) : 12} months
                    </strong>{' '}
                    of your membership.
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Self-Serve Claim & Upgrade Form */}
            <div className="listing-card">
              {submittedClaim ? (
                <div>
                  <span className="badge badge-featured" style={{ marginBottom: '0.6rem' }}>
                    ✓ Claim Registered ({submittedClaim.id})
                  </span>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    Welcome Aboard, {submittedClaim.businessName}!
                  </h2>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Your request for the <strong>{submittedClaim.selectedPlan.toUpperCase()}</strong> plan ({submittedClaim.status}) has been logged for{' '}
                    <strong>{townSlug.toUpperCase()}</strong>.
                  </p>
                  <div
                    style={{
                      backgroundColor: 'var(--bg-subtle)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.88rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <strong>What happens next:</strong>
                    <ol style={{ paddingLeft: '1.2rem', marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <li>We verify your 01270 / mobile number and accreditation badge.</li>
                      <li>
                        {submittedClaim.monthlyValueGbp > 0
                          ? `Complete your £${submittedClaim.monthlyValueGbp}/mo subscription via our secure Stripe checkout link sent to ${email}.`
                          : 'Your free Basic listing is now marked as Claimed.'}
                      </li>
                      <li>Your profile goes live in the Top 3 Featured box immediately upon activation.</li>
                    </ol>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setSubmittedClaim(null)}
                  >
                    Submit Another Business
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleClaimSubmit}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}
                >
                  <div>
                    <span className="badge badge-amber" style={{ marginBottom: '0.35rem' }}>
                      60-Second Self-Serve Verification
                    </span>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                      Claim Your Profile or Lock In a Top 3 Spot
                    </h2>
                  </div>

                  {errorMsg && (
                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--urgent-crimson-soft)',
                        color: 'var(--urgent-crimson)',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                      }}
                    >
                      {errorMsg}
                    </div>
                  )}

                  <div className="form-field">
                    <label htmlFor="claim-plan" className="form-label">
                      Select Membership Tier
                    </label>
                    <select
                      id="claim-plan"
                      className="form-select"
                      value={selectedPlan}
                      onChange={(e) =>
                        setSelectedPlan(
                          e.target.value as 'basic' | 'featured' | 'shopfront'
                        )
                      }
                    >
                      <option value="featured">
                        ★ Verified TOP 3 Pro – £29/month (Max 3 Per Town)
                      </option>
                      <option value="shopfront">
                        🚀 Digital Shopfront + Priority Homeowner Leads – £59/month
                      </option>
                      <option value="basic">
                        Basic Unfeatured Profile Claim – £0/month
                      </option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-field">
                      <label htmlFor="claim-town" className="form-label">
                        Primary Town
                      </label>
                      <select
                        id="claim-town"
                        className="form-select"
                        value={townSlug}
                        onChange={(e) => setTownSlug(e.target.value)}
                      >
                        {REGION_CONFIG.towns.map((t) => (
                          <option key={t.slug} value={t.slug}>
                            {t.name} ({t.postcodes.join('/')})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label htmlFor="claim-category" className="form-label">
                        Trade Category
                      </label>
                      <select
                        id="claim-category"
                        className="form-select"
                        value={categorySlug}
                        onChange={(e) => setCategorySlug(e.target.value)}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.shortName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="claim-business-name" className="form-label">
                      Business Trading Name
                    </label>
                    <input
                      id="claim-business-name"
                      type="text"
                      className="form-input"
                      placeholder="e.g. CW Emergency Plumbers (Crewe)"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-field">
                      <label htmlFor="claim-contact-name" className="form-label">
                        Your Name
                      </label>
                      <input
                        id="claim-contact-name"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Dave Hockenhull"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="claim-phone" className="form-label">
                        Direct Phone / WhatsApp
                      </label>
                      <input
                        id="claim-phone"
                        type="tel"
                        className="form-input"
                        placeholder="e.g. 07731 445890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="claim-email" className="form-label">
                      Email Address (For Verification & Lead Alerts)
                    </label>
                    <input
                      id="claim-email"
                      type="email"
                      className="form-input"
                      placeholder="e.g. info@yourtradebusiness.co.uk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="claim-notes" className="form-label">
                      Accreditations & Filter Tags to Enable (Optional)
                    </label>
                    <textarea
                      id="claim-notes"
                      rows={2}
                      className="form-textarea"
                      placeholder="e.g. Gas Safe #58412, 24/7 Emergency Callout, No Call-Out Fee, Facebook page link..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <button
                    id="submit-claim-btn"
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={submitting}
                  >
                    {submitting
                      ? 'Submitting Claim...'
                      : selectedPlan === 'basic'
                      ? 'Claim Free Basic Profile →'
                      : `Lock In ${selectedPlan === 'shopfront' ? 'Shopfront (£59/mo)' : 'Top 3 Spot (£29/mo)'} →`}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
