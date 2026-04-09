import { useState, useEffect } from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Estimator } from "./Estimator";
import { Quote } from "./Quote";
import { PersonaFunnel } from "./PersonaFunnel";
import { Toaster } from "sonner";
import { PWAHead } from "./PWAHead";
import { FormData, QuoteData, PersonaMode, PersonaRole, initialFormData } from "../types";
import { createLeadFromEstimator } from "./admin/salesCrmApi";

function resolveUrlPersona(): { mode: PersonaMode | null; role: PersonaRole | null; skip: boolean } {
  if (typeof window === 'undefined') return { mode: null, role: null, skip: false };
  const params = new URLSearchParams(window.location.search);
  const rawMode = params.get('mode');
  const rawRole = params.get('role');
  const skip = params.get('skip-funnel') === '1';
  const mode: PersonaMode | null =
    rawMode === 'lite' ? 'lite' : rawMode === 'enterprise' ? 'enterprise' : null;
  const validRoles: PersonaRole[] = ['business-owner', 'technical-lead', 'project-manager', 'other'];
  const role: PersonaRole | null = validRoles.includes(rawRole as PersonaRole)
    ? (rawRole as PersonaRole)
    : null;
  return { mode, role, skip };
}

export function EstimatorAppShell() {
  const urlPersona = resolveUrlPersona();

  const [showFunnel, setShowFunnel] = useState<boolean>(
    !urlPersona.skip && urlPersona.mode === null
  );
  const [personaMode, setPersonaMode] = useState<PersonaMode | null>(
    urlPersona.mode ?? (urlPersona.skip ? 'enterprise' : null)
  );
  const [personaRole, setPersonaRole] = useState<PersonaRole | null>(urlPersona.role);

  const [showQuote, setShowQuote] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [aiUsageCount, setAiUsageCount] = useState({
    generate: 0,
    autofill: 0,
  });

  // Remove "Skip to main content" link (likely in index.html)
  useEffect(() => {
    const removeSkipLink = () => {
      const links = document.querySelectorAll("a");
      links.forEach((link) => {
        if (
          link.textContent &&
          (link.textContent.includes("Skip to main content") ||
            link.textContent.includes("Skip to content"))
        ) {
          link.remove();
        }
      });
    };

    // Run immediately and after a short delay to catch any late injections
    removeSkipLink();
    setTimeout(removeSkipLink, 100);
  }, []);

  // Load Google Calendar Appointment Scheduler scripts globally
  useEffect(() => {
    try {
      // Add CSS link if not already present
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

      // Add JS script if not already present
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
    } catch (e) {
      console.warn("Failed to load Google Calendar scripts", e);
    }
  }, []);

  const handleFunnelComplete = (mode: PersonaMode, role: PersonaRole) => {
    setPersonaMode(mode);
    setPersonaRole(role);
    setShowFunnel(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGenerateQuote = (data: QuoteData) => {
    setQuoteData(data);
    setShowQuote(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Fire-and-forget: persist the lead for the admin pipeline
    createLeadFromEstimator({
      firstName: data.formData.firstName,
      lastName: data.formData.lastName,
      email: data.formData.workEmail,
      phone: data.formData.mobilePhone,
      companyName: data.formData.companyName,
      websiteUrl: data.formData.website,
    }).catch(() => {
      // Silently swallow — lead creation is best-effort and must not block the quote UX
    });
  };

  const handleNavigateToEstimator = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToEstimator = () => {
    setShowQuote(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToHome = () => {
    window.location.href = "https://bktadvisory.com";
  };

  const handleTriggerAIAction = (type: "generate" | "autofill") => {
    setAiUsageCount((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PWAHead />
      <Navigation onNavigateToEstimator={handleNavigateToEstimator} />
      <Toaster />

      <main className="flex-grow flex flex-col">
        {showFunnel ? (
          <PersonaFunnel onComplete={handleFunnelComplete} />
        ) : !showQuote ? (
          <Estimator
            formData={formData}
            setFormData={setFormData}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            onGenerateQuote={handleGenerateQuote}
            onBackToHome={handleBackToHome}
            onTriggerAIAction={handleTriggerAIAction}
            aiUsageCount={aiUsageCount}
            personaMode={personaMode}
            personaRole={personaRole}
          />
        ) : (
          <>
            <Quote data={quoteData!} onBack={handleBackToEstimator} personaMode={personaMode} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
