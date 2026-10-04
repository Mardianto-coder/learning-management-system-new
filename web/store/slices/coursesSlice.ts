import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAllCourses } from '@/lib/client-api';
import type { Course, CourseCategory } from '@/lib/types';

const STALE_MS = 30_000;

interface CoursesState {
  items: Course[];
  loading: boolean;
  error: string | null;
  search: string;
  category: CourseCategory | '';
  fetchedAt: number;
}

const initialState: CoursesState = {
  items: [],
  loading: false,
  error: null,
  search: '',
  category: '',
  fetchedAt: 0,
};

export const fetchCourses = createAsyncThunk(
  'courses/fetch',
  async () => getAllCourses(),
  {
    condition: (_, { getState }) => {
      const { courses } = getState() as { courses: CoursesState };
      if (courses.loading) return false;
      if (courses.items.length && Date.now() - courses.fetchedAt < STALE_MS) return false;
      return true;
    },
  },
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setSearch(state, action: { payload: string }) {
      state.search = action.payload;
    },
    setCategory(state, action: { payload: CourseCategory | '' }) {
      state.category = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        if (!state.items.length) state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.fetchedAt = Date.now();
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load courses';
      });
  },
});

export const { setSearch, setCategory } = coursesSlice.actions;
export default coursesSlice.reducer;
