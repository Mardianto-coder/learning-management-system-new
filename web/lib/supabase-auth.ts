import { generateToken, toPublicUser } from './auth';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin, getSupabaseServiceKey, getSupabaseUrl } from './supabase';
import { withStore, withStoreRead } from './storage';
import type { User, UserRole } from './types';

export async function registerWithSupabase(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  const db = getSupabaseAdmin();
  const existing = await withStoreRead((store) => store.users.find((u) => u.email.toLowerCase() === input.email));
  if (existing) {
    throw new Error('Email sudah terdaftar. Silakan login');
  }

  const created = await db.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { name: input.name, role: input.role },
  });
  if (created.error || !created.data.user) {
    throw new Error(created.error?.message || 'Gagal membuat akun Supabase');
  }

  return withStore(async (store) => {
    const user: User = {
      id: store.counters.nextUserId++,
      name: input.name,
      email: input.email,
      role: input.role,
      createdAt: new Date().toISOString(),
      authId: created.data.user!.id,
    };
    store.users.push(user);
    return {
      message: 'User registered successfully',
      user: toPublicUser(user),
      token: generateToken(user),
      status: 201 as const,
    };
  });
}

export async function loginWithSupabase(email: string, password: string, role?: UserRole) {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceKey();
  const authClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { error } = await authClient.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Invalid credentials');

  return withStoreRead(async (store) => {
    const user = store.users.find((u) => u.email.toLowerCase() === email);
    if (!user) throw new Error('Profil belum ada. Daftar ulang sekali lagi.');
    if (role && user.role !== role) {
      throw new Error(
        role === 'admin'
          ? 'Akun ini terdaftar sebagai siswa/mahasiswa. Pilih peran yang sesuai.'
          : 'Akun ini terdaftar sebagai admin/dosen. Pilih peran yang sesuai.',
      );
    }
    return {
      message: 'Login successful',
      user: toPublicUser(user),
      token: generateToken(user),
    };
  });
}

export async function updateSupabasePassword(authId: string, password: string) {
  const db = getSupabaseAdmin();
  const { error } = await db.auth.admin.updateUserById(authId, { password });
  if (error) throw new Error(error.message);
}

export async function updateSupabaseEmail(authId: string, email: string) {
  const db = getSupabaseAdmin();
  const { error } = await db.auth.admin.updateUserById(authId, { email, email_confirm: true });
  if (error) throw new Error(error.message);
}
