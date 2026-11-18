import React from 'react';
import Link from 'next/link';
import { TradeListing } from '@/lib/listings';
import { UNIVERSAL_FILTERS, getCategoryBySlug } from '@/config/categories';
import VouchButton from '@/components/VouchButton';
import ShareButton from '@/components/ShareButton';

interface ListingCardProps {
  listing: TradeListing;
  currentTownName?: string;
}

function getInitials(name: string): string {
  const words = name
    .replace(/&/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0 && !w.startsWith('('));
  if (words.length === 0) return 'CW';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
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
    `Hi ${listing.name}, a neighbour recommended you on South Cheshire Locals (${listing.primaryTownName}) — could I ask about a quote please?`
  );

  const initials = getInitials(listing.name);

  return (
    <article
      className={`listing-card ${listing.isFeatured ? 'featured' : ''}`}
      id={`listing-card-${listing.slug}`}
    >
      <div className="listing-top-row">
        <div>
          <div className="badge-row">
            {listing.isSamplePreview ? (
              <span className="badge badge-neutral" title="Sample preview entry while real CW nominations are added">
                Sample Preview
              </span>
            ) : (
              <span className="badge badge-featured">
                ✓ Neighbour-Added CW Local
              </span>
            )}
            {listing.isFeatured && (
              <span className="badge badge-featured">
                🏡 Local Community Supporter • {currentTownName || listing.primaryTownName}
              </span>
            )}
            {listing.isVerifiedLocal && (
              <span className="badge badge-verified">
                ✓ Vouched {listing.outwardPostcode} Neighbour
              </span>
            )}
            <span className="badge badge-neutral">{listing.accreditation}</span>
            {listing.filterIds.includes('emergency-24-7') && (
              <span className="badge badge-urgent">24/7 Local Callout</span>
            )}
          </div>

          <div className="pro-identity-row">
            <div className="pro-avatar" aria-hidden="true">
              {initials}
            </div>
            <div>
              <h3>
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
                • <strong>{listing.yearsInBusiness} yrs</strong> local experience
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
          <div className="rating-pill">
            <span style={{ color: 'var(--accent-amber)' }}>★</span>
            <span>{listing.rating.toFixed(1)}</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.8rem' }}>
              ({listing.reviewCount} neighbour notes)
            </span>
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Typically replies in ~{listing.responseTimeMinutes} mins
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
        <strong style={{ color: 'var(--text-primary)' }}>How they help:</strong>
        {listing.services.map((srv, idx) => (
          <span key={srv}>
            {srv}
            {idx < listing.services.length - 1 ? ' •' : ''}
          </span>
        ))}
      </div>

      {/* Neighbour Endorsement Quote */}
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
            Honest Local Guide:
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {listing.priceGuide}
          </div>
        </div>

        <div className="listing-actions">
          <VouchButton
            slug={listing.slug}
            businessName={listing.name}
            baseVouchCount={listing.reviewCount}
            compact
          />
          <ShareButton
            path={`/pro/${listing.slug}`}
            label={listing.name}
            townName={listing.primaryTownName}
          />
          {listing.phone && !listing.phone.toLowerCase().includes('facebook') ? (
            <a
              href={`tel:${listing.phone.replace(/\s+/g, '')}`}
              className="btn btn-primary btn-sm"
              id={`call-btn-${listing.slug}`}
            >
              📞 Call {listing.phone}
            </a>
          ) : listing.facebookUrl ? (
            <a
              href={listing.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
              id={`fb-btn-${listing.slug}`}
            >
              👍 Facebook Page
            </a>
          ) : null}
          {listing.whatsappNumber && (
            <a
              href={`https://wa.me/${listing.whatsappNumber}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              id={`whatsapp-btn-${listing.slug}`}
            >
              💬 WhatsApp
            </a>
          )}
          <Link
            href={`/pro/${listing.slug}`}
            className="btn btn-outline btn-sm"
            id={`profile-btn-${listing.slug}`}
          >
            Full Profile →
          </Link>
        </div>
      </div>
    </article>
  );
}
