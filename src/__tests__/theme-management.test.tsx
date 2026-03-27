import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { ThemeProvider, THEME_STORAGE_KEY } from '../contexts/ThemeProvider';
import { SettingsModal } from '../components/portal/SettingsModal';

type MatchMediaListener = (event: MediaQueryListEvent) => void;

function installMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<MatchMediaListener>();

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: (_event: string, listener: MatchMediaListener) => {
        listeners.add(listener);
      },
      removeEventListener: (_event: string, listener: MatchMediaListener) => {
        listeners.delete(listener);
      },
      addListener: (listener: MatchMediaListener) => {
        listeners.add(listener);
      },
      removeListener: (listener: MatchMediaListener) => {
        listeners.delete(listener);
      },
      dispatchEvent: (_event: Event) => true,
    } as MediaQueryList),
  });

  return {
    setMatches(nextMatches: boolean) {
      matches = nextMatches;
      const event = {
        matches: nextMatches,
        media: '(prefers-color-scheme: dark)',
      } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  };
}

function renderAppearanceSettings() {
  return render(
    <ThemeProvider>
      <SettingsModal open onClose={() => {}} initialCategory="appearance" />
    </ThemeProvider>,
  );
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.className = '';
  document.documentElement.style.colorScheme = '';
});

describe('theme management', () => {
  it('persists manual theme selection and updates the html class', async () => {
    installMatchMedia(false);
    const user = userEvent.setup();

    renderAppearanceSettings();

    await user.click(await screen.findByRole('button', { name: 'Dark' }));

    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    await user.click(screen.getByRole('button', { name: 'Light' }));

    await waitFor(() => {
      expect(document.documentElement).not.toHaveClass('dark');
    });
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('tracks system preference changes when system mode is selected', async () => {
    const media = installMatchMedia(true);
    const user = userEvent.setup();

    renderAppearanceSettings();

    await user.click(await screen.findByRole('button', { name: 'System' }));

    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('system');

    media.setMatches(false);

    await waitFor(() => {
      expect(document.documentElement).not.toHaveClass('dark');
    });
  });
});
