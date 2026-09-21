'use client';

import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { store } from '@/store';
import { hydrateAuth } from '@/store/slices/authSlice';
import { hydrateCart } from '@/store/slices/cartSlice';
import { useAppDispatch } from '@/store/hooks';

function AuthHydrator() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(hydrateAuth());
    dispatch(hydrateCart());
  }, [dispatch]);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator />
      {children}
    </Provider>
  );
}
