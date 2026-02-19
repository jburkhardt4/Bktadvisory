import { useEffect } from 'react';
import logo from 'figma:asset/01ab4ddf9498ad72150c22c58a71c1af4fd5772b.png';

// BKT Advisory Icon Logo from Supabase Storage (public bucket)
// Square icon optimized for home screen display
const ICON_URL =
  'https://hjrvtzkktodoxigezxqy.supabase.co/storage/v1/object/public/Logos/BKT%20Advisory%20-%20Icon%20Logo.png';

/**
 * PWAHead - Injects all necessary meta tags and web manifest
 * for Progressive Web App / "Add to Home Screen" support on
 * iOS Safari, Android Chrome, and other mobile browsers.
 *
 * Uses the dedicated Icon Logo from Supabase Storage for home screen icons,
 * and the full logo (figma asset) for splash screens.
 */
export function PWAHead() {
  useEffect(() => {
    const cleanupElements: HTMLElement[] = [];

    const addMeta = (attrs: Record<string, string>) => {
      const attrSelectors = Object.entries(attrs)
        .filter(([key]) => key !== 'content')
        .map(([key, val]) => `[${key}="${val}"]`)
        .join('');
      const selector = attrSelectors ? `meta${attrSelectors}` : '';
      if (selector && document.querySelector(selector)) return;

      const meta = document.createElement('meta');
      Object.entries(attrs).forEach(([key, val]) => meta.setAttribute(key, val));
      document.head.appendChild(meta);
      cleanupElements.push(meta);
    };

    const addLink = (attrs: Record<string, string>) => {
      const attrSelectors = Object.entries(attrs)
        .filter(([key]) => key !== 'href')
        .map(([key, val]) => `[${key}="${val}"]`)
        .join('');
      const selector = attrSelectors ? `link${attrSelectors}` : '';
      if (selector && document.querySelector(selector)) return;

      const link = document.createElement('link');
      Object.entries(attrs).forEach(([key, val]) => link.setAttribute(key, val));
      document.head.appendChild(link);
      cleanupElements.push(link);
    };

    // ── iOS Safari - "Add to Home Screen" Support ──
    addMeta({ name: 'apple-mobile-web-app-capable', content: 'yes' });
    addMeta({ name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' });
    addMeta({ name: 'apple-mobile-web-app-title', content: 'BKT Advisory' });

    // Apple Touch Icons — use the dedicated square icon from Supabase Storage
    addLink({ rel: 'apple-touch-icon', href: ICON_URL });
    addLink({ rel: 'apple-touch-icon', sizes: '180x180', href: ICON_URL });
    addLink({ rel: 'apple-touch-icon', sizes: '152x152', href: ICON_URL });
    addLink({ rel: 'apple-touch-icon', sizes: '120x120', href: ICON_URL });

    // Also set the standard favicon to the icon
    addLink({ rel: 'icon', type: 'image/png', href: ICON_URL });

    // ── Android / Chrome - PWA Support ──
    addMeta({ name: 'theme-color', content: '#0f172a' });
    addMeta({ name: 'mobile-web-app-capable', content: 'yes' });

    // ── Microsoft / Windows ──
    addMeta({ name: 'msapplication-TileColor', content: '#0f172a' });
    addMeta({ name: 'msapplication-TileImage', content: ICON_URL });
    addMeta({ name: 'application-name', content: 'BKT Advisory' });

    // ── General meta for mobile optimization ──
    if (!document.querySelector('meta[name="viewport"]')) {
      addMeta({
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
      });
    }

    if (!document.querySelector('meta[name="description"]')) {
      addMeta({
        name: 'description',
        content: 'BKT Advisory - Technology Consulting & Project Estimation Platform',
      });
    }

    // ── Web App Manifest (dynamically injected) ──
    // Uses the Supabase Storage icon for Android home screen / PWA install
    const manifest = {
      name: 'BKT Advisory',
      short_name: 'BKT Advisory',
      description: 'Technology Consulting & Project Estimation Platform',
      start_url: '/',
      display: 'standalone',
      background_color: '#0f172a',
      theme_color: '#0f172a',
      orientation: 'portrait-primary',
      icons: [
        {
          src: ICON_URL,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: ICON_URL,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    };

    const existingManifest = document.querySelector('link[rel="manifest"]');
    if (existingManifest) {
      existingManifest.remove();
    }

    const manifestBlob = new Blob([JSON.stringify(manifest)], {
      type: 'application/json',
    });
    const manifestUrl = URL.createObjectURL(manifestBlob);
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = manifestUrl;
    document.head.appendChild(manifestLink);
    cleanupElements.push(manifestLink);

    // ── iOS Splash Screens ──
    // Uses the full BKT logo (figma asset) centered on a branded gradient background
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 1170;
        canvas.height = 2532;

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(0.5, '#1e293b');
        gradient.addColorStop(1, '#1e3a8a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const logoWidth = 300;
          const logoHeight = (img.height / img.width) * logoWidth;
          const x = (canvas.width - logoWidth) / 2;
          const y = (canvas.height - logoHeight) / 2;
          ctx.drawImage(img, x, y, logoWidth, logoHeight);

          const splashDataUrl = canvas.toDataURL('image/png');
          addLink({
            rel: 'apple-touch-startup-image',
            href: splashDataUrl,
            media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)',
          });
          addLink({
            rel: 'apple-touch-startup-image',
            href: splashDataUrl,
            media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)',
          });
          addLink({
            rel: 'apple-touch-startup-image',
            href: splashDataUrl,
            media: '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)',
          });
          addLink({
            rel: 'apple-touch-startup-image',
            href: splashDataUrl,
          });
        };
        img.src = logo;
      }
    } catch (e) {
      console.warn('PWA: Could not generate splash screen', e);
    }

    // Update document title
    if (!document.title || document.title === 'React App' || document.title === 'Vite App') {
      document.title = 'BKT Advisory';
    }

    // Cleanup on unmount
    return () => {
      cleanupElements.forEach((el) => {
        try {
          el.remove();
        } catch (e) {
          // Element may already be removed
        }
      });
      if (manifestUrl) {
        URL.revokeObjectURL(manifestUrl);
      }
    };
  }, []);

  return null;
}
