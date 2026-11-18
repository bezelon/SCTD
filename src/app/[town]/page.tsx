import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { REGION_CONFIG, getTownBySlug } from '@/config/region';
import { CATEGORIES } from '@/config/categories';
import { getLivePrimaryTownListings } from '@/lib/listings';
import DirectoryExplorer from '@/components/DirectoryExplorer';
import QuoteModal from '@/components/QuoteModal';
import NominateModal from '@/components/NominateModal';
import ShareButton from '@/components/ShareButton';

export const dynamic = 'force-dynamic';

interface TownPageProps {
  params: Promise<{ town: string }>;
}

export async function generateStaticParams() {
  return REGION_CONFIG.towns.map((town) => ({
    town: town.slug,
  }));
}

export async function generateMetadata({ params }: TownPageProps): Promise<Metadata> {
  const { town: townSlug } = await params;
  const town = getTownBySlug(townSlug);
  if (!town) return {};

  return {
    title: `Local Tradespeople in ${town.name} (${town.postcodes.join(' & ')})`,
    description: town.seoDescription,
  };
}

export default async function TownHubPage({ params }: TownPageProps) {
  const { town: townSlug } = await params;
  const town = getTownBySlug(townSlug);
  if (!town) {
    notFound();
  }

  const { listings: townListings } = await getLivePrimaryTownListings(town.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Local Tradespeople in ${town.name} (${town.postcodes.join(', ')})`,
    description: town.seoDescription,
    areaServed: {
      '@type': 'City',
      name: town.name,
      postalCode: town.postcodes,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="hero-section">
        <div className="container hero-grid">
          <div>
            <div className="hero-eyebrow">
              <Link href="/" style={{ textDecoration: 'underline' }}>
                {REGION_CONFIG.brandName}
              </Link>{' '}
              / {town.name} ({town.postcodes.join(' & ')})
            </div>
            <h1 className="hero-title">
              Back Local Trades in {town.name} ({town.postcodes.join(', ')})
            </h1>
            <p className="hero-subtitle">
              {town.seoDescription} Covering {town.name} and surrounding villages including{' '}
              {town.nearbyVillages.join(', ')}.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              <QuoteModal
                defaultTownSlug={town.slug}
                buttonLabel={`Ask 3 ${town.name} Pros`}
                buttonClassName="btn btn-primary btn-lg"
                triggerId={`town-hero-quote-btn-${town.slug}`}
              />
              <NominateModal
                defaultTownSlug={town.slug}
                buttonLabel={`+ Add a ${town.name} Trade (£0)`}
                buttonClassName="btn btn-outline btn-lg"
                triggerId={`town-hero-nominate-btn-${town.slug}`}
              />
              <ShareButton
                path={`/${town.slug}`}
                label={`${town.name} Local Trades`}
                townName={town.name}
              />
            </div>
          </div>

          <div className="hero-photo-frame">
            <Image
              src={town.imageUrl}
              alt={town.imageAlt}
              width={800}
              height={520}
              className="hero-photo-img"
              priority
            />
            <div className="hero-photo-caption">
              <span>📍 {town.imageCaption}</span>
              <span>{townListings.length} Listed Locals</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid for this Town */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                Choose a Trade in {town.name} ({town.postcodes[0]})
              </h2>
              <p className="section-subtitle">
                Filter by 24/7 local callout, no call-out fee and genuine registrations in {town.name}.
              </p>
            </div>
          </div>

          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${town.slug}/${cat.slug}`}
                className="category-card"
                id={`town-${town.slug}-cat-${cat.slug}`}
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
                    <div className="category-icon-box">
                      <svg
                        width="20"
                        height="20"
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
                      {town.postcodes.join('/')}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.08rem', fontWeight: 800, marginBottom: '0.3rem' }}>
                    {cat.name} in {town.name}
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    {cat.description}
                  </p>
                </div>
                <div
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: 'var(--brand-emerald)',
                    marginTop: '0.5rem',
                  }}
                >
                  View {town.name} {cat.shortName} →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Listings in this Town */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                Neighbour-Backed Trades Based in {town.name}
              </h2>
              <p className="section-subtitle">
                Filter {town.name} locals by trade, village ({town.nearbyVillages.slice(0, 4).join(', ')}) or call-out policy.
              </p>
            </div>
          </div>

          <DirectoryExplorer
            initialListings={townListings}
            lockedTownSlug={town.slug}
          />
        </div>
      </section>
    </>
  );
}
