import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { REGION_CONFIG, getTownBySlug } from '@/config/region';
import { CATEGORIES, getCategoryBySlug } from '@/config/categories';
import { getLiveListingsByTownAndCategory } from '@/lib/listings';
import DirectoryExplorer from '@/components/DirectoryExplorer';
import QuoteModal from '@/components/QuoteModal';
import NominateModal from '@/components/NominateModal';
import ShareButton from '@/components/ShareButton';

export const dynamic = 'force-dynamic';

interface TownCategoryPageProps {
  params: Promise<{ town: string; category: string }>;
}

export async function generateStaticParams() {
  const params: { town: string; category: string }[] = [];
  for (const town of REGION_CONFIG.towns) {
    for (const cat of CATEGORIES) {
      params.push({
        town: town.slug,
        category: cat.slug,
      });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: TownCategoryPageProps): Promise<Metadata> {
  const { town: townSlug, category: catSlug } = await params;
  const town = getTownBySlug(townSlug);
  const category = getCategoryBySlug(catSlug);
  if (!town || !category) return {};

  return {
    title: `Local ${category.name} in ${town.name} (${town.postcodes.join('/')})`,
    description: `Find neighbour-recommended ${category.name.toLowerCase()} in ${town.name} (${town.postcodes.join(', ')}) and ${town.nearbyVillages.slice(0, 4).join(', ')}. Direct phone & WhatsApp contact with zero middlemen.`,
  };
}

export default async function TownCategoryPage({
  params,
}: TownCategoryPageProps) {
  const { town: townSlug, category: catSlug } = await params;
  const town = getTownBySlug(townSlug);
  const category = getCategoryBySlug(catSlug);

  if (!town || !category) {
    notFound();
  }

  const { listings } = await getLiveListingsByTownAndCategory(town.slug, category.slug);

  const populatedFaqs = category.faqTemplates.map((tpl) => ({
    question: tpl.questionTemplate
      .replace(/\{town\}/g, town.name)
      .replace(/\{postcodes\}/g, town.postcodes.join('/'))
      .replace(/\{villages\}/g, town.nearbyVillages.slice(0, 4).join(', ')),
    answer: tpl.answerTemplate
      .replace(/\{town\}/g, town.name)
      .replace(/\{postcodes\}/g, town.postcodes.join('/'))
      .replace(/\{villages\}/g, town.nearbyVillages.slice(0, 4).join(', ')),
  }));

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Local ${category.name} in ${town.name} (${town.postcodes.join('/')})`,
      numberOfItems: listings.length,
      itemListElement: listings.slice(0, 10).map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'LocalBusiness',
          name: item.name,
          telephone: item.phone,
          address: {
            '@type': 'PostalAddress',
            addressLocality: item.primaryTownName,
            postalCode: item.postcode,
            addressCountry: 'GB',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: item.rating,
            reviewCount: item.reviewCount,
          },
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: populatedFaqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header with Town Context Photo */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div>
            <div className="hero-eyebrow">
              <Link href="/" style={{ textDecoration: 'underline' }}>
                CW1–CW11 Locals
              </Link>{' '}
              /{' '}
              <Link href={`/${town.slug}`} style={{ textDecoration: 'underline' }}>
                {town.name} ({town.postcodes.join('/')})
              </Link>{' '}
              / {category.shortName}
            </div>

            <h1 className="hero-title">
              Local {category.name} in {town.name} ({town.postcodes.join(' & ')})
            </h1>

            <p className="hero-subtitle">
              {listings.length} independent local {category.name.toLowerCase()} serving{' '}
              <strong>{town.name}</strong> and surrounding villages ({town.nearbyVillages.join(', ')}).
              Direct contact with real people in our community — zero lead-broker fees.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              <QuoteModal
                defaultTownSlug={town.slug}
                defaultCategorySlug={category.slug}
                buttonLabel={`Ask 3 ${town.name} ${category.shortName}`}
                buttonClassName="btn btn-primary btn-lg"
                triggerId="category-hero-quote-btn"
              />
              <NominateModal
                defaultTownSlug={town.slug}
                defaultCategorySlug={category.slug}
                buttonLabel={`+ Add a ${town.name} ${category.singularName}`}
                buttonClassName="btn btn-outline btn-lg"
                triggerId="category-hero-nominate-btn"
              />
              <ShareButton
                path={`/${town.slug}/${category.slug}`}
                label={`${category.shortName} in ${town.name}`}
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
              <span>{category.shortName}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Directory Explorer */}
      <section className="section">
        <div className="container">
          <DirectoryExplorer
            initialListings={listings}
            lockedTownSlug={town.slug}
            lockedCategorySlug={category.slug}
            availableFilters={category.filterTags}
          />
        </div>
      </section>

      {/* Local Guidance, Common Services & FAQ */}
      <section className="section section-alt">
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            <div>
              <h2 className="section-title" style={{ fontSize: '1.45rem', marginBottom: '0.85rem' }}>
                Common {category.shortName} Jobs in {town.name} ({town.postcodes[0]})
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1rem' }}>
                Neighbours across {town.name}, {town.nearbyVillages.slice(0, 4).join(', ')} most often ask local specialists for:
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.55rem',
                }}
              >
                {category.commonServices.map((srv) => (
                  <li
                    key={srv}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      padding: '0.7rem 0.95rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    ✓ {srv} ({town.name} &amp; {town.postcodes.join('/')})
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="section-title" style={{ fontSize: '1.45rem', marginBottom: '0.85rem' }}>
                {town.name} {category.shortName} – Neighbour Q&amp;A
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {populatedFaqs.map((faq) => (
                  <div
                    key={faq.question}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      padding: '1.15rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                      {faq.question}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cross-Links to Neighbouring Towns */}
          <div
            style={{
              marginTop: '2.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.6rem',
              alignItems: 'center',
            }}
          >
            <strong style={{ fontSize: '0.85rem', marginRight: '0.35rem' }}>
              Also check {category.shortName} in nearby CW towns:
            </strong>
            {REGION_CONFIG.towns
              .filter((t) => t.slug !== town.slug)
              .map((otherTown) => (
                <Link
                  key={otherTown.slug}
                  href={`/${otherTown.slug}/${category.slug}`}
                  className="town-quick-link"
                >
                  {category.shortName} in {otherTown.name} ({otherTown.postcodes.join('/')}) →
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
