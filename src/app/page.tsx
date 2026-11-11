import React from 'react';
import Link from 'next/link';
import { REGION_CONFIG } from '@/config/region';
import { CATEGORIES } from '@/config/categories';
import { getAllListings } from '@/lib/listings';
import DirectoryExplorer from '@/components/DirectoryExplorer';
import QuoteModal from '@/components/QuoteModal';

export default function HomePage() {
  const allListings = getAllListings();
  const featuredFirst = [...allListings].sort(
    (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.rating - a.rating
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: REGION_CONFIG.brandName,
    url: `https://${REGION_CONFIG.domain}`,
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

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div>
            <div className="hero-eyebrow">
              {REGION_CONFIG.regionName} Home & Trade Directory • Postcodes CW1, CW2, CW5 & CW11
            </div>
            <h1 className="hero-title">{REGION_CONFIG.heroTitle}</h1>
            <p className="hero-subtitle">{REGION_CONFIG.heroSubtitle}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center' }}>
              <QuoteModal
                buttonLabel="Get 3 Free Local Quotes (2 Mins)"
                buttonClassName="btn btn-primary btn-lg"
                triggerId="hero-get-quotes-btn"
              />
              <a
                href="#directory-explorer"
                className="btn btn-ghost-dark btn-lg"
                id="hero-browse-pros-btn"
              >
                Filter {allListings.length} Local Pros ↓
              </a>
              <Link
                href="/for-businesses"
                className="btn btn-ghost-dark btn-lg"
                id="hero-trade-claim-btn"
              >
                Tradesperson? Claim Top 3 Spot (£29/mo)
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
                gap: '1rem',
                marginTop: '2.25rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                  {allListings.length} Vetted Pros
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-on-dark-muted)' }}>
                  Across Crewe, Nantwich & Sandbach
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                  6+ Smart Filters
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-on-dark-muted)' }}>
                  24/7 Callout, No Call-Out Fee, Gas Safe & DBS
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                  0% Middleman Fee
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-on-dark-muted)' }}>
                  Direct 01270 & WhatsApp contact with local trades
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                  CW1 – CW11
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-on-dark-muted)' }}>
                  Includes Wistaston, Willaston, Elworth & Shavington
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Choose Your Town Cluster */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                Browse Verified Trades by Town & Postcode
              </h2>
              <p className="section-subtitle">
                Select your town below to view local specialists based in your immediate postcode area.
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
                        {townListingsCount} Local Pros Available
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                      <Link href={`/${town.slug}`}>{town.name} Trades Directory</Link>
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                      {town.tagline}
                    </p>

                    <div style={{ marginBottom: '0.85rem' }}>
                      <div
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: 'var(--text-muted)',
                          marginBottom: '0.35rem',
                        }}
                      >
                        Villages & Estates Covered:
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
                      Explore All {town.name} Trades →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10 High-Demand Trade Categories */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                10 High-Demand Home & Trade Categories
              </h2>
              <p className="section-subtitle">
                Built around the exact recommendations locals ask for every day in Crewe, Nantwich and Sandbach community groups — with transparent filters that Google Maps misses.
              </p>
            </div>
          </div>

          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
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
                    <span className="badge badge-neutral">
                      Avg job: {cat.avgJobValueGbp}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.12rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                    <Link href={`/crewe/${cat.slug}`}>{cat.name}</Link>
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
                    {cat.description}
                  </p>

                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontStyle: 'italic',
                      backgroundColor: 'var(--bg-subtle)',
                      padding: '0.5rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Solves: {cat.fbMiningPainPoint}
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
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Filter Gap Directory Explorer */}
      <section className="section" id="directory-explorer">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                Search & Filter South Cheshire Tradespeople
              </h2>
              <p className="section-subtitle">
                Filter all {allListings.length} local pros in real time by town, trade, 24/7 emergency availability, no call-out fee and trade accreditation.
              </p>
            </div>
          </div>

          <DirectoryExplorer initialListings={featuredFirst.slice(0, 24)} />
        </div>
      </section>

      {/* Self-Serve Phase 1 Business Owner Banner */}
      <section className="section section-alt">
        <div className="container">
          <div
            style={{
              backgroundColor: 'var(--bg-navy)',
              color: '#fff',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem 2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              alignItems: 'center',
            }}
          >
            <div>
              <span className="badge badge-featured" style={{ marginBottom: '0.65rem' }}>
                For Crewe, Nantwich & Sandbach Tradespeople
              </span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.65rem' }}>
                Run a Local Trade Business in CW1–CW11? Lock In a Top 3 Spot for £29/mo.
              </h2>
              <p style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
                We strictly cap Featured TOP 3 slots to 3 businesses per category in Crewe, Nantwich and Sandbach. A single average local trade job (£150–£450) pays for an entire year of featured placement. Don&apos;t have a website yet? Upgrade to our Digital Shopfront + Priority Homeowner Leads.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <Link href="/for-businesses" className="btn btn-primary btn-lg">
                  Check Open Top-3 Slots & Pricing →
                </Link>
                <Link href="/for-businesses#claim-form" className="btn btn-ghost-dark btn-lg">
                  Claim Your Free Basic Listing
                </Link>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.85rem' }}>
                Why South Cheshire Pros Upgrade:
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
                <li>✓ <strong>Pinned in the Top 3</strong> for your trade in Crewe, Nantwich or Sandbach</li>
                <li>✓ <strong>Direct 01270 / Mobile & WhatsApp clicks</strong> — we take 0% commission</li>
                <li>✓ <strong>Perfect if you only have a Facebook page</strong> — use your verified profile as your official web page</li>
                <li>✓ <strong>Priority homeowner leads</strong> from our &ldquo;Get 3 Free Quotes&rdquo; forms</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
