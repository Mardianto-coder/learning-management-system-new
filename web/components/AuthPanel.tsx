'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAuthError, login, registerAccount } from '@/store/slices/authSlice';
import { resetPassword } from '@/lib/client-api';
import { validatePasswordFormat } from '@/lib/validate';
import type { UserRole } from '@/lib/types';

export default function AuthPanel() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, user } = useAppSelector((s) => s.auth);
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [message, setMessage] = useState('');
  const [passwordHint, setPasswordHint] = useState('');

  useEffect(() => {
    if (!user) return;
    router.replace(user.role === 'admin' ? '/admin' : '/dashboard');
  }, [user, router]);

  async function onLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    dispatch(clearAuthError());
    const form = new FormData(e.currentTarget);
    const result = await dispatch(
      login({
        email: String(form.get('email')),
        password: String(form.get('password')),
        role: String(form.get('role')) as UserRole,
      }),
    );
    if (login.fulfilled.match(result)) {
      router.push(result.payload.user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }

  async function onRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    dispatch(clearAuthError());
    const form = new FormData(e.currentTarget);
    const password = String(form.get('password'));
    const check = validatePasswordFormat(password);
    if (!check.valid) {
      setPasswordHint(check.message);
      return;
    }
    const result = await dispatch(
      registerAccount({
        name: String(form.get('name')),
        email: String(form.get('email')),
        password,
        role: String(form.get('role')) as UserRole,
      }),
    );
    if (registerAccount.fulfilled.match(result)) {
      router.push(result.payload.user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }

  async function onForgot(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = await resetPassword(String(form.get('email')));
    setMessage(data.message);
  }

  return (
    <div className="auth-container">
      <div className="auth-tabs">
        <button type="button" className={`tab-btn${tab === 'login' ? ' active' : ''}`} onClick={() => setTab('login')}>
          Login
        </button>
        <button
          type="button"
          className={`tab-btn${tab === 'register' ? ' active' : ''}`}
          onClick={() => setTab('register')}
        >
          Register
        </button>
      </div>
      {error ? <div className="status-info error">{error}</div> : null}
      {message ? <div className="status-info info">{message}</div> : null}

      {tab === 'login' && (
        <form className="auth-form active" onSubmit={onLogin}>
          <h2>Login</h2>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select name="role" required defaultValue="">
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Please wait...' : 'Login'}
          </button>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button type="button" className="link-button" onClick={() => setTab('forgot')}>
              Forgot Password?
            </button>
          </div>
        </form>
      )}

      {tab === 'forgot' && (
        <form className="auth-form active" onSubmit={onForgot}>
          <h2>Reset Password</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.9em' }}>
            Enter your email address. If the email exists, you can use the register form to set a new password.
          </p>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" required />
          </div>
          <button type="submit" className="btn btn-primary">
            Reset Password
          </button>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button type="button" className="link-button" onClick={() => setTab('login')}>
              Back to Login
            </button>
          </div>
        </form>
      )}

      {tab === 'register' && (
        <form className="auth-form active" onSubmit={onRegister}>
          <h2>Register</h2>
          <div className="form-group">
            <label>Name</label>
            <input name="name" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              required
              onChange={(e) => setPasswordHint(validatePasswordFormat(e.target.value).message)}
            />
            <small className="form-help-text">
              Password harus minimal 6 karakter, mengandung huruf besar, huruf kecil, dan angka
            </small>
            {passwordHint ? <small className="password-feedback">{passwordHint}</small> : null}
          </div>
          <div className="form-group">
            <label>Role</label>
            <select name="role" required defaultValue="">
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Please wait...' : 'Register'}
          </button>
        </form>
      )}
    </div>
  );
}
