'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkoutOrder, getOrders, getPaymentInfo } from '@/lib/client-api';
import { formatRupiah } from '@/lib/format';
import { SENDER_BANKS } from '@/lib/banks';
import type { Order, PaymentSettings } from '@/lib/types';
import BankAccountsBox from '@/components/BankAccountsBox';
import PaymentHistoryLine from '@/components/PaymentHistoryLine';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCart, removeFromCart } from '@/store/slices/cartSlice';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, ready } = useAppSelector((s) => s.auth);
  const items = useAppSelector((s) => s.cart.items);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payment, setPayment] = useState<PaymentSettings | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [senderBank, setSenderBank] = useState('');
  const [otherBank, setOtherBank] = useState('');
  const total = items.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'student') {
      router.replace('/');
      return;
    }
    Promise.all([getOrders(), getPaymentInfo()])
      .then(([o, p]) => {
        setOrders(o);
        setPayment(p);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat pesanan'));
  }, [ready, user, router]);

  async function onCheckout(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.currentTarget);
    const note = String(form.get('note') || '');
    const proof = form.get('proof');
    const fromBank = senderBank === 'Lainnya' ? otherBank.trim() : senderBank;
    if (!fromBank) {
      setError('Pilih bank asal pembayaran');
      return;
    }
    try {
      const result = await checkoutOrder(
        items.map((item) => item.courseId),
        note,
        proof instanceof File && proof.size > 0 ? proof : null,
        fromBank,
      );
      dispatch(clearCart());
      setMessage(result.message);
      setOrders(await getOrders());
      setSenderBank('');
      setOtherBank('');
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout gagal');
    }
  }

  if (!ready || !user || user.role !== 'student') return <main className="page">Loading...</main>;

  return (
    <main className="page">
      <div className="container">
        <h1>Keranjang Kelas Berbayar</h1>
        {message ? <div className="status-info success">{message}</div> : null}
        {error ? <div className="status-info error">{error}</div> : null}

        <section className="dashboard-section">
          <BankAccountsBox payment={payment} />
          {items.length === 0 ? <p>Keranjang kosong. Tambah kelas berbayar dari halaman Courses.</p> : null}
          {items.map((item) => (
            <div className="task-item" key={item.courseId}>
              <h4>{item.title}</h4>
              <p>{formatRupiah(item.price)}</p>
              <button type="button" className="btn btn-outline" onClick={() => dispatch(removeFromCart(item.courseId))}>
                Hapus
              </button>
            </div>
          ))}
          {items.length > 0 ? (
            <>
              <p style={{ margin: '1rem 0', fontWeight: 700 }}>Total: {formatRupiah(total)}</p>
              <form onSubmit={onCheckout}>
                <div className="form-group">
                  <label>Bayar dari bank</label>
                  <select value={senderBank} onChange={(e) => setSenderBank(e.target.value)} required>
                    <option value="">Pilih bank pengirim</option>
                    {SENDER_BANKS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>
                {senderBank === 'Lainnya' ? (
                  <div className="form-group">
                    <label>Nama bank pengirim</label>
                    <input value={otherBank} onChange={(e) => setOtherBank(e.target.value)} required placeholder="Contoh: Bank Mega" />
                  </div>
                ) : null}
                <div className="form-group">
                  <label>Catatan transfer (nama pengirim & tanggal)</label>
                  <textarea name="note" rows={3} placeholder="Contoh: a.n. Budi, 21 Sep 2026" />
                </div>
                <div className="form-group">
                  <label>Bukti bayar (gambar/PDF)</label>
                  <input name="proof" type="file" accept="image/*,.pdf" />
                </div>
                <button type="submit" className="btn btn-primary">
                  Kirim pembayaran
                </button>
              </form>
            </>
          ) : null}
        </section>

        <section className="dashboard-section">
          <h2>Status pembayaran saya</h2>
          {orders.length === 0 ? <p>Belum ada pembayaran.</p> : null}
          {orders.map((order) => (
            <article className="task-item" key={order.id}>
              <h4>Pesanan #{order.id}</h4>
              <p>{order.items.map((item) => item.title).join(', ')}</p>
              <p>{formatRupiah(order.total)}</p>
              <PaymentHistoryLine order={order} />
              <span className={`task-status ${order.status === 'activated' ? 'graded' : order.status === 'rejected' ? 'pending' : 'submitted'}`}>
                {order.status === 'awaiting_activation'
                  ? 'Menunggu aktivasi dosen'
                  : order.status === 'activated'
                    ? 'Kelas aktif'
                    : 'Ditolak'}
              </span>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
