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

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'estimator' | 'quote'>('home');
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [estimatorPrompt, setEstimatorPrompt] = useState('');

  const handleGenerateQuote = (data: QuoteData) => {
    setQuoteData(data);
    setCurrentPage('quote');
  };

  const handleNavigateToEstimator = () => {
    setCurrentPage('estimator');
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
    setEstimatorPrompt(prompt);
    // If not already on estimator, go there
    if (currentPage !== 'estimator') {
      setCurrentPage('estimator');
    }
  };

  if (currentPage === 'estimator') {
    return (
      <>
        <Estimator 
          onGenerateQuote={handleGenerateQuote} 
          onBackToHome={handleNavigateToHome} 
          externalProjectDescription={estimatorPrompt}
        />
        <AIChatbot 
          currentPage="estimator" 
          onInsertPrompt={handleInsertPrompt}
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