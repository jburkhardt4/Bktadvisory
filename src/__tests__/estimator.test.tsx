import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router';

// ---------------------------------------------------------------------------
// Hoist mock factories (must be available inside vi.mock() factory functions)
// ---------------------------------------------------------------------------
const {
  mockUseAuth,
  mockGetSession,
  mockOnAuthStateChange,
  mockFrom,
  mockProfileMaybeSingle,
  mockProfileEq,
  mockProfileSelect,
} = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
  mockFrom: vi.fn(),
  mockProfileMaybeSingle: vi.fn(),
  mockProfileEq: vi.fn(),
  mockProfileSelect: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Mocks — all vi.mock() calls must come before component imports
// ---------------------------------------------------------------------------

vi.mock('../contexts/AuthContext', () => ({
  useAuth: mockUseAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../supabase/client', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: mockFrom,
  },
  clearStoredSupabaseSession: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

// Quote.tsx imports these at the top level; mock to prevent browser API errors in jsdom
vi.mock('docx', () => ({
  Document: vi.fn(),
  Paragraph: vi.fn(),
  TextRun: vi.fn(),
  HeadingLevel: {},
  AlignmentType: {},
  BorderStyle: {},
  ShadingType: {},
  Packer: { toBlob: vi.fn().mockResolvedValue(new Blob()) },
  Table: vi.fn(),
  TableRow: vi.fn(),
  TableCell: vi.fn(),
  WidthType: {},
  TableLayoutType: {},
}));

vi.mock('jspdf', () => ({
  default: vi.fn(() => ({
    addImage: vi.fn(),
    save: vi.fn(),
    addPage: vi.fn(),
    internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
  })),
}));

vi.mock('html-to-image', () => ({
  toPng: vi.fn().mockResolvedValue('data:image/png;base64,'),
  toCanvas: vi.fn().mockResolvedValue(document.createElement('canvas')),
}));

vi.mock('pizzip', () => ({ default: vi.fn(() => ({})) }));
vi.mock('docxtemplater', () => ({ default: vi.fn(() => ({ render: vi.fn(), getZip: vi.fn(() => ({ generate: vi.fn(() => new Blob()) })) })) }));

// motion/react: passthrough proxy so animation components render their children normally
vi.mock('motion/react', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string | symbol) => {
        const tagStr = String(tag);
        return ({ children, ...rest }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) =>
          React.createElement(tagStr as React.ElementType, rest, children);
      },
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ---------------------------------------------------------------------------
// Component imports — AFTER all vi.mock() calls
// ---------------------------------------------------------------------------
import { Quote } from '../components/Quote';
import { EstimatorAppShell } from '../components/EstimatorAppShell';
import type { QuoteData } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const makeSubscription = () => ({
  data: { subscription: { unsubscribe: vi.fn() } },
});

function makeMinimalQuoteData(): QuoteData {
  return {
    formData: {
      firstName: 'Jane',
      lastName: 'Doe',
      companyName: '',
      website: '',
      workEmail: 'jane@example.com',
      mobilePhone: '',
      projectType: 'custom',
      projectDescription: '',
      scopeProblems: 'Test problem',
      scopeRequirements: '',
      scopeGoals: '',
      selectedCRMs: [],
      selectedClouds: [],
      selectedIntegrations: [],
      selectedAITools: [],
      additionalModules: [],
      deliveryTeam: 'nearshore',
      powerUps: [],
      uploadedFiles: [],
    },
    baseHours: 100,
    complexityMultiplier: 1,
    adjustedHours: 100,
    adminRate: 75,
    developerRate: 100,
    baseBlendedRate: 87,
    powerUpRate: 0,
    finalHourlyRate: 87,
    totalCost: 8700,
    estimatedWeeks: 4,
  };
}

// ---------------------------------------------------------------------------
// Global test setup
// ---------------------------------------------------------------------------
beforeEach(() => {
  vi.clearAllMocks();

  mockUseAuth.mockReturnValue({ session: null, loading: false, role: 'client' });
  mockGetSession.mockResolvedValue({ data: { session: null } });
  mockOnAuthStateChange.mockReturnValue(makeSubscription());
  mockProfileMaybeSingle.mockResolvedValue({ data: null, error: null });
  mockProfileEq.mockReturnValue({ maybeSingle: mockProfileMaybeSingle });
  mockProfileSelect.mockReturnValue({ eq: mockProfileEq });
  mockFrom.mockReturnValue({ select: mockProfileSelect });

  // jsdom doesn't implement window.scrollTo or window.matchMedia
  vi.stubGlobal('scrollTo', vi.fn());
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

// ---------------------------------------------------------------------------
// Suite 1: Quote — persona-driven title rendering
// ---------------------------------------------------------------------------
describe('Quote persona title rendering', () => {
  it('renders "Quick Estimate" summaryTitle for lite persona', () => {
    render(<Quote data={makeMinimalQuoteData()} onBack={vi.fn()} personaMode="lite" />);
    expect(screen.getAllByText('Quick Estimate').length).toBeGreaterThan(0);
  });

  it('renders "Scope Summary" scopeTitle for lite persona', () => {
    render(<Quote data={makeMinimalQuoteData()} onBack={vi.fn()} personaMode="lite" />);
    expect(screen.getAllByText('Scope Summary').length).toBeGreaterThan(0);
  });

  it('renders "Enterprise Proposal" summaryTitle for enterprise persona', () => {
    render(<Quote data={makeMinimalQuoteData()} onBack={vi.fn()} personaMode="enterprise" />);
    expect(screen.getAllByText('Enterprise Proposal').length).toBeGreaterThan(0);
  });

  it('renders "Enterprise Scope of Work" scopeTitle for enterprise persona', () => {
    render(<Quote data={makeMinimalQuoteData()} onBack={vi.fn()} personaMode="enterprise" />);
    expect(screen.getAllByText('Enterprise Scope of Work').length).toBeGreaterThan(0);
  });

  it('renders "Professional Services Quote" summaryTitle when personaMode is null', () => {
    render(<Quote data={makeMinimalQuoteData()} onBack={vi.fn()} personaMode={null} />);
    expect(screen.getAllByText('Professional Services Quote').length).toBeGreaterThan(0);
  });

  it('renders "Detailed Scope of Work" scopeTitle when personaMode is null', () => {
    render(<Quote data={makeMinimalQuoteData()} onBack={vi.fn()} personaMode={null} />);
    expect(screen.getAllByText('Detailed Scope of Work').length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Suite 2: EstimatorAppShell — step 1 content (funnel bypassed via URL param)
// ---------------------------------------------------------------------------
describe('EstimatorAppShell step 1 content', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, search: '?skip-funnel=1' },
      writable: true,
    });
  });

  it('renders step 1 heading "Let\'s Get Started"', async () => {
    render(<MemoryRouter><EstimatorAppShell /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText("Let's Get Started")).toBeInTheDocument();
    });
  });

  it('renders the First Name input field on step 1', async () => {
    render(<MemoryRouter><EstimatorAppShell /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Suite 3: EstimatorAppShell — PersonaFunnel visibility and flow
// ---------------------------------------------------------------------------
describe('EstimatorAppShell PersonaFunnel', () => {
  it('shows PersonaFunnel when no URL params are present', () => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, search: '' },
      writable: true,
    });

    render(<MemoryRouter><EstimatorAppShell /></MemoryRouter>);
    expect(screen.getByText('What kind of project are you scoping?')).toBeInTheDocument();
  });

  it('hides PersonaFunnel and shows Estimator after completing the funnel', async () => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, search: '' },
      writable: true,
    });

    const user = userEvent.setup();
    render(<MemoryRouter><EstimatorAppShell /></MemoryRouter>);

    // Screen 1: click "Quick Estimate" card → auto-advances to screen 2
    await user.click(screen.getByText('Quick Estimate'));

    // Screen 2: select "Business Owner" role
    await user.click(screen.getByText('Business Owner'));

    // Screen 2: click "Start Estimator"
    await user.click(screen.getByRole('button', { name: /start estimator/i }));

    await waitFor(() => {
      expect(screen.queryByText('What kind of project are you scoping?')).toBeNull();
      expect(screen.getByText("Let's Get Started")).toBeInTheDocument();
    });
  });
});
