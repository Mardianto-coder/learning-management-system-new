'use client';

import { Provider } from 'react-redux';
import { useLayoutEffect } from 'react';
import { store } from '@/store';
import { hydrateAuth } from '@/store/slices/authSlice';
import { hydrateCart } from '@/store/slices/cartSlice';
import { fetchCourses } from '@/store/slices/coursesSlice';
import { useAppDispatch } from '@/store/hooks';

function AuthHydrator() {
  const dispatch = useAppDispatch();
  useLayoutEffect(() => {
    dispatch(hydrateAuth());
    dispatch(hydrateCart());
    dispatch(fetchCourses());
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
