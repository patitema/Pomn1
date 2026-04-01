import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        localStorage.setItem('token', action.payload);
      } else {
        localStorage.removeItem('token');
      }
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login pending
      .addMatcher(
        (action) => action.type.endsWith('/login/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      // Login fulfilled
      .addMatcher(
        (action) => action.type.endsWith('/login/fulfilled'),
        (state, action) => {
          state.loading = false;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          localStorage.setItem('token', action.payload.token);
        }
      )
      // Login rejected
      .addMatcher(
        (action) => action.type.endsWith('/login/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.error.message;
        }
      )
      // Logout fulfilled
      .addMatcher(
        (action) => action.type.endsWith('/logout/fulfilled'),
        (state) => {
          state.token = null;
          state.user = null;
          state.isAuthenticated = false;
          localStorage.removeItem('token');
        }
      );
  },
});

export const { setToken, setUser, clearError, logout } = authSlice.actions;
export default authSlice.reducer;
