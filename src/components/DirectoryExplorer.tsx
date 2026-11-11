'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { TradeListing } from '@/lib/listings';
import { REGION_CONFIG } from '@/config/region';
import { CATEGORIES, UNIVERSAL_FILTERS, FilterTag } from '@/config/categories';
import ListingCard from '@/components/ListingCard';
import QuoteModal from '@/components/QuoteModal';

interface DirectoryExplorerProps {
  initialListings: TradeListing[];
  lockedTownSlug?: string;
  lockedCategorySlug?: string;
  availableFilters?: FilterTag[];
  scarcityStatus?: {
    maxSlots: number;
    taken: number;
    remaining: number;
  };
}

export default function DirectoryExplorer({
  initialListings,
  lockedTownSlug,
  lockedCategorySlug,
  availableFilters = UNIVERSAL_FILTERS,
  scarcityStatus,
}: DirectoryExplorerProps) {
  const [selectedTown, setSelectedTown] = useState<string>(lockedTownSlug || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    lockedCategorySlug || 'all'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);

  function toggleFilter(filterId: string) {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  }

  const filteredListings = useMemo(() => {
    return initialListings.filter((item) => {
      if (
        selectedTown !== 'all' &&
        item.primaryTownSlug !== selectedTown &&
        !item.townsServed.includes(selectedTown)
      ) {
        return false;
      }

      if (selectedCategory !== 'all' && item.categorySlug !== selectedCategory) {
        return false;
      }

      if (onlyVerified && !item.isVerifiedLocal) {
        return false;
      }

      if (activeFilters.length > 0) {
        const hasAll = activeFilters.every((fid) => item.filterIds.includes(fid));
        if (!hasAll) return false;
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const hay = [
          item.name,
          item.categoryName,
          item.areaLabel,
          item.postcode,
          ...item.services,
          item.shortSummary,
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [
    initialListings,
    selectedTown,
    selectedCategory,
    onlyVerified,
    activeFilters,
    searchQuery,
  ]);

  const currentTownObj = REGION_CONFIG.towns.find(
    (t) => t.slug === (lockedTownSlug || selectedTown)
  );
  const currentCatObj = CATEGORIES.find(
    (c) => c.slug === (lockedCategorySlug || selectedCategory)
  );

  return (
    <div>
      {/* Search & Filter Gap Panel */}
      <div className="search-panel" style={{ marginBottom: '1.75rem' }}>
        <div className="search-form-grid">
          {!lockedTownSlug && (
            <div className="form-field">
              <label htmlFor="explorer-town-select" className="form-label">
                Town / Postcode Area
              </label>
              <select
                id="explorer-town-select"
                className="form-select"
                value={selectedTown}
                onChange={(e) => setSelectedTown(e.target.value)}
              >
                <option value="all">All South Cheshire (Crewe, Nantwich, Sandbach)</option>
                {REGION_CONFIG.towns.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name} ({t.postcodes.join(', ')})
                  </option>
                ))}
              </select>
            </div>
          )}

          {!lockedCategorySlug && (
            <div className="form-field">
              <label htmlFor="explorer-category-select" className="form-label">
                Trade Category
              </label>
              <select
                id="explorer-category-select"
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All 10 Home & Trade Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-field">
            <label htmlFor="explorer-keyword-input" className="form-label">
              Search Service, Village or Postcode
            </label>
            <input
              id="explorer-keyword-input"
              type="search"
              className="form-input"
              placeholder="e.g. Wistaston, Willaston, Elworth, Boiler, Fence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Chris Koerner's Filter Gap Secret Bar */}
        <div className="filter-gap-bar">
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text-secondary)',
              marginRight: '0.25rem',
            }}
          >
            Instant Filters:
          </span>

          {availableFilters.map((filter) => {
            const isActive = activeFilters.includes(filter.id);
            return (
              <button
                key={filter.id}
                id={`filter-chip-${filter.id}`}
                type="button"
                className={`filter-chip ${isActive ? 'active' : ''}`}
                onClick={() => toggleFilter(filter.id)}
                title={filter.shortDesc}
              >
                <span>{isActive ? '✓' : '+'}</span>
                <span>{filter.label}</span>
              </button>
            );
          })}

          <button
            id="filter-chip-verified-only"
            type="button"
            className={`filter-chip ${onlyVerified ? 'active' : ''}`}
            onClick={() => setOnlyVerified((v) => !v)}
          >
            <span>{onlyVerified ? '✓' : '+'}</span>
            <span>Verified Pros Only</span>
          </button>

          {(activeFilters.length > 0 ||
            onlyVerified ||
            searchQuery.trim() !== '' ||
            (!lockedTownSlug && selectedTown !== 'all') ||
            (!lockedCategorySlug && selectedCategory !== 'all')) && (
            <button
              id="reset-filters-btn"
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setActiveFilters([]);
                setOnlyVerified(false);
                setSearchQuery('');
                if (!lockedTownSlug) setSelectedTown('all');
                if (!lockedCategorySlug) setSelectedCategory('all');
              }}
              style={{ marginLeft: 'auto' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header & Lead Gen CTA */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.15rem',
        }}
      >
        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredListings.length}</strong>{' '}
          local tradespeople
          {currentTownObj ? ` covering ${currentTownObj.name} (${currentTownObj.postcodes.join('/')})` : ''}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Short on time? Let 3 vetted pros reply to you:
          </span>
          <QuoteModal
            defaultTownSlug={lockedTownSlug || (selectedTown !== 'all' ? selectedTown : 'crewe')}
            defaultCategorySlug={
              lockedCategorySlug || (selectedCategory !== 'all' ? selectedCategory : 'plumbers')
            }
            buttonLabel="Request 3 Free Quotes"
            buttonClassName="btn btn-primary btn-sm"
            triggerId="explorer-quote-modal-btn"
          />
        </div>
      </div>

      {/* Scarcity Banner (Phase 1 Self-Serve Monetization Trigger) */}
      {scarcityStatus && scarcityStatus.remaining > 0 && (
        <div className="scarcity-slot-banner" style={{ marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--accent-amber-text)' }}>
              🔥 {scarcityStatus.taken} of {scarcityStatus.maxSlots} TOP Featured Pro Spots Taken in{' '}
              {currentTownObj?.name || 'This Area'} — Only {scarcityStatus.remaining} Spot Left!
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Are you a local {currentCatObj?.singularName.toLowerCase() || 'tradesperson'} in{' '}
              {currentTownObj?.name || 'South Cheshire'}? Pin your business in the Top 3 above competitors for £29/mo (1 job pays for the year).
            </div>
          </div>
          <Link
            href={`/for-businesses?plan=featured&town=${lockedTownSlug || 'crewe'}&category=${lockedCategorySlug || 'plumbers'}#claim-form`}
            className="btn btn-amber btn-sm"
            id="scarcity-claim-top3-btn"
          >
            Claim Last Top-3 Spot (£29/mo) →
          </Link>
        </div>
      )}

      {/* Listings Feed */}
      {filteredListings.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            No exact match for all selected filters
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
            Try removing one of the filter tags above or request 3 free quotes and we will match you manually.
          </p>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setActiveFilters([]);
              setOnlyVerified(false);
              setSearchQuery('');
            }}
          >
            Clear Active Filters
          </button>
        </div>
      ) : (
        <div className="listings-stack">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              currentTownName={currentTownObj?.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
