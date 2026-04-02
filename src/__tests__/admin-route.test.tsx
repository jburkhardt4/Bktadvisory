import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';

const { mockUseAuth } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

import { AdminRoute } from '../components/AdminRoute';

describe('AdminRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      session: {
        user: {
          id: 'user-1',
          email: 'client@example.com',
        },
      },
      loading: false,
      role: 'client',
    });
  });

  it('shows a loading spinner while auth state is still resolving', () => {
    mockUseAuth.mockReturnValue({
      session: null,
      loading: true,
      role: 'client',
    });

    render(
      <MemoryRouter initialEntries={['/portal/admin']}>
        <Routes>
          <Route
            path="/portal/admin"
            element={
              <AdminRoute>
                <div>Admin Area</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(document.querySelector('.animate-spin')).not.toBeNull();
    expect(screen.queryByText('Admin Area')).toBeNull();
  });

  it('redirects client users back to /portal', async () => {
    render(
      <MemoryRouter initialEntries={['/portal/admin']}>
        <Routes>
          <Route path="/portal" element={<div>Portal Home</div>} />
          <Route
            path="/portal/admin"
            element={
              <AdminRoute>
                <div>Admin Area</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Portal Home')).toBeInTheDocument();
    });
    expect(screen.queryByText('Admin Area')).toBeNull();
  });

  it('does not pass from state when redirecting non-admin to /portal', async () => {
    function LocationStateDisplay() {
      const { state } = useLocation();
      return (
        <div data-testid="state">
          {state ? JSON.stringify(state) : 'null'}
        </div>
      );
    }

    render(
      <MemoryRouter initialEntries={['/portal/admin']}>
        <Routes>
          <Route path="/portal" element={<LocationStateDisplay />} />
          <Route
            path="/portal/admin"
            element={
              <AdminRoute>
                <div>Admin Area</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('state')).toBeInTheDocument();
    });
    expect(screen.getByTestId('state').textContent).toBe('null');
  });

  it('renders admin children for admin users', () => {
    mockUseAuth.mockReturnValue({
      session: {
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
        },
      },
      loading: false,
      role: 'admin',
    });

    render(
      <MemoryRouter initialEntries={['/portal/admin']}>
        <Routes>
          <Route
            path="/portal/admin"
            element={
              <AdminRoute>
                <div>Admin Area</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Admin Area')).toBeInTheDocument();
  });
});
