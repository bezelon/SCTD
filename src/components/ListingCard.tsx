import React from 'react';
import Link from 'next/link';
import { TradeListing } from '@/lib/listings';
import { UNIVERSAL_FILTERS, getCategoryBySlug } from '@/config/categories';

interface ListingCardProps {
  listing: TradeListing;
  currentTownName?: string;
}

export default function ListingCard({ listing, currentTownName }: ListingCardProps) {
  const categoryConfig = getCategoryBySlug(listing.categorySlug);
  const allPossibleFilters = [
    ...(categoryConfig?.filterTags || []),
    ...UNIVERSAL_FILTERS,
  ];

  function getFilterLabel(filterId: string): string {
    const found = allPossibleFilters.find((f) => f.id === filterId);
    return found ? found.label : filterId;
  }

  const whatsappText = encodeURIComponent(
    `Hi ${listing.name}, I found your profile on South Cheshire Trades (${listing.primaryTownName}) and would like a quote please.`
  );

  return (
    <article
      className={`listing-card ${listing.isFeatured ? 'featured' : ''}`}
      id={`listing-card-${listing.slug}`}
    >
      <div className="listing-top-row">
        <div>
          <div className="badge-row">
            {listing.isFeatured && (
              <span className="badge badge-featured">
                ★ TOP {listing.featuredRank || 3} Featured Pro in{' '}
                {currentTownName || listing.primaryTownName}
              </span>
            )}
            {listing.isVerifiedLocal && (
              <span className="badge badge-verified">
                ✓ Verified South Cheshire Pro
              </span>
            )}
            <span className="badge badge-neutral">{listing.accreditation}</span>
            {listing.filterIds.includes('emergency-24-7') && (
              <span className="badge badge-urgent">⚡ 24/7 Emergency Callout</span>
            )}
          </div>

          <h3 style={{ marginTop: '0.2rem' }}>
            <Link href={`/pro/${listing.slug}`} className="listing-title">
              {listing.name}
            </Link>
          </h3>

          <div className="listing-meta">
            <strong>Based in:</strong> {listing.areaLabel} ({listing.outwardPostcode}) •{' '}
            <strong>Covers:</strong>{' '}
            {listing.townsServed
              .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
              .join(', ')}{' '}
            • <strong>{listing.yearsInBusiness} yrs</strong> local trade experience
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
          <div className="rating-pill">
            <span style={{ color: 'var(--accent-amber)' }}>★</span>
            <span>{listing.rating.toFixed(1)}</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.8rem' }}>
              ({listing.reviewCount} local reviews)
            </span>
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Avg. reply: ~{listing.responseTimeMinutes} mins
          </span>
        </div>
      </div>

      <p style={{ fontSize: '0.93rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        {listing.shortSummary}
      </p>

      {/* Filter Gap Pills */}
      <div className="listing-filter-pills">
        {listing.filterIds.map((fid) => (
          <span key={fid} className="badge badge-verified">
            ✓ {getFilterLabel(fid)}
          </span>
        ))}
      </div>

      {/* Key Services */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.45rem',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          marginBottom: '0.75rem',
        }}
      >
        <strong style={{ color: 'var(--text-primary)' }}>Specialisms:</strong>
        {listing.services.map((srv, idx) => (
          <span key={srv}>
            {srv}
            {idx < listing.services.length - 1 ? ' •' : ''}
          </span>
        ))}
      </div>

      {/* Featured Local Homeowner Review */}
      <div className="listing-review-box">
        <div style={{ fontStyle: 'italic', marginBottom: '0.25rem' }}>
          “{listing.featuredReview.text}”
        </div>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          — {listing.featuredReview.author} •{' '}
          <span style={{ color: 'var(--brand-emerald)' }}>
            {listing.featuredReview.dateLabel}
          </span>
        </div>
      </div>

      <div className="listing-footer">
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Typical Pricing Guide:
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {listing.priceGuide}
          </div>
        </div>

        <div className="listing-actions">
          <a
            href={`tel:${listing.phone.replace(/\s+/g, '')}`}
            className="btn btn-primary btn-sm"
            id={`call-btn-${listing.slug}`}
          >
            📞 Call {listing.phone}
          </a>
          <a
            href={`https://wa.me/${listing.whatsappNumber}?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
            id={`whatsapp-btn-${listing.slug}`}
          >
            💬 WhatsApp Quote
          </a>
          <Link
            href={`/pro/${listing.slug}`}
            className="btn btn-outline btn-sm"
            id={`profile-btn-${listing.slug}`}
          >
            View Full Profile →
          </Link>
        </div>
      </div>

      {!listing.isClaimed && (
        <div
          style={{
            marginTop: '0.8rem',
            paddingTop: '0.65rem',
            borderTop: '1px dashed var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            fontSize: '0.79rem',
            color: 'var(--text-muted)',
          }}
        >
          <span>
            Unclaimed Local Listing •{' '}
            {listing.noWebsiteOpportunity
              ? 'No dedicated website linked yet (Facebook only)'
              : 'Standard placement'}
          </span>
          <Link
            href={`/for-businesses?claim=${listing.slug}&town=${listing.primaryTownSlug}&category=${listing.categorySlug}#claim-form`}
            style={{ color: 'var(--brand-emerald)', fontWeight: 700 }}
          >
            Own {listing.name}? Claim or Upgrade to Top 3 (£29/mo) →
          </Link>
        </div>
      )}
    </article>
  );
}
