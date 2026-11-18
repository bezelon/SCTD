'use client';

import React, { useState } from 'react';
import { REGION_CONFIG } from '@/config/region';
import { CATEGORIES } from '@/config/categories';

interface NominateModalProps {
  defaultTownSlug?: string;
  defaultCategorySlug?: string;
  buttonLabel?: string;
  buttonClassName?: string;
  triggerId?: string;
}

export default function NominateModal({
  defaultTownSlug = 'crewe',
  defaultCategorySlug = 'plumbers',
  buttonLabel = '+ Nominate a Local Trade',
  buttonClassName = 'btn btn-outline btn-sm',
  triggerId = 'open-nominate-modal-btn',
}: NominateModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tradeName, setTradeName] = useState('');
  const [townSlug, setTownSlug] = useState(defaultTownSlug);
  const [categorySlug, setCategorySlug] = useState(defaultCategorySlug);
  const [phoneOrFacebook, setPhoneOrFacebook] = useState('');
  const [nominatedBy, setNominatedBy] = useState('');
  const [relationshipNote, setRelationshipNote] = useState('Used their work & happy to recommend');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/nominations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradeName,
          townSlug,
          categorySlug,
          phoneOrFacebook,
          nominatedBy,
          relationshipNote,
          reason,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        nomination?: { tradeName?: string };
      };
      if (!res.ok) {
        setErrorMsg(data.error || 'Please fill in the required fields.');
      } else {
        setSubmittedName(data.nomination?.tradeName || tradeName);
      }
    } catch {
      setErrorMsg('Network error submitting recommendation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function resetAndClose() {
    setIsOpen(false);
    setSubmittedName(null);
    setErrorMsg('');
    setCopiedInvite(false);
  }

  function copyCommunityShare() {
    const shareMsg = `I just added ${submittedName} to South Cheshire Locals (CW1–CW11) so neighbours in Crewe, Nantwich & Sandbach can find real local trades without searching Google or national lead sites. Add someone good you know here: ${window.location.origin}`;
    navigator.clipboard.writeText(shareMsg);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 3000);
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
          aria-labelledby="nominate-modal-title"
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
                  Always £0 • CW1–CW11 Community Black Book
                </span>
                <h2
                  id="nominate-modal-title"
                  style={{ fontSize: '1.32rem', fontWeight: 800, lineHeight: 1.2 }}
                >
                  {submittedName
                    ? 'Thank You for Backing Local!'
                    : 'Nominate a Mate, Relative or Local Trade'}
                </h2>
              </div>
              <button
                id="close-nominate-modal-btn"
                type="button"
                className="btn btn-outline btn-sm"
                onClick={resetAndClose}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {submittedName ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    backgroundColor: 'var(--brand-emerald-soft)',
                    color: 'var(--brand-emerald-text)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.92rem',
                  }}
                >
                  <strong>{submittedName}</strong> has been added to our CW1–CW11 community review queue.
                  Once checked, neighbours in South Cheshire will be able to call or WhatsApp them directly — no middleman fees ever.
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Want to help keep pounds in Crewe, Nantwich &amp; Sandbach? Share this directory with neighbours on Facebook or WhatsApp so more local family trades get found.
                </p>

                <button
                  type="button"
                  className="btn btn-amber"
                  onClick={copyCommunityShare}
                >
                  {copiedInvite
                    ? '✓ Copied Message for Facebook / WhatsApp!'
                    : '📋 Copy Ready Post for Crewe / Nantwich FB Group'}
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={resetAndClose}
                >
                  Done &amp; Return to Directory
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
              >
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Know a reliable plumber, sparky, roofer or handyman in <strong>Crewe, Nantwich or Sandbach</strong>? Even if they only have a mobile number or Facebook page, add them in 30 seconds so neighbours never have to rely on Google or national call centres.
                </p>

                {errorMsg && (
                  <div
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--urgent-crimson-soft)',
                      color: 'var(--urgent-crimson)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    {errorMsg}
                  </div>
                )}

                <div className="form-field">
                  <label htmlFor="nominate-trade-name" className="form-label">
                    Tradesperson or Local Firm Name
                  </label>
                  <input
                    id="nominate-trade-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mick Turner Roofing or Dave from Wistaston"
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-field">
                    <label htmlFor="nominate-town" className="form-label">
                      Based In
                    </label>
                    <select
                      id="nominate-town"
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
                    <label htmlFor="nominate-category" className="form-label">
                      Trade / Skill
                    </label>
                    <select
                      id="nominate-category"
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
                  <label htmlFor="nominate-contact" className="form-label">
                    Phone Number or Facebook Page Link
                  </label>
                  <input
                    id="nominate-contact"
                    type="text"
                    className="form-input"
                    placeholder="e.g. 07700 900456 or facebook.com/theirpage"
                    value={phoneOrFacebook}
                    onChange={(e) => setPhoneOrFacebook(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-field">
                    <label htmlFor="nominate-by" className="form-label">
                      Your Name &amp; Village/Area
                    </label>
                    <input
                      id="nominate-by"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Sarah in Shavington"
                      value={nominatedBy}
                      onChange={(e) => setNominatedBy(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="nominate-relation" className="form-label">
                      How Do You Know Them?
                    </label>
                    <select
                      id="nominate-relation"
                      className="form-select"
                      value={relationshipNote}
                      onChange={(e) => setRelationshipNote(e.target.value)}
                    >
                      <option value="Used their work & happy to recommend">
                        Used their work &amp; happy to recommend
                      </option>
                      <option value="Family member / relative">Family member / relative</option>
                      <option value="Friend / mate in the trade">Friend / mate in the trade</option>
                      <option value="This is my own local business">This is my own local business</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="nominate-reason" className="form-label">
                    Why Should Neighbours Call Them? (Optional)
                  </label>
                  <textarea
                    id="nominate-reason"
                    rows={2}
                    className="form-textarea"
                    placeholder="e.g. Sorted our leak same afternoon, fair price, lives right near Queens Park..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <button
                  id="submit-nomination-btn"
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={submitting}
                  style={{ width: '100%' }}
                >
                  {submitting
                    ? 'Adding to Community List...'
                    : 'Add Local Trade to CW1–CW11 Directory →'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
