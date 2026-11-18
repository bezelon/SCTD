import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { REGION_CONFIG, getSiteBaseUrl } from '@/config/region';
import { CATEGORIES } from '@/config/categories';
import { getLiveDirectoryState } from '@/lib/listings';
import DirectoryExplorer from '@/components/DirectoryExplorer';
import QuoteModal from '@/components/QuoteModal';
import NominateModal from '@/components/NominateModal';
import ShareButton from '@/components/ShareButton';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { listings: allListings, showDemoListings } = await getLiveDirectoryState();
  const featuredFirst = [...allListings].sort((a, b) => {
    const aReal = a.isSamplePreview ? 0 : 1;
    const bReal = b.isSamplePreview ? 0 : 1;
    if (aReal !== bReal) return bReal - aReal;
    return Number(b.isFeatured) - Number(a.isFeatured) || b.rating - a.rating;
  });

  const totalNeighbourNotes = allListings.reduce((sum, l) => sum + l.reviewCount, 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: REGION_CONFIG.brandName,
    url: getSiteBaseUrl(),
    description: REGION_CONFIG.heroSubtitle,
    areaServed: REGION_CONFIG.towns.map((t) => ({
      '@type': 'City',
      name: t.name,
      postalCode: t.postcodes,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Warm Neighbourhood Hero Section */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div>
            <div className="hero-eyebrow">
              <span>🏡</span>
              <span>CW1–CW11 Community Black Book • Crewe, Nantwich &amp; Sandbach</span>
            </div>
            <h1 className="hero-title">{REGION_CONFIG.heroTitle}</h1>
            <p className="hero-subtitle">{REGION_CONFIG.heroSubtitle}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              <a
                href="#directory-explorer"
                className="btn btn-primary btn-lg"
                id="hero-browse-pros-btn"
              >
                Browse {allListings.length} CW Local Trades ↓
              </a>
              <NominateModal
                buttonLabel="+ Add Your Mate, Family or Local Firm"
                buttonClassName="btn btn-outline btn-lg"
                triggerId="hero-nominate-btn"
              />
              <QuoteModal
                buttonLabel="Ask 3 Neighbour Pros"
                buttonClassName="btn btn-outline btn-lg"
                triggerId="hero-get-quotes-btn"
              />
            </div>

            <div className="hero-stats-row">
              <div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {allListings.length} Locals
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Independent CW1–CW11 tradespeople
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  0% Commission
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Every penny stays with a local family
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {totalNeighbourNotes.toLocaleString('en-GB')}+ Vouched
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Real neighbour notes across South Cheshire
                </div>
              </div>
            </div>
          </div>

          {/* Local Cheshire Photo Card */}
          <div className="hero-photo-frame">
            <Image
              src={REGION_CONFIG.heroImage}
              alt={REGION_CONFIG.heroImageAlt}
              width={960}
              height={640}
              className="hero-photo-img"
              priority
            />
            <div className="hero-photo-caption">
              <span>📍 {REGION_CONFIG.heroImageCaption}</span>
              <span>CW1 • CW2 • CW5 • CW11</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Back Our Own Manifesto */}
      <section className="section section-alt" id="why-back-local">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                Why Keep It in CW1–CW11 Instead of Searching Google or AI?
              </h2>
              <p className="section-subtitle">
                Big national platforms and ad auctions squeeze honest tradespeople and send South Cheshire money out of town. Here, neighbours look after neighbours.
              </p>
            </div>
            <ShareButton
              path="/"
              label="South Cheshire Locals (CW1–CW11)"
            />
          </div>

          <div className="manifesto-grid">
            <div className="manifesto-card">
              <div className="manifesto-icon" aria-hidden="true">🤝</div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                100% Goes to a Local Household
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                When you ring an 01270 or local mobile number here, there is no middleman fee, no pay-per-lead tax, and no national call centre taking a cut.
              </p>
            </div>

            <div className="manifesto-card">
              <div className="manifesto-icon" aria-hidden="true">🛡️</div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                No Algorithm Games, Just Neighbours
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Great local trades often don&apos;t have fancy websites or SEO budgets — many just work off word of mouth and Facebook. We make sure CW locals can still find them fast.
              </p>
            </div>

            <div className="manifesto-card">
              <div className="manifesto-icon" aria-hidden="true">🏡</div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                Built Together by Our Towns
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Got a brother-in-law who&apos;s a roofer, a neighbour who sorts boilers, or a local cleaner you swear by? Add them in 30 seconds so our whole community benefits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Choose Your Town Cluster with Local Town Photography */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                Explore Your Town &amp; Surrounding Villages
              </h2>
              <p className="section-subtitle">
                Pick your part of South Cheshire to find tradespeople living around the corner from you.
              </p>
            </div>
          </div>

          <div className="towns-grid">
            {REGION_CONFIG.towns.map((town) => {
              const townListingsCount = allListings.filter(
                (l) =>
                  l.primaryTownSlug === town.slug ||
                  l.townsServed.includes(town.slug)
              ).length;

              return (
                <div key={town.slug} className="town-card" id={`town-card-${town.slug}`}>
                  <Link href={`/${town.slug}`} className="town-card-media">
                    <Image
                      src={town.imageUrl}
                      alt={town.imageAlt}
                      width={800}
                      height={500}
                      className="town-card-photo"
                    />
                    <span className="town-card-photo-label">📍 {town.imageCaption}</span>
                  </Link>

                  <div className="town-card-body">
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.65rem',
                        }}
                      >
                        <span className="postcode-badge">
                          {town.postcodes.join(' • ')}
                        </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-emerald)' }}>
                          {townListingsCount} Local Trades
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                        <Link href={`/${town.slug}`}>{town.name} Locals</Link>
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                        {town.tagline}
                      </p>

                      <div style={{ marginBottom: '0.25rem' }}>
                        <div
                          style={{
                            fontSize: '0.73rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: 'var(--text-muted)',
                            marginBottom: '0.35rem',
                          }}
                        >
                          Villages &amp; Neighbourhoods Covered:
                        </div>
                        <div className="village-pills">
                          {town.nearbyVillages.map((v) => (
                            <span key={v} className="village-pill">
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="town-quick-links" style={{ marginBottom: '0.9rem' }}>
                        {CATEGORIES.slice(0, 5).map((cat) => (
                          <Link
                            key={`${town.slug}-${cat.slug}`}
                            href={`/${town.slug}/${cat.slug}`}
                            className="town-quick-link"
                          >
                            {cat.shortName}
                          </Link>
                        ))}
                      </div>

                      <Link
                        href={`/${town.slug}`}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        id={`explore-town-btn-${town.slug}`}
                      >
                        Browse {town.name} Trades →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10 Essential Local Trade Categories (Clean, No Agency Jargon) */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                10 Essential Everyday Trades in South Cheshire
              </h2>
              <p className="section-subtitle">
                Everything neighbours ask for in Crewe, Nantwich and Sandbach community groups — with transparent filters for call-out fees, emergency hours and genuine local registrations.
              </p>
            </div>
          </div>

          <div className="categories-grid">
            {CATEGORIES.map((cat) => {
              const catCount = allListings.filter((l) => l.categorySlug === cat.slug).length;
              return (
                <div key={cat.slug} className="category-card" id={`category-card-${cat.slug}`}>
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div className="category-icon-box">
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d={cat.iconSvgPath} />
                        </svg>
                      </div>
                      <span className="badge badge-verified">
                        {catCount} CW Locals
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                      <Link href={`/crewe/${cat.slug}`}>{cat.name}</Link>
                    </h3>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.7rem' }}>
                      {cat.description}
                    </p>

                    <div
                      style={{
                        fontSize: '0.78rem',
                        backgroundColor: 'var(--bg-subtle)',
                        padding: '0.5rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <strong style={{ color: 'var(--text-primary)' }}>Popular locally:</strong>{' '}
                      {cat.commonServices.slice(0, 2).join(' • ')}
                    </div>
                  </div>

                  <div className="town-quick-links">
                    {REGION_CONFIG.towns.map((town) => (
                      <Link
                        key={`${cat.slug}-${town.slug}`}
                        href={`/${town.slug}/${cat.slug}`}
                        className="town-quick-link"
                      >
                        {town.name} →
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Filter Gap Directory Explorer */}
      <section className="section" id="directory-explorer">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                Find &amp; Filter Neighbour-Backed Trades in CW1–CW11
              </h2>
              <p className="section-subtitle">
                Filter {allListings.length} local pros by town, trade, 24/7 availability, no call-out fee and accreditation — or vouch for someone you&apos;ve already used.
              </p>
            </div>
          </div>

          {showDemoListings && (
            <div
              style={{
                backgroundColor: 'var(--accent-amber-soft)',
                border: '1px solid rgba(198, 125, 36, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem 0.95rem',
                marginBottom: '1.15rem',
                fontSize: '0.84rem',
                color: 'var(--accent-amber-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <span>
                <strong>Community Launch Preview:</strong> Cards marked <em>Sample Preview</em> are placeholder examples while we collect real CW1–CW11 nominations from Crewe, Nantwich &amp; Sandbach neighbours.
              </span>
              <span style={{ fontWeight: 700 }}>
                Real neighbour-added trades appear first automatically.
              </span>
            </div>
          )}

          <DirectoryExplorer initialListings={featuredFirst.slice(0, 24)} />
        </div>
      </section>

      {/* Community Growth Callout (Replaces Dark B2B £29/mo Sales Banner) */}
      <section className="section section-alt">
        <div className="container">
          <div
            className="community-callout-banner"
            style={{ padding: '2.25rem 2rem', alignItems: 'center' }}
          >
            <div style={{ maxWidth: '64ch' }}>
              <span className="badge badge-featured" style={{ marginBottom: '0.6rem' }}>
                🏡 Help Build CW1–CW11&apos;s Own Black Book
              </span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.55rem' }}>
                Have a Friend, Relative or Trusted Neighbour in the Trades?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.1rem' }}>
                Don&apos;t let big national directories swallow our local economy. Add a tradesperson from Crewe, Nantwich or Sandbach in 30 seconds — completely free — so next time someone asks on Facebook, we all have our own local list ready.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <NominateModal
                  buttonLabel="+ Add a Local Trade (£0 Forever)"
                  buttonClassName="btn btn-primary btn-lg"
                  triggerId="bottom-nominate-btn"
                />
                <ShareButton
                  path="/"
                  label="South Cheshire Locals — Crewe, Nantwich & Sandbach"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
