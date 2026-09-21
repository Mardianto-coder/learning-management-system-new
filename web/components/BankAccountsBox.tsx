'use client';

import { useState } from 'react';
import type { PaymentSettings } from '@/lib/types';

export default function BankAccountsBox({ payment }: { payment: PaymentSettings | null }) {
  const [copied, setCopied] = useState<string>('');
  if (!payment?.accounts?.length) return null;

  async function copy(number: string) {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(number);
    } catch {
      setCopied('');
    }
  }

  return (
    <div className="bank-box">
      <h3>Rekening tujuan pembayaran</h3>
      <p>{payment.instruction}</p>
      {payment.accounts.map((account) => (
        <div className="bank-account" key={account.id}>
          <strong>{account.bank}</strong>
          <p>
            No. rekening: <code>{account.accountNumber}</code>
          </p>
          <p>a.n. {account.accountName}</p>
          <button type="button" className="btn btn-outline" onClick={() => copy(account.accountNumber)}>
            {copied === account.accountNumber ? 'Tersalin' : 'Salin nomor'}
          </button>
        </div>
      ))}
    </div>
  );
}
