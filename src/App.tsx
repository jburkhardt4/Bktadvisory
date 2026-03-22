import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";

// BKT icon from Supabase Storage (Logos bucket)
const BKT_ICON_URL =
  "https://hjrvtzkktodoxigezxqy.supabase.co/storage/v1/object/public/Logos/BKT%20Advisory%20-%20Icon%20Logo.png";

// Shared type exports (used by Estimator PWA components if present)
export interface FormData {
  firstName: string;
  lastName: string;
  website: string;
  workEmail: string;
  mobilePhone: string;
  projectType: string;
  projectDescription: string;
  selectedCRMs: string[];
  selectedClouds: string[];
  selectedIntegrations: string[];
  selectedAITools: string[];
  additionalModules: string[];
  deliveryTeam: string;
  powerUps: string[];
}

export interface QuoteData {
  formData: FormData;
  baseHours: number;
  complexityMultiplier: number;
  adjustedHours: number;
  adminRate: number;
  developerRate: number;
  baseBlendedRate: number;
  powerUpRate: number;
  finalHourlyRate: number;
  totalCost: number;
  estimatedWeeks: number;
}

function App() {
  // Load Google Calendar Appointment Scheduler scripts globally
  useEffect(() => {
    if (
      !document.querySelector(
        'link[href*="calendar.google.com/calendar/scheduling-button-script.css"]',
      )
    ) {
      const link = document.createElement("link");
      link.href =
        "https://calendar.google.com/calendar/scheduling-button-script.css";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    if (
      !document.querySelector(
        'script[src*="calendar.google.com/calendar/scheduling-button-script.js"]',
      )
    ) {
      const script = document.createElement("script");
      script.src =
        "https://calendar.google.com/calendar/scheduling-button-script.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Set up Home Screen icon (apple-touch-icon) and web app manifest
  useEffect(() => {
    // Apple Touch Icon for iOS Home Screen
    if (
      !document.querySelector('link[rel="apple-touch-icon"]')
    ) {
      const appleTouchIcon = document.createElement("link");
      appleTouchIcon.rel = "apple-touch-icon";
      appleTouchIcon.sizes = "180x180";
      appleTouchIcon.href = BKT_ICON_URL;
      document.head.appendChild(appleTouchIcon);
    }

    // Standard favicon / shortcut icon
    if (
      !document.querySelector(
        'link[rel="icon"][type="image/png"]',
      )
    ) {
      const favicon = document.createElement("link");
      favicon.rel = "icon";
      favicon.type = "image/png";
      favicon.sizes = "192x192";
      favicon.href = BKT_ICON_URL;
      document.head.appendChild(favicon);
    }

    // Apple mobile web app meta tags
    if (
      !document.querySelector(
        'meta[name="apple-mobile-web-app-capable"]',
      )
    ) {
      const capable = document.createElement("meta");
      capable.name = "apple-mobile-web-app-capable";
      capable.content = "yes";
      document.head.appendChild(capable);
    }

    if (
      !document.querySelector(
        'meta[name="apple-mobile-web-app-status-bar-style"]',
      )
    ) {
      const statusBar = document.createElement("meta");
      statusBar.name = "apple-mobile-web-app-status-bar-style";
      statusBar.content = "black-translucent";
      document.head.appendChild(statusBar);
    }

    if (
      !document.querySelector(
        'meta[name="apple-mobile-web-app-title"]',
      )
    ) {
      const title = document.createElement("meta");
      title.name = "apple-mobile-web-app-title";
      title.content = "BKT Advisory";
      document.head.appendChild(title);
    }

    // Web App Manifest for Android Home Screen
    if (!document.querySelector('link[rel="manifest"]')) {
      const manifest = {
        name: "BKT Advisory",
        short_name: "BKT Advisory",
        start_url: "/",
        display: "standalone",
        background_color: "#0F172B",
        theme_color: "#1d4ed8",
        icons: [
          {
            src: BKT_ICON_URL,
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: BKT_ICON_URL,
            sizes: "512x512",
            type: "image/png",
          },
        ],
      };
      const blob = new Blob([JSON.stringify(manifest)], {
        type: "application/json",
      });
      const manifestUrl = URL.createObjectURL(blob);
      const manifestLink = document.createElement("link");
      manifestLink.rel = "manifest";
      manifestLink.href = manifestUrl;
      document.head.appendChild(manifestLink);
    }

    // Theme color meta tag
    if (!document.querySelector('meta[name="theme-color"]')) {
      const themeColor = document.createElement("meta");
      themeColor.name = "theme-color";
      themeColor.content = "#1d4ed8";
      document.head.appendChild(themeColor);
    }
  }, []);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;