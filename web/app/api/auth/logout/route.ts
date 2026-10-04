import { jsonClearSession } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  return jsonClearSession({ message: 'Logged out' });
}
