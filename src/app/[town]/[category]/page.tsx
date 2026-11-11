import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { REGION_CONFIG, getTownBySlug } from '@/config/region';
import { CATEGORIES, getCategoryBySlug } from '@/config/categories';
import {
  getListingsByTownAndCategory,
  getFeaturedSlotStatus,
} from '@/lib/listings';
import DirectoryExplorer from '@/components/DirectoryExplorer';
import QuoteModal from '@/components/QuoteModal';

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
    title: `Best ${category.name} in ${town.name} (${town.postcodes.join('/')}) – Compare Local Quotes`,
    description: `Compare verified local ${category.name.toLowerCase()} in ${town.name} (${town.postcodes.join(', ')}) and ${town.nearbyVillages.slice(0, 4).join(', ')}. Filter by 24/7 emergency callout, no call-out fee & free quotes.`,
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

  const listings = getListingsByTownAndCategory(town.slug, category.slug);
  const scarcityStatus = getFeaturedSlotStatus(town.slug, category.slug);

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
      name: `Top ${category.name} in ${town.name} (${town.postcodes.join('/')})`,
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

      {/* Hero Header */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-eyebrow">
            <Link href="/" style={{ textDecoration: 'underline' }}>
              South Cheshire
            </Link>{' '}
            /{' '}
            <Link href={`/${town.slug}`} style={{ textDecoration: 'underline' }}>
              {town.name} ({town.postcodes.join('/')})
            </Link>{' '}
            / {category.shortName}
          </div>

          <h1 className="hero-title">
            Verified {category.name} in {town.name} ({town.postcodes.join(' & ')})
          </h1>

          <p className="hero-subtitle">
            Compare {listings.length} vetted local {category.name.toLowerCase()} serving{' '}
            <strong>{town.name}</strong> and surrounding villages ({town.nearbyVillages.join(', ')}).
            Typical local job range: <strong>{category.avgJobValueGbp}</strong>.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <QuoteModal
              defaultTownSlug={town.slug}
              defaultCategorySlug={category.slug}
              buttonLabel={`Get 3 Free ${category.shortName} Quotes in ${town.name}`}
              buttonClassName="btn btn-primary btn-lg"
              triggerId="category-hero-quote-btn"
            />
            <Link
              href={`/for-businesses?plan=featured&town=${town.slug}&category=${category.slug}#claim-form`}
              className="btn btn-ghost-dark btn-lg"
              id="category-hero-claim-btn"
            >
              Are You a {town.name} {category.singularName}? Claim Top-3 Spot (£29/mo)
            </Link>
          </div>
        </div>
      </section>

      {/* Main Directory Explorer with Category-Specific Filter Gap */}
      <section className="section">
        <div className="container">
          <DirectoryExplorer
            initialListings={listings}
            lockedTownSlug={town.slug}
            lockedCategorySlug={category.slug}
            availableFilters={category.filterTags}
            scarcityStatus={scarcityStatus}
          />
        </div>
      </section>

      {/* Local Pricing Guide, Common Services & FAQ (Programmatic SEO Booster) */}
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
                Popular {category.shortName} Services in {town.name} ({town.postcodes[0]})
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1rem' }}>
                Homeowners and landlords across {town.name}, {town.nearbyVillages.slice(0, 4).join(', ')} most frequently book our listed specialists for:
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
                    ✓ {srv} ({town.name} & {town.postcodes.join('/')})
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="section-title" style={{ fontSize: '1.45rem', marginBottom: '0.85rem' }}>
                {town.name} {category.shortName} – Local FAQs & Pricing Guide
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

          {/* Cross-Links to Neighbouring Towns & Categories */}
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
              Compare {category.shortName} in nearby South Cheshire towns:
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
