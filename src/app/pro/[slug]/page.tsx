import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getAllListings,
  getListingBySlug,
  getListingsByTownAndCategory,
} from '@/lib/listings';
import { getCategoryBySlug, UNIVERSAL_FILTERS } from '@/config/categories';
import QuoteModal from '@/components/QuoteModal';

interface ProProfilePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllListings().map((l) => ({
    slug: l.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = getListingBySlug(slug);
  if (!listing) return {};

  return {
    title: `${listing.name} – ${listing.categoryName} in ${listing.primaryTownName} (${listing.outwardPostcode})`,
    description: `${listing.shortSummary} Call ${listing.phone} or request a free quote online. Rated ${listing.rating}/5 from ${listing.reviewCount} local reviews.`,
  };
}

export default async function ProProfilePage({ params }: ProProfilePageProps) {
  const { slug } = await params;
  const listing = getListingBySlug(slug);
  if (!listing) {
    notFound();
  }

  const category = getCategoryBySlug(listing.categorySlug);
  const allFilterDefs = [...(category?.filterTags || []), ...UNIVERSAL_FILTERS];

  function getFilterLabel(fid: string) {
    return allFilterDefs.find((f) => f.id === fid)?.label || fid;
  }

  const similarPros = getListingsByTownAndCategory(
    listing.primaryTownSlug,
    listing.categorySlug
  )
    .filter((l) => l.id !== listing.id)
    .slice(0, 3);

  const whatsappText = encodeURIComponent(
    `Hi ${listing.name}, I saw your profile on South Cheshire Trades (${listing.primaryTownName}) and would like a quote please.`
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: listing.name,
    telephone: listing.phone,
    email: listing.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.addressLine,
      addressLocality: listing.primaryTownName,
      postalCode: listing.postcode,
      addressCountry: 'GB',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: listing.rating,
      reviewCount: listing.reviewCount,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="hero-section">
        <div className="container">
          <div className="hero-eyebrow">
            <Link href="/" style={{ textDecoration: 'underline' }}>
              South Cheshire
            </Link>{' '}
            /{' '}
            <Link
              href={`/${listing.primaryTownSlug}`}
              style={{ textDecoration: 'underline' }}
            >
              {listing.primaryTownName}
            </Link>{' '}
            /{' '}
            <Link
              href={`/${listing.primaryTownSlug}/${listing.categorySlug}`}
              style={{ textDecoration: 'underline' }}
            >
              {listing.categoryName}
            </Link>
          </div>

          <div className="badge-row" style={{ marginBottom: '0.75rem' }}>
            {listing.isFeatured && (
              <span className="badge badge-featured">
                ★ TOP {listing.featuredRank || 3} Featured Pro in {listing.primaryTownName}
              </span>
            )}
            {listing.isVerifiedLocal && (
              <span className="badge badge-verified">
                ✓ Verified South Cheshire Pro
              </span>
            )}
            <span className="badge badge-amber">
              ★ {listing.rating.toFixed(1)} ({listing.reviewCount} Local Reviews)
            </span>
          </div>

          <h1 className="hero-title">{listing.name}</h1>
          <p className="hero-subtitle">{listing.shortSummary}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <a
              href={`tel:${listing.phone.replace(/\s+/g, '')}`}
              className="btn btn-primary btn-lg"
              id="pro-profile-call-btn"
            >
              📞 Call Direct: {listing.phone}
            </a>
            <a
              href={`https://wa.me/${listing.whatsappNumber}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost-dark btn-lg"
              id="pro-profile-whatsapp-btn"
            >
              💬 Message on WhatsApp
            </a>
            <QuoteModal
              defaultTownSlug={listing.primaryTownSlug}
              defaultCategorySlug={listing.categorySlug}
              buttonLabel="Request Written Quote"
              buttonClassName="btn btn-ghost-dark btn-lg"
              triggerId="pro-profile-quote-btn"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              alignItems: 'start',
            }}
          >
            {/* Left Column: Details, Filters & Reviews */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="listing-card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.85rem' }}>
                  Verified Credentials & Service Filters
                </h2>
                <div className="listing-filter-pills">
                  {listing.filterIds.map((fid) => (
                    <span key={fid} className="badge badge-verified">
                      ✓ {getFilterLabel(fid)}
                    </span>
                  ))}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                    marginTop: '1.25rem',
                    paddingTop: '1.25rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.9rem',
                  }}
                >
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700 }}>
                      ACCREDITATION / STATUS
                    </div>
                    <div style={{ fontWeight: 700 }}>{listing.accreditation}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700 }}>
                      OPENING / CALLOUT HOURS
                    </div>
                    <div style={{ fontWeight: 700 }}>{listing.openingHours}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700 }}>
                      LOCAL EXPERIENCE
                    </div>
                    <div style={{ fontWeight: 700 }}>{listing.yearsInBusiness} Years in South Cheshire</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700 }}>
                      TYPICAL PRICING GUIDE
                    </div>
                    <div style={{ fontWeight: 700 }}>{listing.priceGuide}</div>
                  </div>
                </div>
              </div>

              <div className="listing-card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.85rem' }}>
                  Services Offered in {listing.primaryTownName} ({listing.outwardPostcode})
                </h2>
                <ul
                  style={{
                    listStyle: 'none',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '0.65rem',
                  }}
                >
                  {listing.services.map((srv) => (
                    <li
                      key={srv}
                      style={{
                        padding: '0.65rem 0.85rem',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                      }}
                    >
                      ✓ {srv}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="listing-card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.85rem' }}>
                  Featured Local Homeowner Review
                </h2>
                <div className="listing-review-box" style={{ margin: 0 }}>
                  <p style={{ fontSize: '0.96rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                    “{listing.featuredReview.text}”
                  </p>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    — {listing.featuredReview.author} •{' '}
                    <span style={{ color: 'var(--brand-emerald)' }}>
                      {listing.featuredReview.dateLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Card + Self-Serve Claim Trigger */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="listing-card">
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                  Direct Local Contact Details
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
                  <div>
                    <strong>Base Location:</strong> {listing.addressLine}, {listing.postcode}
                  </div>
                  <div>
                    <strong>Areas Covered:</strong>{' '}
                    {listing.townsServed
                      .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
                      .join(', ')}{' '}
                    ({listing.areaLabel})
                  </div>
                  <div>
                    <strong>Direct Phone:</strong>{' '}
                    <a
                      href={`tel:${listing.phone.replace(/\s+/g, '')}`}
                      style={{ color: 'var(--brand-emerald)', fontWeight: 700 }}
                    >
                      {listing.phone}
                    </a>
                  </div>
                  <div>
                    <strong>Online Presence:</strong>{' '}
                    {listing.websiteUrl ? (
                      <a
                        href={listing.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--brand-emerald)', textDecoration: 'underline' }}
                      >
                        Visit Official Website ↗
                      </a>
                    ) : (
                      <span style={{ color: 'var(--accent-amber-text)', fontWeight: 600 }}>
                        Facebook / Local Directory Profile Only
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <a
                    href={`tel:${listing.phone.replace(/\s+/g, '')}`}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    📞 Call {listing.phone}
                  </a>
                  <a
                    href={`https://wa.me/${listing.whatsappNumber}?text=${whatsappText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ width: '100%' }}
                  >
                    💬 Send WhatsApp Message
                  </a>
                </div>
              </div>

              {/* Phase 1 Self-Serve Claim Box */}
              <div
                style={{
                  backgroundColor: 'var(--accent-amber-soft)',
                  border: '1px solid var(--accent-amber)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.35rem',
                }}
              >
                <span className="badge badge-amber" style={{ marginBottom: '0.45rem' }}>
                  {listing.isClaimed ? 'Verified Owner Profile' : 'Unclaimed Business Profile'}
                </span>
                <h3 style={{ fontSize: '1.08rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                  Are you the owner of {listing.name}?
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.9rem' }}>
                  {listing.noWebsiteOpportunity
                    ? 'We noticed you primarily use Facebook rather than a dedicated website. Upgrade this profile into your full Digital Shopfront + lock in a Top 3 Featured spot in ' +
                      listing.primaryTownName +
                      ' for £29–£59/mo.'
                    : 'Claim this profile to update your services, add photos, or lock in a Top 3 Featured spot in ' +
                      listing.primaryTownName +
                      ' (£29/mo).'}
                </p>
                <Link
                  href={`/for-businesses?claim=${listing.slug}&businessName=${encodeURIComponent(listing.name)}&town=${listing.primaryTownSlug}&category=${listing.categorySlug}#claim-form`}
                  className="btn btn-amber"
                  style={{ width: '100%' }}
                  id="pro-profile-claim-btn"
                >
                  Claim or Upgrade This Profile →
                </Link>
              </div>
            </div>
          </div>

          {/* Similar Local Pros */}
          {similarPros.length > 0 && (
            <div style={{ marginTop: '3rem' }}>
              <h2 className="section-title" style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>
                Other Verified {listing.categoryName} in {listing.primaryTownName}
              </h2>
              <div className="towns-grid">
                {similarPros.map((sim) => (
                  <div key={sim.id} className="town-card">
                    <div>
                      <span className="badge badge-verified" style={{ marginBottom: '0.4rem' }}>
                        ★ {sim.rating} ({sim.reviewCount} reviews)
                      </span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                        <Link href={`/pro/${sim.slug}`}>{sim.name}</Link>
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {sim.areaLabel} ({sim.outwardPostcode}) • {sim.priceGuide}
                      </p>
                    </div>
                    <Link href={`/pro/${sim.slug}`} className="btn btn-outline btn-sm">
                      View Profile & Phone →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
