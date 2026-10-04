import { json, isResponse, requireUser } from '@/lib/http';
import { withStore, withStoreRead } from '@/lib/storage';
import { dedupeBankAccounts } from '@/lib/banks';
import { sanitizeText } from '@/lib/validate';
import type { PaymentSettings } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET() {
  return withStoreRead((store) =>
    json(
      { payment: { ...store.payment, accounts: dedupeBankAccounts(store.payment.accounts) } },
      200,
      { 'Cache-Control': 'private, max-age=10' },
    ),
  );
}

export async function PUT(request: Request) {
  const auth = requireUser(request, 'admin');
  if (isResponse(auth)) return auth;
  try {
    const body = (await request.json()) as Partial<PaymentSettings>;
    const instruction = sanitizeText(body.instruction);
    const accounts = Array.isArray(body.accounts) ? body.accounts : [];
    const cleaned = dedupeBankAccounts(accounts);
    if (!cleaned.length) {
      return json({ message: 'Minimal satu rekening tujuan harus diisi' }, 400);
    }
    return withStore(async (store) => {
      store.payment = {
        instruction:
          instruction ||
          'Transfer sesuai total pembayaran ke salah satu rekening berikut. Lalu unggah bukti transfer agar dosen/admin bisa mengaktifkan kelas.',
        accounts: cleaned,
      };
      return json({ message: 'Rekening tujuan disimpan', payment: store.payment });
    });
  } catch {
    return json({ message: 'Gagal menyimpan rekening' }, 500);
  }
}
