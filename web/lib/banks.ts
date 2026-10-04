import type { BankAccount } from './types';

export const SENDER_BANKS = [
  'BCA',
  'Bank Mandiri',
  'BRI',
  'BNI',
  'CIMB Niaga',
  'Permata',
  'Danamon',
  'BTN',
  'Bank Syariah Indonesia (BSI)',
  'SeaBank',
  'Bank Jago',
  'Lainnya',
];

export function dedupeBankAccounts(accounts: BankAccount[] | undefined | null): BankAccount[] {
  const seen = new Set<string>();
  const out: BankAccount[] = [];
  for (const account of accounts || []) {
    const bank = String(account.bank || '').trim();
    const accountNumber = String(account.accountNumber || '').replace(/\s/g, '');
    const accountName = String(account.accountName || '').trim();
    if (!bank || !accountNumber || !accountName) continue;
    const key = `${bank.toLowerCase()}|${accountNumber}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ id: out.length + 1, bank, accountNumber, accountName });
  }
  return out;
}
