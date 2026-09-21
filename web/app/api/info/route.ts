import { json } from '@/lib/http';
import { getLanAddresses } from '@/lib/lan';
import { isSupabaseEnabled } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET() {
  return json({
    port: Number(process.env.PORT) || 3000,
    addresses: getLanAddresses(),
    supabase: isSupabaseEnabled(),
  });
}
