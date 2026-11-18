'use client';

import React, { useState, useMemo } from 'react';
import { TradeListing } from '@/lib/listings';
import { REGION_CONFIG } from '@/config/region';
import { CATEGORIES, UNIVERSAL_FILTERS, FilterTag } from '@/config/categories';
import ListingCard from '@/components/ListingCard';
import QuoteModal from '@/components/QuoteModal';
import NominateModal from '@/components/NominateModal';

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
                Town / CW Postcode Area
              </label>
              <select
                id="explorer-town-select"
                className="form-select"
                value={selectedTown}
                onChange={(e) => setSelectedTown(e.target.value)}
              >
                <option value="all">All CW1–CW11 (Crewe, Nantwich, Sandbach)</option>
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
                Trade / Skill Needed
              </label>
              <select
                id="explorer-category-select"
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All 10 Local Trade Categories</option>
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
              Search Name, Village or Postcode
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

        {/* Neighbour Filter Bar */}
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
            Filter by what matters:
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
            <span>Neighbour-Vouched Only</span>
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

      {/* Results Header & Direct Local Enquiry */}
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
          independent local trades
          {currentTownObj ? ` serving ${currentTownObj.name} (${currentTownObj.postcodes.join('/')})` : ''}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Short on time? Ask 3 local pros directly:
          </span>
          <QuoteModal
            defaultTownSlug={lockedTownSlug || (selectedTown !== 'all' ? selectedTown : 'crewe')}
            defaultCategorySlug={
              lockedCategorySlug || (selectedCategory !== 'all' ? selectedCategory : 'plumbers')
            }
            buttonLabel="Ask 3 Neighbour Pros"
            buttonClassName="btn btn-primary btn-sm"
            triggerId="explorer-quote-modal-btn"
          />
        </div>
      </div>

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
            {initialListings.length === 0
              ? 'Be the first neighbour to add a local trade here'
              : 'No exact match for all selected filters'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
            {initialListings.length === 0
              ? 'We only list genuine CW1–CW11 trades recommended by locals. Know someone reliable? Add them in 30 seconds for £0.'
              : 'Try removing one of the filter pills above or ask 3 local neighbours directly.'}
          </p>
          {initialListings.length === 0 ? (
            <NominateModal
              defaultTownSlug={lockedTownSlug || (selectedTown !== 'all' ? selectedTown : 'crewe')}
              defaultCategorySlug={
                lockedCategorySlug || (selectedCategory !== 'all' ? selectedCategory : 'plumbers')
              }
              buttonLabel="+ Nominate First Local Trade (£0)"
              buttonClassName="btn btn-primary btn-sm"
              triggerId="empty-state-nominate-btn"
            />
          ) : (
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
          )}
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

      {/* Community Nomination Callout (Replaces Scarcity FOMO Banner) */}
      <div className="community-callout-banner" style={{ marginTop: '1.5rem' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
            Know a reliable {currentCatObj?.singularName.toLowerCase() || 'tradesperson'} in{' '}
            {currentTownObj?.name || 'Crewe, Nantwich or Sandbach'} who isn&apos;t listed here yet?
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Add your mate, brother, or family-run local firm in 30 seconds (£0 forever) so neighbours never have to rely on Google or national call centres.
          </div>
        </div>
        <NominateModal
          defaultTownSlug={lockedTownSlug || (selectedTown !== 'all' ? selectedTown : 'crewe')}
          defaultCategorySlug={
            lockedCategorySlug || (selectedCategory !== 'all' ? selectedCategory : 'plumbers')
          }
          buttonLabel="+ Nominate a Local Trade (£0)"
          buttonClassName="btn btn-amber btn-sm"
          triggerId="explorer-nominate-btn"
        />
      </div>
    </div>
  );
}
