import Link from 'next/link';
import { getLanAddresses } from '@/lib/lan';

export default function HomePage() {
  const addresses = getLanAddresses();
  const port = process.env.PORT || 3000;

  return (
    <main className="page">
      <section className="hero-section">
        <h1>Welcome to Learning Management System</h1>
        <p>Your gateway to knowledge and growth</p>
        <Link href="/courses" className="btn btn-primary btn-large">
          Explore Courses
        </Link>
      </section>
      <aside className="lan-box">
        <strong>Akses dari laptop &amp; HP (jaringan Wi‑Fi yang sama)</strong>
        <p>Laptop: <code>http://localhost:{port}</code></p>
        {addresses.length ? (
          addresses.map((ip) => (
            <p key={ip}>
              HP: <code>{`http://${ip}:${port}`}</code>
            </p>
          ))
        ) : (
          <p>Jalankan `npm run dev` lalu buka IP LAN komputer ini dari browser HP.</p>
        )}
      </aside>
    </main>
  );
}
