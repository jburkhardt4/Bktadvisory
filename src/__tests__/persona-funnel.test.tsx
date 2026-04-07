import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PersonaFunnel } from '../components/PersonaFunnel';
import type { PersonaMode, PersonaRole } from '../types';

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
