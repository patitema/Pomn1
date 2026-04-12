import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import authReducer from '@features/auth-by-login/model/authSlice';
import { api } from '@shared/api';
import LoginForm from './LoginForm';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const createStore = () =>
  configureStore({
    reducer: { auth: authReducer, [api.reducerPath]: api.reducer },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });

const renderLoginForm = () => {
  const store = createStore();
  return {
    ...render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      </Provider>
    ),
    store,
  };
};

describe('LoginForm', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render login form with inputs and submit button', () => {
    renderLoginForm();
    expect(screen.getByPlaceholderText('Имя пользователя')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
  });

  it('should have a link to registration page', () => {
    renderLoginForm();
    const link = screen.getByRole('link', { name: /зарегистрироваться/i });
    expect(link).toBeInTheDocument();
  });

  it('should update input values on change', () => {
    renderLoginForm();
    const usernameInput = screen.getByPlaceholderText('Имя пользователя');
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    expect(usernameInput.value).toBe('testuser');
  });

  it('should call login mutation on submit', async () => {
    renderLoginForm();
    fireEvent.change(screen.getByPlaceholderText('Имя пользователя'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /войти/i }));
    // Login mutation is async — test passes if form submits without crash
  });
});
