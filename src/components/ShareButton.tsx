'use client';

import React, { useState } from 'react';

interface ShareButtonProps {
  path: string;
  label: string;
  townName?: string;
}

export default function ShareButton({ path, label, townName }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url = `${window.location.origin}${path}`;
    const text = townName
      ? `Recommended local trade in ${townName} (South Cheshire Locals, CW1–CW11): ${label} — ${url}`
      : `South Cheshire Locals (Crewe, Nantwich & Sandbach) — ${label}: ${url}`;

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="btn btn-outline btn-sm"
      title="Copy link to share in Facebook groups or WhatsApp"
    >
      <span>{copied ? '✓ Copied Link!' : '🔗 Share with Neighbour'}</span>
    </button>
  );
}
