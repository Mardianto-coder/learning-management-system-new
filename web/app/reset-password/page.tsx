'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowser, isBrowserSupabaseEnabled } from '@/lib/supabase-browser';
import { validatePasswordFormat } from '@/lib/validate';

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [missingLink, setMissingLink] = useState(false);
  const [hint, setHint] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isBrowserSupabaseEnabled()) {
      setMissingLink(true);
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setMissingLink(true);
      return;
    }

    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const params = new URLSearchParams(search);
    const code = params.get('code');

    let cancelled = false;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' && !cancelled) setReady(true);
    });

    (async () => {
      try {
        if (code) {
          const exchanged = await supabase.auth.exchangeCodeForSession(code);
          if (!exchanged.error && !cancelled) setReady(true);
        } else {
          const session = await supabase.auth.getSession();
          if (session.data.session && !cancelled) setReady(true);
        }
        if (!code && !hash.includes('access_token') && !hash.includes('type=recovery')) {
          const session = await supabase.auth.getSession();
          if (!session.data.session && !cancelled) {
            setTimeout(() => {
              if (!cancelled) {
                setReady((current) => {
                  if (!current) setMissingLink(true);
                  return current;
                });
              }
            }, 1200);
          }
        }
      } catch {
        if (!cancelled) setMissingLink(true);
      }
    })();

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setOk('');
    const form = new FormData(e.currentTarget);
    const password = String(form.get('password') || '');
    const confirm = String(form.get('confirm') || '');
    if (password !== confirm) {
      setError('Konfirmasi password tidak sama');
      return;
    }
    const format = validatePasswordFormat(password);
    if (!format.valid) {
      setHint(format.message);
      return;
    }
    setBusy(true);
    try {
      const policy = await fetch('/api/auth/password-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const policyData = (await policy.json()) as { message?: string };
      if (!policy.ok) {
        setError(policyData.message || 'Password belum aman');
        return;
      }
      const supabase = getSupabaseBrowser();
      if (!supabase) {
        setError('Reset password belum dikonfigurasi.');
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || 'Gagal menyimpan password baru');
        return;
      }
      await supabase.auth.signOut();
      setOk('Password baru tersimpan. Silakan login.');
    } catch {
      setError('Gagal menyimpan password baru');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <div className="auth-page">
        <div className="auth-container">
          <h2>Password baru</h2>
          {error ? <div className="status-info error">{error}</div> : null}
          {ok ? <div className="status-info">{ok}</div> : null}
          {missingLink && !ok ? (
            <p className="dash-muted">
              Buka tautan dari email reset. Jika belum ada email, minta ulang dari halaman login.
            </p>
          ) : null}
          {ready && !ok ? (
            <form className="auth-form active" onSubmit={onSubmit}>
              <div className="form-group">
                <label>Password baru</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  onChange={(e) => setHint(validatePasswordFormat(e.target.value).message)}
                />
                <small className="form-help-text">Minimal 8 karakter, huruf besar, huruf kecil, dan angka.</small>
                {hint ? <small className="password-feedback">{hint}</small> : null}
              </div>
              <div className="form-group">
                <label>Ulangi password</label>
                <input name="confirm" type="password" required minLength={8} autoComplete="new-password" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? 'Menyimpan...' : 'Simpan password'}
              </button>
            </form>
          ) : null}
          <p style={{ marginTop: '1rem' }}>
            <Link href="/login">Kembali ke login</Link>
          </p>
        </div>
      </div>
    </main>
  );
}