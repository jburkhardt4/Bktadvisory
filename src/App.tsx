import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { StatsBar } from './components/StatsBar';
import { ServicesGrid } from './components/ServicesGrid';
import { SelectedWork } from './components/SelectedWork';
import { Process } from './components/Process';
import { About } from './components/About';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { Estimator } from './components/Estimator';
import { Quote } from './components/Quote';
import { BookingModal } from './components/BookingModal';
import { AIChatbot } from './components/AIChatbot';

export interface FormData {
  // Contact Info
  firstName: string;
  lastName: string;
  website: string;
  workEmail: string;
  mobilePhone: string;
  
  // Project Details
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

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  website: '',
  workEmail: '',
  mobilePhone: '',
  projectType: 'custom',
  projectDescription: '',
  selectedCRMs: [],
  selectedClouds: [],
  selectedIntegrations: [],
  selectedAITools: [],
  additionalModules: [],
  deliveryTeam: 'nearshore',
  powerUps: [],
};

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'estimator' | 'quote'>('home');
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [aiActionTrigger, setAiActionTrigger] = useState<{ type: 'generate' | 'autofill', timestamp: number } | null>(null);

  const handleGenerateQuote = (data: QuoteData) => {
    setQuoteData(data);
    setCurrentPage('quote');
  };

  const handleNavigateToEstimator = () => {
    setCurrentPage('estimator');
    // Ensure we start at step 1 if it's the first time or reset
    if (currentPage !== 'estimator') {
      setCurrentStep(1);
    }
  };

  const handleNavigateToHome = () => {
    setCurrentPage('home');
  };

  const handleBackToEstimator = () => {
    setCurrentPage('estimator');
  };

  const handleOpenBooking = () => {
    setIsBookingModalOpen(true);
  };

  const handleInsertPrompt = (prompt: string) => {
    setFormData(prev => ({ ...prev, projectDescription: prompt }));
    if (currentPage !== 'estimator') {
      setCurrentPage('estimator');
      setCurrentStep(2); // If they come from home with a prompt, take them to the details step
    }
  };

  const handleAutofillData = (partialData: Partial<FormData>) => {
    setFormData(prev => ({
      ...prev,
      ...partialData,
      // Rule 3: Delivery Team defaults to Nearshore, Power-Ups unchecked
      deliveryTeam: partialData.deliveryTeam || 'nearshore',
      powerUps: partialData.powerUps || [],
    }));
  };

  const handleTriggerAIAction = (type: 'generate' | 'autofill') => {
    setAiActionTrigger({ type, timestamp: Date.now() });
    // Open chatbot if closed? 
    // Actually, let's just let the chatbot handle it.
  };

  if (currentPage === 'estimator') {
    return (
      <>
        <Estimator 
          formData={formData}
          setFormData={setFormData}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onGenerateQuote={handleGenerateQuote} 
          onBackToHome={handleNavigateToHome}
          onTriggerAIAction={handleTriggerAIAction}
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
    );
  }

  if (currentPage === 'quote') {
    return (
      <>
        <Quote data={quoteData!} onBack={handleBackToEstimator} />
        <AIChatbot 
          currentPage="quote" 
          onInsertPrompt={handleInsertPrompt}
        />
      </>
    );
  }

  // Home page - full marketing site
  return (
    <div className="min-h-screen bg-white">
      <Navigation onNavigateToEstimator={handleNavigateToEstimator} onOpenBooking={handleOpenBooking} />
      <Hero onOpenBooking={handleOpenBooking} />
      <StatsBar />
      <div id="services">
        <ServicesGrid />
      </div>
      <div id="work">
        <SelectedWork />
      </div>
      <div id="process">
        <Process />
      </div>
      <div id="about">
        <About onOpenBooking={handleOpenBooking} />
      </div>
      <div id="contact">
        <FinalCTA onOpenBooking={handleOpenBooking} />
      </div>
      <Footer onOpenBooking={handleOpenBooking} />
      <BookingModal isOpen={isBookingModalOpen} onOpenChange={setIsBookingModalOpen} />
      <AIChatbot 
        currentPage="home" 
        onInsertPrompt={handleInsertPrompt}
      />
    </div>
  );
}

export default App;