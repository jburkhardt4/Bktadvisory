import { useEffect } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';

export const THEME_STORAGE_KEY = 'bkt-theme';

const LIGHT_THEME_COLOR = '#f8fafc';
const DARK_THEME_COLOR = '#0f172a';

function syncThemeColor(content: string) {
  let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;

  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    document.head.appendChild(themeColorMeta);
  }

  themeColorMeta.content = content;
}

function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    syncThemeColor(resolvedTheme === 'dark' ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
  }, [resolvedTheme]);

  return null;
}

function ThemeScopeCleanup() {
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.style.colorScheme = '';
      syncThemeColor(LIGHT_THEME_COLOR);
    };
  }, []);

  return null;
}

type ThemeProviderProps = {
  children: ReactNode;
} & Partial<ComponentProps<typeof NextThemesProvider>>;

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey={THEME_STORAGE_KEY}
      disableTransitionOnChange
      {...props}
    >
      <ThemeColorSync />
      <ThemeScopeCleanup />
      {children}
    </NextThemesProvider>
  );
}
