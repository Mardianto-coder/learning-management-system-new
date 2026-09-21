import type { Order } from '@/lib/types';

export default function PaymentHistoryLine({ order }: { order: Order }) {
  return (
    <p>
      <strong>Dibayar dari:</strong> {order.senderBank || 'Tidak dicatat'}
    </p>
  );
}
