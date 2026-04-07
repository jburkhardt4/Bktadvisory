import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Outlet, RouterProvider, createMemoryRouter } from 'react-router';
import { EnvironmentsPage } from '../components/EnvironmentsPage';
import { environmentManifest } from '../environments';

describe('EnvironmentsPage', () => {
  it('renders the /environments route for unauthenticated users', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <Outlet />,
          children: [{ path: 'environments', element: <EnvironmentsPage /> }],
        },
      ],
      { initialEntries: ['/environments'] },
    );

    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole('heading', {
        name: /see the product surfaces, boundaries, and last week of changes/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders all environment nodes from the manifest', () => {
    render(<EnvironmentsPage />);

    for (const environment of environmentManifest) {
      expect(screen.getAllByText(environment.label).length).toBeGreaterThan(0);
    }
  });

  it('shows protected-surface badges for authenticated and admin environments', () => {
    render(<EnvironmentsPage />);

    expect(screen.getByText('Authenticated')).toBeInTheDocument();
    expect(screen.getByText('Admin only')).toBeInTheDocument();
  });

  it('shows the estimator redirect relationship in the map view', () => {
    render(<EnvironmentsPage />);

    expect(
      screen.getByText(/redirect from \/estimator to https:\/\/estimator\.bktadvisory\.com/i),
    ).toBeInTheDocument();
  });

  it('shows grouped timeline entries for the requested last-week window', async () => {
    const user = userEvent.setup();
    render(<EnvironmentsPage />);

    await user.click(screen.getByRole('button', { name: 'Last 7 Days' }));

    expect(screen.getAllByText('2026-04-06').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2026-03-30').length).toBeGreaterThan(0);
  });
});
