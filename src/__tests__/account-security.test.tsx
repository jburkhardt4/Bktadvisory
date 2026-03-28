import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';

const {
  mockUseAuth,
  mockSignInWithPassword,
  mockUpdateUser,
  mockResetPasswordForEmail,
  mockOnAuthStateChange,
  mockSignOut,
  mockSignUp,
  mockSignInWithOAuth,
  mockToastSuccess,
  mockToastError,
} = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockSignInWithPassword: vi.fn(),
  mockUpdateUser: vi.fn(),
  mockResetPasswordForEmail: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
  mockSignOut: vi.fn(),
  mockSignUp: vi.fn(),
  mockSignInWithOAuth: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('../supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      updateUser: mockUpdateUser,
      resetPasswordForEmail: mockResetPasswordForEmail,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
      signUp: mockSignUp,
      signInWithOAuth: mockSignInWithOAuth,
    },
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

import { AccountSecurityPanel } from '../components/portal/AccountSecurityPanel';
import { AuthPage } from '../components/AuthPage';

function makeSubscription() {
  return {
    data: {
      subscription: {
        unsubscribe: vi.fn(),
      },
    },
  };
}

describe('account security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      session: {
        user: {
          email: 'user@example.com',
        },
      },
      loading: false,
      role: 'client',
    });
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    });
    mockUpdateUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });
    mockResetPasswordForEmail.mockResolvedValue({
      data: {},
      error: null,
    });
    mockOnAuthStateChange.mockReturnValue(makeSubscription());
    mockSignOut.mockResolvedValue({ error: null });
    mockSignUp.mockResolvedValue({ data: { user: null }, error: null });
    mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });
  });

  it('shows a validation error and skips Supabase calls when the new passwords do not match', async () => {
    const user = userEvent.setup();
    const { container } = render(<AccountSecurityPanel />);
    const passwordInputs = container.querySelectorAll('input[type="password"]');

    await user.type(passwordInputs[0]!, 'CurrentPassword123');
    await user.type(passwordInputs[1]!, 'NewPassword123');
    await user.type(passwordInputs[2]!, 'DifferentPassword123');
    await user.click(screen.getByRole('button', { name: 'Change Password' }));

    expect(await screen.findByText('New passwords must match.')).toBeInTheDocument();
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(mockToastError).toHaveBeenCalledWith('Please correct the highlighted password fields.');
  });

  it('verifies the current password, updates the password, and clears the form on success', async () => {
    const user = userEvent.setup();
    const { container } = render(<AccountSecurityPanel />);
    const passwordInputs = container.querySelectorAll('input[type="password"]');

    await user.type(passwordInputs[0]!, 'CurrentPassword123');
    await user.type(passwordInputs[1]!, 'NewPassword123');
    await user.type(passwordInputs[2]!, 'NewPassword123');
    await user.click(screen.getByRole('button', { name: 'Change Password' }));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'CurrentPassword123',
      });
    });
    expect(mockUpdateUser).toHaveBeenCalledWith({
      password: 'NewPassword123',
    });
    expect(mockToastSuccess).toHaveBeenCalledWith('Password updated successfully.');
    expect(passwordInputs[0]).toHaveValue('');
    expect(passwordInputs[1]).toHaveValue('');
    expect(passwordInputs[2]).toHaveValue('');
  });

  it('sends a reset email from the sign-in screen and shows a check-email notice', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    await user.type(screen.getByPlaceholderText('brandon@acme.com'), 'casey@example.com');
    await user.click(screen.getByRole('button', { name: 'Forgot password?' }));

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        'casey@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/auth?flow=recovery'),
        }),
      );
    });

    expect(
      screen.getByText('Check casey@example.com for your password reset link.'),
    ).toBeInTheDocument();
  });

  it('handles the PASSWORD_RECOVERY event and lets the user save a new password', async () => {
    const user = userEvent.setup();

    mockOnAuthStateChange.mockImplementation((callback) => {
      setTimeout(() => {
        callback('PASSWORD_RECOVERY', {
          user: {
            email: 'recovery@example.com',
          },
        });
      }, 0);

      return makeSubscription();
    });

    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Reset your password' })).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Min. 8 characters'), 'RecoveredPass123');
    await user.type(screen.getByPlaceholderText('Repeat your new password'), 'RecoveredPass123');
    await user.click(screen.getByRole('button', { name: 'Update Password' }));

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'RecoveredPass123',
      });
    });
    expect(mockSignOut).toHaveBeenCalled();
    expect(
      await screen.findByText('Password updated. Sign in with your new password.'),
    ).toBeInTheDocument();
  });
});
