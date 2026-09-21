import type { NextConfig } from 'next';
import { config as loadEnv } from 'dotenv';
import path from 'path';

loadEnv({ path: path.join(__dirname, '..', '.env') });
loadEnv({ path: path.join(__dirname, '.env') });
loadEnv({ path: path.join(__dirname, '.env.local') });

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '..'),
};

export default nextConfig;
