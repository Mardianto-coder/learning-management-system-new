import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAllCourses } from '@/lib/client-api';
import type { Course, CourseCategory } from '@/lib/types';

interface CoursesState {
  items: Course[];
  loading: boolean;
  error: string | null;
  search: string;
  category: CourseCategory | '';
}

const initialState: CoursesState = {
  items: [],
  loading: false,
  error: null,
  search: '',
  category: '',
};

export const fetchCourses = createAsyncThunk('courses/fetch', async () => getAllCourses());

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
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load courses';
      });
  },
});

export const { setSearch, setCategory } = coursesSlice.actions;
export default coursesSlice.reducer;
