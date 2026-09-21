import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Course } from '@/lib/types';
import { coursePrice, isPaidCourse } from '@/lib/types';

export interface CartItem {
  courseId: number;
  title: string;
  price: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = { items: [] };

function persist(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cartItems', JSON.stringify(items));
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrateCart(state) {
      if (typeof window === 'undefined') return;
      try {
        const raw = localStorage.getItem('cartItems');
        state.items = raw ? (JSON.parse(raw) as CartItem[]) : [];
      } catch {
        state.items = [];
      }
    },
    addToCart(state, action: PayloadAction<Course>) {
      const course = action.payload;
      if (!isPaidCourse(course)) return;
      if (state.items.some((item) => item.courseId === course.id)) return;
      state.items.push({ courseId: course.id, title: course.title, price: coursePrice(course) });
      persist(state.items);
    },
    removeFromCart(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.courseId !== action.payload);
      persist(state.items);
    },
    clearCart(state) {
      state.items = [];
      persist(state.items);
    },
  },
});

export const { hydrateCart, addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
