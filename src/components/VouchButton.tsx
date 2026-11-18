'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';

interface VouchButtonProps {
  slug: string;
  businessName: string;
  baseVouchCount: number;
  compact?: boolean;
}

const STORAGE_KEY = 'sctd_vouched_slugs_v1';

function subscribeVouchStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('sctd-vouch-updated', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('sctd-vouch-updated', callback);
  };
}

export default function VouchButton({
  slug,
  businessName,
  baseVouchCount,
  compact = false,
}: VouchButtonProps) {
  const [addedCount, setAddedCount] = useState(0);
  const [optimisticVouched, setOptimisticVouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const hasVouchedFromStorage = useSyncExternalStore(
    subscribeVouchStorage,
    () => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return Array.isArray(saved) && saved.includes(slug);
      } catch {
        return false;
      }
    },
    () => false
  );

  const hasVouched = optimisticVouched || hasVouchedFromStorage;

  useEffect(() => {
    let active = true;
    fetch(`/api/vouch?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json() as Promise<{ addedVouches?: number }>)
      .then((data) => {
        if (active && typeof data?.addedVouches === 'number') {
          setAddedCount(data.addedVouches);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [slug]);

  async function handleVouch() {
    if (hasVouched || submitting) return;
    setSubmitting(true);
    setOptimisticVouched(true);
    setAddedCount((c) => c + 1);

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const next = Array.isArray(saved) ? Array.from(new Set([...saved, slug])) : [slug];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event('sctd-vouch-updated'));
    } catch {
      // Ignore storage errors
    }

    try {
      const res = await fetch('/api/vouch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const data = (await res.json()) as { addedVouches?: number };
      if (typeof data?.addedVouches === 'number') {
        setAddedCount(data.addedVouches);
      }
    } catch {
      // Optimistic count already updated
    } finally {
      setSubmitting(false);
    }
  }

  const totalVouches = baseVouchCount + addedCount;

  return (
    <button
      id={`vouch-btn-${slug}`}
      type="button"
      onClick={handleVouch}
      disabled={hasVouched}
      className={`vouch-btn ${hasVouched ? 'vouched' : ''}`}
      title={
        hasVouched
          ? `You vouched for ${businessName}`
          : `Used ${businessName}? Click to vouch for them to your CW neighbours`
      }
    >
      <span>{hasVouched ? '✓' : '👍'}</span>
      <span>
        {hasVouched
          ? compact
            ? `Vouched (${totalVouches})`
            : `Vouched by You & ${totalVouches - 1} Neighbours`
          : compact
          ? `Vouch (${totalVouches})`
          : `Vouch for Local (${totalVouches})`}
      </span>
    </button>
  );
}
