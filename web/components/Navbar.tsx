'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const cartCount = useAppSelector((s) => s.cart.items.length);
  const [open, setOpen] = useState(false);

  function handleLogout() {
    dispatch(logout());
    setOpen(false);
    router.push('/');
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <h2>LMS Platform</h2>
        </div>
        <button
          className="nav-toggle"
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
        <div className={`nav-menu${open ? ' open' : ''}`}>
          <Link href="/" className={`nav-link${pathname === '/' ? ' active' : ''}`} onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link
            href="/courses"
            className={`nav-link${pathname === '/courses' ? ' active' : ''}`}
            onClick={() => setOpen(false)}
          >
            Courses
          </Link>
          {user?.role === 'student' && (
            <Link
              href="/cart"
              className={`nav-link${pathname === '/cart' ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              Keranjang{cartCount ? ` (${cartCount})` : ''}
            </Link>
          )}
          {user?.role === 'student' && (
            <Link
              href="/dashboard"
              className={`nav-link${pathname === '/dashboard' ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              Dashboard
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className={`nav-link${pathname === '/admin' ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              Admin Panel
            </Link>
          )}
          {user ? (
            <button type="button" className="nav-link nav-button" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className={`nav-link${pathname === '/login' ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
