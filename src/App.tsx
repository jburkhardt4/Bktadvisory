import { useState, useEffect } from "react";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { Estimator } from "./components/Estimator";
import { Quote } from "./components/Quote";
import { AIChatbot } from "./components/AIChatbot";
import { Toaster } from "sonner@2.0.3";
import { PWAHead } from "./components/PWAHead";

export interface FormData {
  // Contact Info
  firstName: string;
  lastName: string;
  companyName: string;
  website: string;
  workEmail: string;
  mobilePhone: string;

  // Project Details
  projectType: string;
  projectDescription: string;
  scopeProblems: string;
  scopeRequirements: string;
  scopeGoals: string;
  selectedCRMs: string[];
  selectedClouds: string[];
  selectedIntegrations: string[];
  selectedAITools: string[];
  additionalModules: string[];
  deliveryTeam: string;
  powerUps: string[];
  uploadedFiles: { name: string; size: number; type: string }[];
  valueStatement?: string;
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

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  companyName: "",
  website: "",
  workEmail: "",
  mobilePhone: "",
  projectType: "custom",
  projectDescription: "",
  scopeProblems: "",
  scopeRequirements: "",
  scopeGoals: "",
  selectedCRMs: [],
  selectedClouds: [],
  selectedIntegrations: [],
  selectedAITools: [],
  additionalModules: [],
  deliveryTeam: "nearshore",
  powerUps: [],
  uploadedFiles: [],
};

function App() {
  const [showQuote, setShowQuote] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(
    null,
  );
  const [formData, setFormData] =
    useState<FormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [aiActionTrigger, setAiActionTrigger] = useState<{
    type: "generate" | "autofill";
    timestamp: number;
  } | null>(null);
  const [aiUsageCount, setAiUsageCount] = useState({
    generate: 0,
    autofill: 0,
  }); // Track AI button usage

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

  const handleGenerateQuote = (data: QuoteData) => {
    setQuoteData(data);
    setShowQuote(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateToEstimator = () => {
    // Already on the estimator page, maybe reset?
    // For now, just scroll top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToEstimator = () => {
    setShowQuote(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToHome = () => {
    window.location.href = "https://bktadvisory.com";
  };

  const handleInsertPrompt = (prompt: string) => {
    setFormData((prev) => ({
      ...prev,
      projectDescription: prev.projectDescription
        ? `${prev.projectDescription}\n\n${prompt}`
        : prompt,
    }));
  };

  const handleAutofillData = (
    partialData: Partial<FormData>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      ...partialData,
      // Rule 3: Delivery Team defaults to Nearshore, Power-Ups unchecked
      deliveryTeam: partialData.deliveryTeam || "nearshore",
      powerUps: partialData.powerUps || [],
    }));
  };

  const handleTriggerAIAction = (
    type: "generate" | "autofill",
  ) => {
    // If 'generate', we need to pass context (scope, stacks) to the Chatbot/AI logic.
    // The current implementation uses `aiActionTrigger` state in App.tsx which is passed to AIChatbot.
    // AIChatbot listens to this trigger.
    // We need to ensure the logic in AIChatbot consumes the scope fields.
    setAiActionTrigger({ type, timestamp: Date.now() });
    setAiUsageCount((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PWAHead />
      <Navigation
        onNavigateToEstimator={handleNavigateToEstimator}
      />
      <Toaster />

      <main className="flex-grow flex flex-col">
        {!showQuote ? (
          <>
            <Estimator
              formData={formData}
              setFormData={setFormData}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              onGenerateQuote={handleGenerateQuote}
              onBackToHome={handleBackToHome}
              onTriggerAIAction={handleTriggerAIAction}
              aiUsageCount={aiUsageCount}
            />
            <AIChatbot
              currentPage="estimator"
              currentStep={currentStep}
              formData={formData}
              onInsertPrompt={handleInsertPrompt}
              onAutofill={handleAutofillData}
              aiActionTrigger={aiActionTrigger}
            />
          </>
        ) : (
          <>
            <Quote
              data={quoteData!}
              onBack={handleBackToEstimator}
            />
            <AIChatbot
              currentPage="quote"
              onInsertPrompt={handleInsertPrompt}
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;