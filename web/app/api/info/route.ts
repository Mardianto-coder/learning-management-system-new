import { json } from '@/lib/http';
import { getLanAddresses } from '@/lib/lan';
import { isJwtConfigured } from '@/lib/auth';
import { isSupabaseEnabled } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return json({
    port: Number(process.env.PORT) || 3000,
    addresses: getLanAddresses(),
    supabase: isSupabaseEnabled(),
    jwt: isJwtConfigured(),
    jwtDedicated: Boolean(String(process.env.JWT_SECRET ?? '').trim()),
  });
}
