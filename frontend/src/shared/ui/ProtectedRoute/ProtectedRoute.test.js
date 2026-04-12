import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import authReducer from '@features/auth-by-login/model/authSlice';
import ProtectedRoute from './ProtectedRoute';

const TestWrapper = ({ isAuthenticated }) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        token: isAuthenticated ? 'fake-token' : null,
        user: isAuthenticated ? { id: 1 } : null,
        isAuthenticated,
        loading: false,
        error: null,
      },
    },
  });

  return (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/auth" element={<div>Auth Page</div>} />
          <Route path="/protected" element={<ProtectedRoute />}>
            <Route index element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('ProtectedRoute', () => {
  it('should redirect to auth page when not authenticated', () => {
    render(<TestWrapper isAuthenticated={false} />);
    expect(screen.getByText('Auth Page')).toBeInTheDocument();
  });

  it('should show protected content when authenticated', () => {
    render(<TestWrapper isAuthenticated />);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
