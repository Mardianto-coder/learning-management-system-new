import { json, isResponse, requireUser } from '@/lib/http';
import { withStore, withStoreRead } from '@/lib/storage';
import { sanitizeText } from '@/lib/validate';
import type { BankAccount, PaymentSettings } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET() {
  return withStoreRead((store) => json({ payment: store.payment }));
}

export async function PUT(request: Request) {
  const auth = requireUser(request, 'admin');
  if (isResponse(auth)) return auth;
  try {
    const body = (await request.json()) as Partial<PaymentSettings>;
    const instruction = sanitizeText(body.instruction);
    const accounts = Array.isArray(body.accounts) ? body.accounts : [];
    const cleaned: BankAccount[] = [];
    for (const [index, account] of accounts.entries()) {
      const bank = sanitizeText(account.bank);
      const accountNumber = sanitizeText(account.accountNumber).replace(/\s/g, '');
      const accountName = sanitizeText(account.accountName);
      if (!bank || !accountNumber || !accountName) continue;
      cleaned.push({
        id: Number(account.id) || index + 1,
        bank,
        accountNumber,
        accountName,
      });
    }
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
