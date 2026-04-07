import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { PersonaFunnel } from '../components/PersonaFunnel';
import { Estimator } from '../components/Estimator';
import type { PersonaMode, PersonaRole, FormData } from '../types';
import { initialFormData } from '../types';

// ---------------------------------------------------------------------------
// Mocks needed by Estimator
// ---------------------------------------------------------------------------
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));
vi.mock('motion/react', () => ({
  motion: new Proxy(
    {},
    {
      get: (_t: object, tag: string | symbol) => {
        const s = String(tag);
        return ({ children, ...rest }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) =>
          React.createElement(s as React.ElementType, rest, children);
      },
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ---------------------------------------------------------------------------
// Helper: render Estimator at step 1 with given persona
// ---------------------------------------------------------------------------
function renderEstimator(
  personaMode: PersonaMode | null = null,
  personaRole: PersonaRole | null = null,
  step = 1,
) {
  const formData: FormData = { ...initialFormData };
  const setFormData = vi.fn();
  const setCurrentStep = vi.fn();
  return render(
    <Estimator
      formData={formData}
      setFormData={setFormData}
      currentStep={step}
      setCurrentStep={setCurrentStep}
      onGenerateQuote={vi.fn()}
      onBackToHome={vi.fn()}
      onTriggerAIAction={vi.fn()}
      aiUsageCount={{ generate: 0, autofill: 0 }}
      personaMode={personaMode}
      personaRole={personaRole}
    />
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderFunnel(onComplete = vi.fn()) {
  return {
    user: userEvent.setup(),
    onComplete,
    ...render(<PersonaFunnel onComplete={onComplete} />),
  };
}

// ---------------------------------------------------------------------------
// Screen 1 — Mode selection
// ---------------------------------------------------------------------------

describe('PersonaFunnel — Screen 1 (mode selection)', () => {
  it('renders the mode-selection heading on mount', () => {
    renderFunnel();
    expect(
      screen.getByText('What kind of project are you scoping?'),
    ).toBeInTheDocument();
  });

  it('renders both mode cards', () => {
    renderFunnel();
    expect(screen.getByText('Quick Estimate')).toBeInTheDocument();
    expect(screen.getByText('Full Proposal')).toBeInTheDocument();
  });

  it('does not show role-selection heading on mount', () => {
    renderFunnel();
    expect(screen.queryByText("What's your role?")).not.toBeInTheDocument();
  });

  it('clicking Quick Estimate advances to Screen 2', async () => {
    const { user } = renderFunnel();
    await user.click(screen.getByText('Quick Estimate'));
    expect(screen.getByText("What's your role?")).toBeInTheDocument();
  });

  it('clicking Full Proposal advances to Screen 2', async () => {
    const { user } = renderFunnel();
    await user.click(screen.getByText('Full Proposal'));
    expect(screen.getByText("What's your role?")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Screen 2 — Role selection (arrived via Quick Estimate / lite)
// ---------------------------------------------------------------------------

describe('PersonaFunnel — Screen 2 (role selection, lite mode)', () => {
  async function setupScreen2(mode: 'lite' | 'enterprise' = 'lite') {
    const onComplete = vi.fn();
    const utils = render(<PersonaFunnel onComplete={onComplete} />);
    const user = userEvent.setup();

    const modeLabel = mode === 'lite' ? 'Quick Estimate' : 'Full Proposal';
    await user.click(screen.getByText(modeLabel));

    return { user, onComplete, ...utils };
  }

  it('renders all four role options', async () => {
    await setupScreen2();
    expect(screen.getByText('Business Owner')).toBeInTheDocument();
    expect(screen.getByText('Technical Lead')).toBeInTheDocument();
    expect(screen.getByText('Project Manager')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('Start Estimator button is disabled before a role is selected', async () => {
    await setupScreen2();
    expect(screen.getByText('Start Estimator').closest('button')).toBeDisabled();
  });

  it('Start Estimator button is enabled after selecting a role', async () => {
    const { user } = await setupScreen2();
    await user.click(screen.getByText('Business Owner'));
    expect(screen.getByText('Start Estimator').closest('button')).not.toBeDisabled();
  });

  it('calls onComplete with (lite, business-owner) when submitted', async () => {
    const { user, onComplete } = await setupScreen2('lite');
    await user.click(screen.getByText('Business Owner'));
    await user.click(screen.getByText('Start Estimator'));
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith<[PersonaMode, PersonaRole]>(
      'lite',
      'business-owner',
    );
  });

  it('calls onComplete with (enterprise, technical-lead) when submitted', async () => {
    const { user, onComplete } = await setupScreen2('enterprise');
    await user.click(screen.getByText('Technical Lead'));
    await user.click(screen.getByText('Start Estimator'));
    expect(onComplete).toHaveBeenCalledWith<[PersonaMode, PersonaRole]>(
      'enterprise',
      'technical-lead',
    );
  });

  it('calls onComplete with (lite, project-manager) when submitted', async () => {
    const { user, onComplete } = await setupScreen2('lite');
    await user.click(screen.getByText('Project Manager'));
    await user.click(screen.getByText('Start Estimator'));
    expect(onComplete).toHaveBeenCalledWith<[PersonaMode, PersonaRole]>(
      'lite',
      'project-manager',
    );
  });

  it('calls onComplete with (lite, other) when submitted', async () => {
    const { user, onComplete } = await setupScreen2('lite');
    await user.click(screen.getByText('Other'));
    await user.click(screen.getByText('Start Estimator'));
    expect(onComplete).toHaveBeenCalledWith<[PersonaMode, PersonaRole]>('lite', 'other');
  });

  it('Back button returns to Screen 1', async () => {
    const { user } = await setupScreen2();
    await user.click(screen.getByText('Back'));
    expect(screen.getByText('What kind of project are you scoping?')).toBeInTheDocument();
  });

  it('does not call onComplete when Back is clicked', async () => {
    const { user, onComplete } = await setupScreen2();
    await user.click(screen.getByText('Back'));
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('does not call onComplete when Start Estimator is disabled and clicked', async () => {
    const { user, onComplete } = await setupScreen2();
    // Button is disabled so click should not trigger
    const btn = screen.getByText('Start Estimator').closest('button') as HTMLButtonElement;
    await user.click(btn);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('selecting a different role updates the selection', async () => {
    const { user, onComplete } = await setupScreen2('lite');
    await user.click(screen.getByText('Business Owner'));
    await user.click(screen.getByText('Technical Lead'));
    await user.click(screen.getByText('Start Estimator'));
    expect(onComplete).toHaveBeenCalledWith<[PersonaMode, PersonaRole]>(
      'lite',
      'technical-lead',
    );
  });

  it('returns to Screen 1 and can re-select a mode then submit', async () => {
    const { user, onComplete } = await setupScreen2('lite');
    // Go back
    await user.click(screen.getByText('Back'));
    // Now choose enterprise instead
    await user.click(screen.getByText('Full Proposal'));
    await user.click(screen.getByText('Project Manager'));
    await user.click(screen.getByText('Start Estimator'));
    expect(onComplete).toHaveBeenCalledWith<[PersonaMode, PersonaRole]>(
      'enterprise',
      'project-manager',
    );
  });
});

// ---------------------------------------------------------------------------
// Adaptive Complexity — Step gating
// ---------------------------------------------------------------------------

describe('Adaptive Complexity — step gating (lite mode)', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollTo', vi.fn());
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: false, media: q, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('renders "Systems" step label in lite mode stepper', () => {
    renderEstimator('lite', 'business-owner');
    expect(screen.getAllByText('Systems').length).toBeGreaterThan(0);
    expect(screen.queryByText('Services')).not.toBeInTheDocument();
  });

  it('renders "Services" step label in enterprise mode stepper', () => {
    renderEstimator('enterprise', 'technical-lead');
    expect(screen.getAllByText('Services').length).toBeGreaterThan(0);
    expect(screen.queryByText('Systems')).not.toBeInTheDocument();
  });

  it('shows projectDescription textarea in lite mode Step 1', () => {
    renderEstimator('lite', 'business-owner', 1);
    expect(
      screen.getByPlaceholderText("Tell us what you're trying to build or automate. We'll handle the technical details.")
    ).toBeInTheDocument();
  });

  it('does not show projectDescription textarea in enterprise mode Step 1', () => {
    renderEstimator('enterprise', 'technical-lead', 1);
    expect(
      screen.queryByPlaceholderText("Tell us what you're trying to build or automate. We'll handle the technical details.")
    ).not.toBeInTheDocument();
  });

  it('Step 4 heading is "Your Systems" in lite mode', () => {
    renderEstimator('lite', 'business-owner', 4);
    expect(screen.getByText('Your Systems')).toBeInTheDocument();
  });

  it('MuleSoft is NOT present in lite mode Step 4', () => {
    renderEstimator('lite', 'business-owner', 4);
    expect(screen.queryByText('MuleSoft')).not.toBeInTheDocument();
  });

  it('MuleSoft IS present in enterprise mode Step 4', () => {
    renderEstimator('enterprise', 'technical-lead', 4);
    expect(screen.getByText('MuleSoft')).toBeInTheDocument();
  });

  it('Service Modules are visible in lite mode Step 4 (merged)', () => {
    renderEstimator('lite', 'business-owner', 4);
    expect(screen.getByText('Service Modules')).toBeInTheDocument();
    expect(screen.getByText('Workflow Automation')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Adaptive Complexity — Jargon removal
// ---------------------------------------------------------------------------

describe('Adaptive Complexity — jargon removal (business owner)', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollTo', vi.fn());
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: false, media: q, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('renders "Your Tools & Platforms" step label for business-owner in enterprise mode', () => {
    renderEstimator('enterprise', 'business-owner');
    expect(screen.getAllByText('Your Tools & Platforms').length).toBeGreaterThan(0);
  });

  it('renders "IT Infrastructure" step label for technical-lead', () => {
    renderEstimator('enterprise', 'technical-lead');
    expect(screen.getAllByText('IT Infrastructure').length).toBeGreaterThan(0);
  });

  it('renders "Connected Apps" integrations heading in enterprise Step 4 for business-owner', () => {
    renderEstimator('enterprise', 'business-owner', 4);
    expect(screen.getByText('Connected Apps')).toBeInTheDocument();
  });

  it('renders "Integrations" heading for technical-lead in enterprise Step 4', () => {
    renderEstimator('enterprise', 'technical-lead', 4);
    expect(screen.getByText('Integrations')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Adaptive Complexity — AI pre-fill (lite mode Step 1 textarea)
// ---------------------------------------------------------------------------

describe('Adaptive Complexity — AI pre-fill from description', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollTo', vi.fn());
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: false, media: q, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('calls setFormData with matched selections on blur when text contains a known CRM', () => {
    const setFormData = vi.fn();
    render(
      <Estimator
        formData={{ ...initialFormData }}
        setFormData={setFormData}
        currentStep={1}
        setCurrentStep={vi.fn()}
        onGenerateQuote={vi.fn()}
        onBackToHome={vi.fn()}
        onTriggerAIAction={vi.fn()}
        aiUsageCount={{ generate: 0, autofill: 0 }}
        personaMode="lite"
        personaRole="business-owner"
      />
    );
    const textarea = screen.getByPlaceholderText(
      "Tell us what you're trying to build or automate. We'll handle the technical details."
    );
    fireEvent.change(textarea, { target: { value: 'We use HubSpot and need Slack integration for our team.' } });
    fireEvent.blur(textarea);
    expect(setFormData).toHaveBeenCalled();
  });
});
