import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';

// ---------------------------------------------------------------------------
// Mock the Supabase client so tests never hit the network
// vi.hoisted ensures the mocks are available when vi.mock factory runs
// ---------------------------------------------------------------------------
const {
  mockGetSession,
  mockOnAuthStateChange,
  mockSignInWithPassword,
  mockSignUp,
  mockSignOut,
} = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
  mockSignInWithPassword: vi.fn(),
  mockSignUp: vi.fn(),
  mockSignOut: vi.fn(),
}));

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
    },
  },
}));

// Import components AFTER setting up the mock so they pick up the mock module
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { RequireAuth } from '../components/RequireAuth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Builds the minimal subscription object Supabase's onAuthStateChange returns. */
const makeSubscription = () => ({
  data: { subscription: { unsubscribe: vi.fn() } },
});

/** Resolves to a minimal Supabase session-like object. */
const makeSession = (email = 'user@example.com') => ({
  user: { id: '1', email },
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
});

// ---------------------------------------------------------------------------
// AuthContext tests
// ---------------------------------------------------------------------------

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no active session, listener fires immediately with null
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockImplementation((cb) => {
      // Simulate immediate SIGNED_OUT event
      setTimeout(() => cb('SIGNED_OUT', null), 0);
      return makeSubscription();
    });
  });

  it('starts in loading state and resolves to unauthenticated', async () => {
    function TestConsumer() {
      const { session, loading } = useAuth();
      return (
        <div>
          <span data-testid="loading">{String(loading)}</span>
          <span data-testid="session">{session ? 'session' : 'null'}</span>
        </div>
      );
    }

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false'),
    );
    expect(screen.getByTestId('session').textContent).toBe('null');
  });

  it('exposes the session when Supabase returns one', async () => {
    const session = makeSession();
    mockGetSession.mockResolvedValue({ data: { session } });
    mockOnAuthStateChange.mockImplementation((cb) => {
      setTimeout(() => cb('SIGNED_IN', session), 0);
      return makeSubscription();
    });

    function TestConsumer() {
      const { session: s, loading } = useAuth();
      return (
        <div>
          <span data-testid="loading">{String(loading)}</span>
          <span data-testid="email">{s?.user.email ?? 'none'}</span>
        </div>
      );
    }

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false'),
    );
    expect(screen.getByTestId('email').textContent).toBe('user@example.com');
  });
});

// ---------------------------------------------------------------------------
// RequireAuth tests
// ---------------------------------------------------------------------------

describe('RequireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue(makeSubscription());
  });

  it('shows a spinner while the session is loading', () => {
    // getSession never resolves → stays in loading state
    mockGetSession.mockReturnValue(new Promise(() => {}));

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/portal']}>
          <RequireAuth>
            <div data-testid="protected">Protected content</div>
          </RequireAuth>
        </MemoryRouter>
      </AuthProvider>,
    );

    // The spinner is rendered as an element with animate-spin class
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).not.toBeNull();
    expect(screen.queryByTestId('protected')).toBeNull();
  });

  it('redirects unauthenticated users to /auth', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    const routes: string[] = [];
    function LocationCapture() {
      // Rendered inside MemoryRouter — just record navigations via state
      return null;
    }

    render(
      <AuthProvider>
        <MemoryRouter
          initialEntries={['/portal']}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <RequireAuth>
            <div data-testid="protected">Protected content</div>
          </RequireAuth>
          <LocationCapture />
        </MemoryRouter>
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.queryByTestId('protected')).toBeNull(),
    );
  });

  it('renders children when an active session exists', async () => {
    const session = makeSession();
    mockGetSession.mockResolvedValue({ data: { session } });
    mockOnAuthStateChange.mockImplementation((cb) => {
      setTimeout(() => cb('SIGNED_IN', session), 0);
      return makeSubscription();
    });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/portal']}>
          <RequireAuth>
            <div data-testid="protected">Protected content</div>
          </RequireAuth>
        </MemoryRouter>
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('protected')).toBeInTheDocument(),
    );
  });
});

// ---------------------------------------------------------------------------
// authSession helpers
// ---------------------------------------------------------------------------

describe('authSession helpers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getSession calls supabase.auth.getSession and returns the session', async () => {
    const session = makeSession();
    mockGetSession.mockResolvedValue({ data: { session } });

    const { getSession } = await import('../utils/authSession');
    const result = await getSession();
    expect(mockGetSession).toHaveBeenCalledOnce();
    expect(result).toEqual(session);
  });

  it('clearSession calls supabase.auth.signOut', async () => {
    mockSignOut.mockResolvedValue({});
    const { clearSession } = await import('../utils/authSession');
    await clearSession();
    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  it('onAuthChange subscribes and returns the subscription', async () => {
    const subscription = { unsubscribe: vi.fn() };
    mockOnAuthStateChange.mockReturnValue({ data: { subscription } });

    const { onAuthChange } = await import('../utils/authSession');
    const cb = vi.fn();
    const result = onAuthChange(cb);
    expect(mockOnAuthStateChange).toHaveBeenCalledWith(cb);
    expect(result).toBe(subscription);
  });
});

// ---------------------------------------------------------------------------
// AuthPage — signIn / signUp integration
// ---------------------------------------------------------------------------

describe('AuthPage Supabase integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockImplementation((cb) => {
      setTimeout(() => cb('SIGNED_OUT', null), 0);
      return makeSubscription();
    });
  });

  it('calls signInWithPassword with correct credentials on sign-in submit', async () => {
    mockSignInWithPassword.mockResolvedValue({ data: { session: null }, error: null });

    const { AuthPage } = await import('../components/AuthPage');
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/auth']}>
          <AuthPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    // Switch to sign-in mode
    await waitFor(() => screen.getByText('Sign In'));
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Fill credentials
    await user.type(screen.getByPlaceholderText('brandon@acme.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Min. 8 characters'), 'password123');

    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() =>
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      }),
    );
  });

  it('displays an error message when signInWithPassword fails', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid login credentials' },
    });

    const { AuthPage } = await import('../components/AuthPage');
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/auth']}>
          <AuthPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    // Switch to sign-in mode
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await user.type(screen.getByPlaceholderText('brandon@acme.com'), 'bad@example.com');
    await user.type(screen.getByPlaceholderText('Min. 8 characters'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() =>
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument(),
    );
  });
});
