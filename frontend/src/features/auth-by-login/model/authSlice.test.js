import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setToken, setUser, clearError, logout } from './authSlice';

const createStore = (preloadedState = {}) =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState,
  });

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('initialState', () => {
    it('should have null token and false isAuthenticated when no token in localStorage', () => {
      const store = createStore();
      const state = store.getState().auth;
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });

  describe('setToken', () => {
    it('should save token to state and localStorage', () => {
      const store = createStore();
      store.dispatch(setToken('test-token-123'));
      const state = store.getState().auth;
      expect(state.token).toBe('test-token-123');
      expect(state.isAuthenticated).toBe(true);
      expect(localStorage.getItem('token')).toBe('test-token-123');
    });

    it('should remove token from localStorage when payload is null', () => {
      localStorage.setItem('token', 'old-token');
      const store = createStore();
      store.dispatch(setToken(null));
      const state = store.getState().auth;
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('setUser', () => {
    it('should save user data to state', () => {
      const store = createStore();
      const userData = { id: 1, username: 'testuser', email: 'test@example.com' };
      store.dispatch(setUser(userData));
      expect(store.getState().auth.user).toEqual(userData);
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      const store = createStore({
        auth: { error: 'Some error', token: null, user: null, isAuthenticated: false, loading: false },
      });
      store.dispatch(clearError());
      expect(store.getState().auth.error).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear all auth state and localStorage', () => {
      localStorage.setItem('token', 'active-token');
      const store = createStore({
        auth: {
          token: 'active-token',
          user: { id: 1, username: 'testuser' },
          isAuthenticated: true,
          loading: false,
          error: 'some error',
        },
      });
      store.dispatch(logout());
      const state = store.getState().auth;
      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});
