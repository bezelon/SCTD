import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import {
  getAllListings,
  getLiveListingBySlug,
  getLiveListingsByTownAndCategory,
} from '@/lib/listings';
import { getTownBySlug } from '@/config/region';
import { getCategoryBySlug, UNIVERSAL_FILTERS } from '@/config/categories';
import QuoteModal from '@/components/QuoteModal';
import VouchButton from '@/components/VouchButton';
import ShareButton from '@/components/ShareButton';

export const dynamic = 'force-dynamic';

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
  const listing = await getLiveListingBySlug(slug);
  if (!listing) return {};

  return {
    title: `${listing.name} – ${listing.categoryName} in ${listing.primaryTownName} (${listing.outwardPostcode})`,
    description: `${listing.shortSummary} Call ${listing.phone} directly. Neighbour rating ${listing.rating}/5 from ${listing.reviewCount} local recommendations.`,
  };
}

export default async function ProProfilePage({ params }: ProProfilePageProps) {
  const { slug } = await params;
  const listing = await getLiveListingBySlug(slug);
  if (!listing) {
    notFound();
  }

  const category = getCategoryBySlug(listing.categorySlug);
  const townConfig = getTownBySlug(listing.primaryTownSlug);
  const allFilterDefs = [...(category?.filterTags || []), ...UNIVERSAL_FILTERS];

  function getFilterLabel(fid: string) {
    return allFilterDefs.find((f) => f.id === fid)?.label || fid;
  }

  const { listings: townCatListings } = await getLiveListingsByTownAndCategory(
    listing.primaryTownSlug,
    listing.categorySlug
  );
  const similarPros = townCatListings
    .filter((l) => l.id !== listing.id)
    .slice(0, 3);

  const whatsappText = encodeURIComponent(
    `Hi ${listing.name}, a neighbour recommended you on South Cheshire Locals (${listing.primaryTownName}) and I'd love to ask about a quote please.`
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
              CW1–CW11 Locals
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
            {listing.isSamplePreview ? (
              <span className="badge badge-neutral">Sample Preview Profile</span>
            ) : (
              <span className="badge badge-featured">✓ Neighbour-Added CW Local</span>
            )}
            {listing.isFeatured && (
              <span className="badge badge-featured">
                🏡 Local Community Supporter • {listing.primaryTownName}
              </span>
            )}
            {listing.isVerifiedLocal && (
              <span className="badge badge-verified">
                ✓ Vouched {listing.outwardPostcode} Neighbour
              </span>
            )}
            <span className="badge badge-neutral">
              ★ {listing.rating.toFixed(1)} ({listing.reviewCount} neighbour notes)
            </span>
          </div>

          <h1 className="hero-title">{listing.name}</h1>
          <p className="hero-subtitle">{listing.shortSummary}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            {listing.phone && !listing.phone.toLowerCase().includes('facebook') ? (
              <a
                href={`tel:${listing.phone.replace(/\s+/g, '')}`}
                className="btn btn-primary btn-lg"
                id="pro-profile-call-btn"
              >
                📞 Call Direct: {listing.phone}
              </a>
            ) : listing.facebookUrl ? (
              <a
                href={listing.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
                id="pro-profile-fb-btn"
              >
                👍 Message via Facebook Page
              </a>
            ) : null}
            {listing.whatsappNumber && (
              <a
                href={`https://wa.me/${listing.whatsappNumber}?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-lg"
                id="pro-profile-whatsapp-btn"
              >
                💬 Message on WhatsApp
              </a>
            )}
            <QuoteModal
              defaultTownSlug={listing.primaryTownSlug}
              defaultCategorySlug={listing.categorySlug}
              buttonLabel="Ask for Written Quote"
              buttonClassName="btn btn-outline btn-lg"
              triggerId="pro-profile-quote-btn"
            />
            <VouchButton
              slug={listing.slug}
              businessName={listing.name}
              baseVouchCount={listing.reviewCount}
            />
            <ShareButton
              path={`/pro/${listing.slug}`}
              label={listing.name}
              townName={listing.primaryTownName}
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
            {/* Left Column: Details, Filters & Neighbour Note */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="listing-card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.85rem' }}>
                  Credentials &amp; Neighbour Filters
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
                      HONEST PRICING GUIDE
                    </div>
                    <div style={{ fontWeight: 700 }}>{listing.priceGuide}</div>
                  </div>
                </div>
              </div>

              <div className="listing-card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.85rem' }}>
                  How They Help in {listing.primaryTownName} ({listing.outwardPostcode})
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
                  Local Neighbour Endorsement
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

            {/* Right Column: Contact Card + Local Town Context */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="listing-card">
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                  Direct Local Contact (0% Middleman Fee)
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
                        Visit Website ↗
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                        Word-of-mouth &amp; Facebook local trade
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
                    💬 Message on WhatsApp
                  </a>
                </div>
              </div>

              {townConfig && (
                <div className="town-card">
                  <div className="town-card-media" style={{ height: '145px' }}>
                    <Image
                      src={townConfig.imageUrl}
                      alt={townConfig.imageAlt}
                      width={600}
                      height={360}
                      className="town-card-photo"
                    />
                    <span className="town-card-photo-label">📍 {townConfig.imageCaption}</span>
                  </div>
                  <div className="town-card-body" style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      Serving households across <strong>{townConfig.name}</strong> and nearby villages ({townConfig.nearbyVillages.slice(0, 4).join(', ')}).
                    </div>
                  </div>
                </div>
              )}

              {/* Calm, discreet owner details update card (no £29/mo pitch) */}
              <div
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.2rem',
                }}
              >
                <div style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Is {listing.name} your family trade?
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
                  Basic community listings are always £0. Let us know if you need to update your phone number, hours, or areas covered.
                </p>
                <Link
                  href={`/for-businesses?claim=${listing.slug}&businessName=${encodeURIComponent(listing.name)}&town=${listing.primaryTownSlug}&category=${listing.categorySlug}#claim-form`}
                  className="btn btn-outline btn-sm"
                  id="pro-profile-claim-btn"
                >
                  Update or Verify Details →
                </Link>
              </div>
            </div>
          </div>

          {/* Similar Local Pros */}
          {similarPros.length > 0 && (
            <div style={{ marginTop: '3rem' }}>
              <h2 className="section-title" style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>
                Other Local {listing.categoryName} in {listing.primaryTownName}
              </h2>
              <div className="towns-grid">
                {similarPros.map((sim) => (
                  <div key={sim.id} className="listing-card">
                    <div>
                      <span className="badge badge-verified" style={{ marginBottom: '0.4rem' }}>
                        ★ {sim.rating} ({sim.reviewCount} neighbour notes)
                      </span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                        <Link href={`/pro/${sim.slug}`}>{sim.name}</Link>
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0.9rem' }}>
                        {sim.areaLabel} ({sim.outwardPostcode}) • {sim.priceGuide}
                      </p>
                    </div>
                    <Link href={`/pro/${sim.slug}`} className="btn btn-outline btn-sm">
                      View Profile &amp; Phone →
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
