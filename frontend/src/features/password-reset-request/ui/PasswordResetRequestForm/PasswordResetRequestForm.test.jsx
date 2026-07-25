import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PasswordResetRequestForm from './PasswordResetRequestForm';


const apiMocks = vi.hoisted(() => ({
  requestPasswordReset: vi.fn(),
}));

vi.mock('@shared/api', () => ({
  useRequestPasswordResetMutation: () => [
    apiMocks.requestPasswordReset,
    { isLoading: false, error: undefined },
  ],
}));

describe('PasswordResetRequestForm', () => {
  beforeEach(() => {
    apiMocks.requestPasswordReset.mockReset();
  });

  it('submits email and shows the generic response', async () => {
    const message = (
      'Если аккаунт с таким email существует, '
      + 'мы отправили ссылку для восстановления пароля.'
    );
    apiMocks.requestPasswordReset.mockReturnValue({
      unwrap: () => Promise.resolve({ message }),
    });

    render(
      <MemoryRouter>
        <PasswordResetRequestForm />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', {
      name: 'Получить ссылку',
    }));

    expect(apiMocks.requestPasswordReset).toHaveBeenCalledWith({
      email: 'user@example.com',
    });
    expect(await screen.findByText(message)).toBeTruthy();
  });
});
