'use client';

import React, { useState } from 'react';
import { REGION_CONFIG } from '@/config/region';
import { CATEGORIES } from '@/config/categories';

interface MatchedPro {
  name: string;
  phone: string;
  slug: string;
  responseTimeMinutes: number;
}

interface QuoteModalProps {
  defaultTownSlug?: string;
  defaultCategorySlug?: string;
  buttonLabel?: string;
  buttonClassName?: string;
  triggerId?: string;
}

export default function QuoteModal({
  defaultTownSlug = 'crewe',
  defaultCategorySlug = 'plumbers',
  buttonLabel = 'Ask 3 Neighbour Pros',
  buttonClassName = 'btn btn-primary',
  triggerId = 'open-quote-modal-btn',
}: QuoteModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [townSlug, setTownSlug] = useState(defaultTownSlug);
  const [categorySlug, setCategorySlug] = useState(defaultCategorySlug);
  const [urgency, setUrgency] = useState('This Week');
  const [homeownerName, setHomeownerName] = useState('');
  const [phone, setPhone] = useState('');
  const [postcode, setPostcode] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [matchedPros, setMatchedPros] = useState<MatchedPro[] | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeownerName,
          phone,
          postcode,
          townSlug,
          categorySlug,
          urgency,
          jobDescription,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        matchedPros?: Array<{
          name: string;
          phone: string;
          slug: string;
          responseTimeMinutes: number;
        }>;
      };
      if (!res.ok) {
        setErrorMsg(data.error || 'Please check your details and try again.');
      } else {
        setMatchedPros(data.matchedPros || []);
      }
    } catch {
      setErrorMsg('Network error submitting request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function resetAndClose() {
    setIsOpen(false);
    setMatchedPros(null);
    setErrorMsg('');
  }

  return (
    <>
      <button
        id={triggerId}
        type="button"
        className={buttonClassName}
        onClick={() => setIsOpen(true)}
      >
        <span>{buttonLabel}</span>
      </button>

      {isOpen && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quote-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) resetAndClose();
          }}
        >
          <div className="modal-card">
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <span className="badge badge-verified" style={{ marginBottom: '0.4rem' }}>
                  100% Free for CW1–CW11 Households • Zero Broker Markups
                </span>
                <h2
                  id="quote-modal-title"
                  style={{ fontSize: '1.32rem', fontWeight: 800, lineHeight: 1.2 }}
                >
                  {matchedPros
                    ? 'Passed Straight to Local Trades!'
                    : 'Ask Up to 3 Local Neighbours for an Honest Quote'}
                </h2>
              </div>
              <button
                id="close-quote-modal-btn"
                type="button"
                className="btn btn-outline btn-sm"
                onClick={resetAndClose}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {matchedPros ? (
              <div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.94rem' }}>
                  Your note has been matched with independent local specialists covering{' '}
                  <strong>{postcode.toUpperCase()}</strong>. They keep 100% of the job — or you can ring them directly right now:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {matchedPros.map((pro, idx) => (
                    <div
                      key={pro.slug}
                      style={{
                        padding: '0.9rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <div>
                        <span className="badge badge-verified" style={{ marginBottom: '0.25rem' }}>
                          Local Match #{idx + 1}
                        </span>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{pro.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Usually replies in ~{pro.responseTimeMinutes} mins
                        </div>
                      </div>
                      <a
                        href={`tel:${pro.phone.replace(/\s+/g, '')}`}
                        className="btn btn-primary btn-sm"
                      >
                        Call {pro.phone}
                      </a>
                    </div>
                  ))}
                </div>

                <button
                  id="done-quote-modal-btn"
                  type="button"
                  className="btn btn-outline"
                  style={{ width: '100%' }}
                  onClick={resetAndClose}
                >
                  Done &amp; Return to Directory
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Tell us what needs sorting in <strong>Crewe, Nantwich or Sandbach</strong>. Up to 3 genuine local tradespeople will reply directly — never sold to call centres.
                </p>

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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-field">
                    <label htmlFor="quote-town" className="form-label">
                      Town / Area
                    </label>
                    <select
                      id="quote-town"
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
                    <label htmlFor="quote-category" className="form-label">
                      Trade Needed
                    </label>
                    <select
                      id="quote-category"
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-field">
                    <label htmlFor="quote-urgency" className="form-label">
                      How Urgent?
                    </label>
                    <select
                      id="quote-urgency"
                      className="form-select"
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                    >
                      <option value="Emergency Today (24/7)">Emergency Today (24/7)</option>
                      <option value="Within 48 Hours">Within 48 Hours</option>
                      <option value="This Week">This Week</option>
                      <option value="Flexible / Gathering Quotes">Flexible / Gathering Quotes</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="quote-postcode" className="form-label">
                      Your Postcode (CW)
                    </label>
                    <input
                      id="quote-postcode"
                      type="text"
                      className="form-input"
                      placeholder="e.g. CW2 8RS or CW5 5JH"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-field">
                    <label htmlFor="quote-name" className="form-label">
                      Your Name
                    </label>
                    <input
                      id="quote-name"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Sarah Jenkins"
                      value={homeownerName}
                      onChange={(e) => setHomeownerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="quote-phone" className="form-label">
                      Mobile / Phone Number
                    </label>
                    <input
                      id="quote-phone"
                      type="tel"
                      className="form-input"
                      placeholder="e.g. 07700 900123"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="quote-desc" className="form-label">
                    Brief Job Description
                  </label>
                  <textarea
                    id="quote-desc"
                    rows={3}
                    className="form-textarea"
                    placeholder="Describe the job briefly (e.g. Worcester boiler service in Wistaston, or 4 fence panels replaced in Nantwich)..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    required
                  />
                </div>

                <button
                  id="submit-quote-request-btn"
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={submitting}
                  style={{ width: '100%', marginTop: '0.25rem' }}
                >
                  {submitting ? 'Matching CW Neighbours...' : 'Send to Up to 3 Local Trades →'}
                </button>

                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  We never take commission from local tradespeople. Your details stay inside South Cheshire.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
