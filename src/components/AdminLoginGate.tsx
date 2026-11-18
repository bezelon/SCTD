'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminLoginGateProps {
  mode: 'required' | 'unconfigured';
}

export default function AdminLoginGate({ mode }: AdminLoginGateProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { error?: string; success?: boolean };
      if (!res.ok) {
        setErrorMsg(data.error || 'Incorrect password.');
      } else {
        router.refresh();
      }
    } catch {
      setErrorMsg('Network error signing in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: '460px', margin: '1rem auto' }} className="listing-card">
      <span className="badge badge-amber" style={{ marginBottom: '0.65rem' }}>
        CW1–CW11 Community Steward Access
      </span>

      {mode === 'unconfigured' ? (
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Steward Password Not Configured Yet
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.9rem' }}>
            To protect resident nominations and homeowner phone numbers in production, this console stays locked until <code>ADMIN_PASSWORD</code> is set.
          </p>
          <div
            style={{
              backgroundColor: 'var(--bg-subtle)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
            }}
          >
            In Cloudflare Dashboard → <strong>Workers &amp; Pages → south-cheshire-locals → Settings → Variables and Secrets</strong>, add secret <code>ADMIN_PASSWORD</code> and redeploy or refresh.
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleLogin}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}
        >
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.3rem' }}>
              Sign In to Steward Console
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Enter your <code>ADMIN_PASSWORD</code> to review neighbour nominations, approve live CW listings, and toggle Demo Preview mode.
            </p>
          </div>

          {errorMsg && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--urgent-crimson-soft)',
                color: 'var(--urgent-crimson)',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {errorMsg}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="admin-password-input" className="form-label">
              Steward Password
            </label>
            <input
              id="admin-password-input"
              type="password"
              className="form-input"
              placeholder="Enter ADMIN_PASSWORD..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </div>

          <button
            id="admin-login-submit-btn"
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Verifying...' : 'Unlock Steward Console →'}
          </button>
        </form>
      )}
    </div>
  );
}
