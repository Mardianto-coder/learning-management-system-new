import { generateToken, toPublicUser } from './auth';
import { getSupabaseAdmin } from './supabase';
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

  if (existing?.authId) {
    const { error } = await db.auth.admin.updateUserById(existing.authId, { password: input.password });
    if (error) throw new Error(error.message);
    return withStore(async (store) => {
      const user = store.users.find((u) => u.id === existing.id);
      if (!user) throw new Error('User not found');
      user.name = input.name;
      user.role = input.role;
      return {
        message: 'Password updated successfully. You can now login with your new password.',
        user: toPublicUser(user),
        token: generateToken(user),
        status: 200,
      };
    });
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
      status: 201,
    };
  });
}

export async function loginWithSupabase(email: string, password: string, role: UserRole) {
  const db = getSupabaseAdmin();
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Invalid credentials');

  return withStoreRead(async (store) => {
    const user = store.users.find((u) => u.email.toLowerCase() === email);
    if (!user) throw new Error('Profil belum ada. Daftar ulang sekali lagi.');
    if (user.role !== role) throw new Error('Role mismatch');
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
