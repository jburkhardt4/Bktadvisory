import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';

// ---------------------------------------------------------------------------
// Mock the Supabase client so tests never hit the network
// vi.hoisted ensures the mocks are available when vi.mock factory runs
// ---------------------------------------------------------------------------
const {
  mockGetSession,
  mockOnAuthStateChange,
  mockSignInWithPassword,
  mockSignInWithOAuth,
  mockSignUp,
  mockSignOut,
  mockFrom,
  mockProfileSelect,
  mockProfileEq,
  mockProfileMaybeSingle,
  mockClearStoredSupabaseSession,
} = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
  mockSignInWithPassword: vi.fn(),
  mockSignInWithOAuth: vi.fn(),
  mockSignUp: vi.fn(),
  mockSignOut: vi.fn(),
  mockFrom: vi.fn(),
  mockProfileSelect: vi.fn(),
  mockProfileEq: vi.fn(),
  mockProfileMaybeSingle: vi.fn(),
  mockClearStoredSupabaseSession: vi.fn(),
}));

vi.mock('../supabase/client', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
      signUp: mockSignUp,
      signOut: mockSignOut,
    },
    from: mockFrom,
  },
  clearStoredSupabaseSession: mockClearStoredSupabaseSession,
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
    mockProfileMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockProfileEq.mockReturnValue({ maybeSingle: mockProfileMaybeSingle });
    mockProfileSelect.mockReturnValue({ eq: mockProfileEq });
    mockFrom.mockReturnValue({ select: mockProfileSelect });
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

  it('hydrates the admin role from the profiles table when present', async () => {
    const session = makeSession('admin@example.com');
    mockGetSession.mockResolvedValue({ data: { session } });
    mockProfileMaybeSingle.mockResolvedValue({ data: { role: 'admin' }, error: null });
    mockOnAuthStateChange.mockImplementation((cb) => {
      setTimeout(() => cb('SIGNED_IN', session), 0);
      return makeSubscription();
    });

    function TestConsumer() {
      const { loading, role } = useAuth();
      return (
        <div>
          <span data-testid="loading">{String(loading)}</span>
          <span data-testid="role">{role}</span>
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
    expect(screen.getByTestId('role').textContent).toBe('admin');
    expect(mockFrom).toHaveBeenCalledWith('profiles');
  });
});

// ---------------------------------------------------------------------------
// RequireAuth tests
// ---------------------------------------------------------------------------

describe('RequireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProfileMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockProfileEq.mockReturnValue({ maybeSingle: mockProfileMaybeSingle });
    mockProfileSelect.mockReturnValue({ eq: mockProfileEq });
    mockFrom.mockReturnValue({ select: mockProfileSelect });
    mockOnAuthStateChange.mockReturnValue(makeSubscription());
  });

  it('shows a spinner while the session is loading', () => {
    // getSession never resolves so stays in loading state
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

    render(
      <AuthProvider>
        <MemoryRouter
          initialEntries={['/portal']}
        >
          <RequireAuth>
            <div data-testid="protected">Protected content</div>
          </RequireAuth>
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
  beforeEach(() => {
    vi.clearAllMocks();
    mockProfileMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockProfileEq.mockReturnValue({ maybeSingle: mockProfileMaybeSingle });
    mockProfileSelect.mockReturnValue({ eq: mockProfileEq });
    mockFrom.mockReturnValue({ select: mockProfileSelect });
  });

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
    expect(mockClearStoredSupabaseSession).toHaveBeenCalledOnce();
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
    mockProfileMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockProfileEq.mockReturnValue({ maybeSingle: mockProfileMaybeSingle });
    mockProfileSelect.mockReturnValue({ eq: mockProfileEq });
    mockFrom.mockReturnValue({ select: mockProfileSelect });
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
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

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

// ---------------------------------------------------------------------------
// AuthPage — already-authenticated redirect
// ---------------------------------------------------------------------------
describe('AuthPage — already-authenticated redirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProfileMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockProfileEq.mockReturnValue({ maybeSingle: mockProfileMaybeSingle });
    mockProfileSelect.mockReturnValue({ eq: mockProfileEq });
    mockFrom.mockReturnValue({ select: mockProfileSelect });
    const session = makeSession();
    mockGetSession.mockResolvedValue({ data: { session } });
    mockOnAuthStateChange.mockImplementation((cb) => {
      setTimeout(() => cb('SIGNED_IN', session), 0);
      return makeSubscription();
    });
  });

  it('redirects to /portal when session is active and no from state', async () => {
    const { AuthPage } = await import('../components/AuthPage');

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/auth']}>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/portal" element={<div data-testid="portal-home">Portal</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('portal-home')).toBeInTheDocument(),
    );
  });

  it('redirects to location.state.from when set', async () => {
    const { AuthPage } = await import('../components/AuthPage');

    render(
      <AuthProvider>
        <MemoryRouter
          initialEntries={[{ pathname: '/auth', state: { from: '/portal/dashboard' } }]}
        >
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/portal/dashboard" element={<div data-testid="portal-dashboard">Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('portal-dashboard')).toBeInTheDocument(),
    );
  });

  it('does not redirect while auth is still loading', async () => {
    mockGetSession.mockReturnValue(new Promise(() => {}));

    const { AuthPage } = await import('../components/AuthPage');

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/auth']}>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/portal" element={<div data-testid="portal-home">Portal</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.queryByTestId('portal-home')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Approach A route map constraints
// ---------------------------------------------------------------------------
describe('Approach A route map constraints', () => {
  it('quote-related routes only exist inside the protected admin branch', async () => {
    const routerModule = await import('../routes');
    const routerConfig = routerModule.router;

    const portalRoute = routerConfig.routes.find((route) => route.path === '/portal');
    expect(portalRoute).toBeDefined();

    const portalChildren = portalRoute?.children ?? [];
    const adminRoute = portalChildren.find((route) => route.path === 'admin');

    expect(portalChildren.some((route) => route.path === 'quotes')).toBe(false);
    expect(adminRoute).toBeDefined();
    expect(adminRoute?.children?.some((route) => route.path === 'quotes')).toBe(true);
    expect(routerConfig.routes.some((route) => route.path === '/quotes')).toBe(false);
  });

  it('/estimator route exists as a boundary entry', async () => {
    const routerModule = await import('../routes');
    const routerConfig = routerModule.router;

    const paths: string[] = [];
    const collectPaths = (routes: Array<{ path?: string; children?: Array<{ path?: string }> }>) => {
      for (const route of routes) {
        if (route.path) paths.push(route.path);
        if (route.children) collectPaths(route.children);
      }
    };
    collectPaths(routerConfig.routes);

    expect(paths).toContain('/estimator');
  });
});
