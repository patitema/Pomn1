import { fireEvent, render, screen } from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom';
import PasswordResetConfirmForm from './PasswordResetConfirmForm';


const apiMocks = vi.hoisted(() => ({
  confirmPasswordReset: vi.fn(),
}));

vi.mock('@shared/api', () => ({
  useConfirmPasswordResetMutation: () => [
    apiMocks.confirmPasswordReset,
    { isLoading: false, error: undefined },
  ],
}));

const renderForm = () => render(
  <MemoryRouter initialEntries={['/password-reset/user-id/token-value']}>
    <Routes>
      <Route
        path="/password-reset/:uid/:token"
        element={<PasswordResetConfirmForm />}
      />
    </Routes>
  </MemoryRouter>,
);

describe('PasswordResetConfirmForm', () => {
  beforeEach(() => {
    apiMocks.confirmPasswordReset.mockReset();
  });

  it('rejects mismatched passwords before the API call', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('Новый пароль'), {
      target: { value: 'NewPassword_2' },
    });
    fireEvent.change(screen.getByLabelText('Повторите пароль'), {
      target: { value: 'Different_3' },
    });
    fireEvent.click(screen.getByRole('button', {
      name: 'Изменить пароль',
    }));

    expect(await screen.findByText('Пароли не совпадают')).toBeTruthy();
    expect(apiMocks.confirmPasswordReset).not.toHaveBeenCalled();
  });

  it('submits route secrets and shows success', async () => {
    apiMocks.confirmPasswordReset.mockReturnValue({
      unwrap: () => Promise.resolve({
        message: 'Пароль изменён. Войдите с новым паролем.',
      }),
    });
    renderForm();

    fireEvent.change(screen.getByLabelText('Новый пароль'), {
      target: { value: 'NewPassword_2' },
    });
    fireEvent.change(screen.getByLabelText('Повторите пароль'), {
      target: { value: 'NewPassword_2' },
    });
    fireEvent.click(screen.getByRole('button', {
      name: 'Изменить пароль',
    }));

    expect(apiMocks.confirmPasswordReset).toHaveBeenCalledWith({
      uid: 'user-id',
      token: 'token-value',
      new_password: 'NewPassword_2',
      confirm_password: 'NewPassword_2',
    });
    expect(await screen.findByText(
      'Пароль изменён. Войдите с новым паролем.',
    )).toBeTruthy();
  });
});
