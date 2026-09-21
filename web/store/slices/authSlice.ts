import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginUser, registerUser } from '@/lib/client-api';
import type { PublicUser, UserRole } from '@/lib/types';

interface AuthState {
  user: PublicUser | null;
  token: string | null;
  ready: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  ready: false,
  loading: false,
  error: null,
};

function persist(user: PublicUser | null, token: string | null) {
  if (typeof window === 'undefined') return;
  if (user && token) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  }
}

export const hydrateAuth = createAsyncThunk('auth/hydrate', async () => {
  if (typeof window === 'undefined') return { user: null, token: null };
  const token = localStorage.getItem('authToken');
  const raw = localStorage.getItem('currentUser');
  return {
    token,
    user: raw ? (JSON.parse(raw) as PublicUser) : null,
  };
});

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string; role: UserRole }) => {
    return loginUser(payload.email, payload.password, payload.role);
  },
);

export const registerAccount = createAsyncThunk(
  'auth/register',
  async (payload: { name: string; email: string; password: string; role: UserRole }) => {
    return registerUser(payload.name, payload.email, payload.password, payload.role);
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      persist(null, null);
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.ready = true;
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.ready = true;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        persist(action.payload.user, action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(registerAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        persist(action.payload.user, action.payload.token);
      })
      .addCase(registerAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
