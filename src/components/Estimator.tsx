import { useState, useEffect, useRef } from 'react';
import { FormData, QuoteData } from '../App';
import { ArrowRight, Calculator, Home, Sparkles, Wand2 } from 'lucide-react';

interface EstimatorProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  onGenerateQuote: (data: QuoteData) => void;
  onBackToHome: () => void;
  onTriggerAIAction: (type: 'generate' | 'autofill') => void;
  aiUsageCount: { generate: number; autofill: number };
}

export function Estimator({ 
  formData, 
  setFormData, 
  currentStep, 
  setCurrentStep, 
  onGenerateQuote, 
  onBackToHome,
  onTriggerAIAction,
  aiUsageCount
}: EstimatorProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scrollOpacity, setScrollOpacity] = useState(1);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Pricing configuration - LEANER ESTIMATES
  const crmHours: Record<string, number> = {
    'Salesforce': 50,         // Was 80
    'Dynamics 365': 50,       // Was 75
    'GoHighLevel': 30,        // Was 60
    'HubSpot': 30,            // Was 50
    'Monday.com': 35,         // New item
    'Zoho': 25,               // Was 45
  };

  const cloudHours: Record<string, number> = {
    'Sales Cloud': 25,            // Was 40
    'Service Cloud': 30,          // Was 45
    'Marketing Cloud': 35,        // Was 50
    'Commerce Cloud': 40,         // Was 55
    'Financial Services Cloud': 45,  // New item
    'Experience Cloud': 35,       // Was 48
    'Agentforce': 50,             // New item
  };

  const integrationHours: Record<string, number> = {
    'Slack': 8,                   // Was 15
    'Asana': 12,                  // New item
    'Jira': 12,                   // Was 18
    'GitHub': 15,                 // New item
    'Google Workspace': 15,       // Was 25
    'Microsoft 365': 15,          // Was 25
    'Zoom': 8,                    // New item
    'DocuSign': 12,               // Was 20
    'Make.com': 15,               // New item
    'Zapier': 5,                  // Was 12
    'n8n': 15,                    // New item
    'MuleSoft': 40,               // Was 60
  };

  const aiToolHours: Record<string, number> = {
    'OpenAI ChatGPT': 15,   // Was 25
    'Gemini': 15,           // Was 25
    'Copilot': 12,          // Was 20
    'Claude': 15,           // Was 25
  };

  const moduleHours: Record<string, number> = {
    'Reporting and Dashboards': 15,    // Was 30
    'Workflow Automation': 20,         // Was 35
    'Custom Development': 35,          // Was 50
    'Lead Management': 15,             // Was 25
    'Data Migration': 25,              // Was 40
    'User Training': 8,                // Was 20
  };

  const powerUpRates: Record<string, number> = {
    'Project Manager': 5,
    'Customer Success Manager': 4,
    'Solutions Architect': 8,
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleMultiSelect = (field: keyof FormData, value: string) => {
    const currentValues = formData[field] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    handleInputChange(field, newValues);
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.workEmail.trim() && !formData.mobilePhone.trim()) {
      newErrors.contact = 'Either work email or mobile phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const showGenerateFromSelections = 
    aiUsageCount.generate < 3 &&
    formData.selectedCRMs.length > 0 && 
    (formData.selectedClouds.length > 0 || formData.selectedIntegrations.length > 0);

  const showAutofillConfiguration = 
    aiUsageCount.autofill < 3 &&
    formData.projectDescription.trim().length > 0;

  const calculateQuote = () => {
    // Calculate base hours - Reduced from 50 to 20
    let baseHours = 20;

    formData.selectedCRMs.forEach(crm => {
      baseHours += crmHours[crm] || 0;
    });

    formData.selectedClouds.forEach(cloud => {
      baseHours += cloudHours[cloud] || 0;
    });

    formData.selectedIntegrations.forEach(integration => {
      baseHours += integrationHours[integration] || 0;
    });

    formData.selectedAITools.forEach(tool => {
      baseHours += aiToolHours[tool] || 0;
    });

    formData.additionalModules.forEach(module => {
      baseHours += moduleHours[module] || 0;
    });

    // Complexity multiplier - Increased threshold (only applies > 8 selections)
    const totalSelections = 
      formData.selectedCRMs.length + 
      formData.selectedClouds.length + 
      formData.selectedIntegrations.length +
      formData.selectedAITools.length;
    
    // Multiplier kicks in later and is slightly gentler
    const complexityMultiplier = totalSelections > 10 ? 1.15 : totalSelections > 7 ? 1.05 : 1;
    const adjustedHours = Math.round(baseHours * complexityMultiplier);

    // Calculate rates
    const adminRate = 55;
    const developerRate = 70;
    const adminPercentage = 0.4;
    const developerPercentage = 0.6;
    const baseBlendedRate = Math.round(adminRate * adminPercentage + developerRate * developerPercentage);

    // Add power-up rates
    let powerUpRate = 0;
    formData.powerUps.forEach(powerUp => {
      powerUpRate += powerUpRates[powerUp] || 0;
    });

    const finalHourlyRate = baseBlendedRate + powerUpRate;
    const totalCost = adjustedHours * finalHourlyRate;
    
    // CHANGED: Velocity divisor increased from 25 to 35 (implies faster delivery/fuller weeks)
    // Using Math.max(1, ...) ensures we never show "0 weeks"
    const estimatedWeeks = Math.max(1, Math.round(adjustedHours / 35));

    const quoteData: QuoteData = {
      formData,
      baseHours,
      complexityMultiplier,
      adjustedHours,
      adminRate,
      developerRate,
      baseBlendedRate,
      powerUpRate,
      finalHourlyRate,
      totalCost,
      estimatedWeeks,
    };

    onGenerateQuote(quoteData);
  };

  useEffect(() => {
    const currentRef = formContainerRef.current;
    if (currentRef) {
      const handleScroll = () => {
        const scrollTop = currentRef.scrollTop;
        const maxScrollTop = currentRef.scrollHeight - currentRef.clientHeight;
        setScrollOpacity(1 - (scrollTop / maxScrollTop));
      };

      currentRef.addEventListener('scroll', handleScroll);
      return () => currentRef.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Track page scroll for top button fade effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      // Fade out over the first 200px of scroll
      const fadeDistance = 200;
      const opacity = Math.max(0, 1 - scrollTop / fadeDistance);
      setScrollOpacity(opacity);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-resize textarea with 2x max height limit
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const minHeight = 150; // Initial min-height
      const maxHeight = minHeight * 2; // 2x the original size
      
      // Reset height to get accurate scrollHeight
      textarea.style.height = `${minHeight}px`;
      
      // Calculate new height based on content
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
      
      // Add overflow-y when content exceeds max height
      if (textarea.scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto';
        textarea.classList.add('project-description-textarea');
      } else {
        textarea.style.overflowY = 'hidden';
        textarea.classList.remove('project-description-textarea');
      }
    }
  }, [formData.projectDescription]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white py-6 px-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <Home size={20} />
              Back to Home
            </button>
            <div className="h-6 w-px bg-slate-600"></div>
            <div>
              <h1 className="text-2xl mb-1">BKT Advisory</h1>
              <p className="text-slate-300 text-sm">Tech Project Estimator</p>
            </div>
          </div>
          <a 
            href="https://www.upwork.com/freelancers/~01dd56d750898225c0" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            View Upwork Profile →
          </a>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            {[
              { num: 1, label: 'Contact Info' },
              { num: 2, label: 'CRMs & Tools' },
              { num: 3, label: 'Services' },
              { num: 4, label: 'Team & Extras' }
            ].map((step, index) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${
                    currentStep >= step.num ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {step.num}
                  </div>
                  <span className={`text-sm text-center ${
                    currentStep >= step.num ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`flex-1 h-1 mx-2 mb-8 ${
                    currentStep > step.num ? 'bg-blue-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          
          {/* Top Navigation Buttons (Smaller, Fade on Scroll) */}
          {currentStep > 1 && (
            <div 
              className="flex justify-between mb-6 pb-4 border-b border-slate-200 transition-opacity duration-300"
              style={{ opacity: scrollOpacity }}
            >
              <button
                onClick={handlePrevStep}
                className="px-4 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                style={{ transform: 'scale(0.75)', transformOrigin: 'left center' }}
              >
                ← Previous
              </button>
              
              {currentStep < 4 ? (
                <button
                  onClick={handleNextStep}
                  className="ml-auto flex items-center gap-2 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  style={{ transform: 'scale(0.75)', transformOrigin: 'right center' }}
                >
                  Next <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={calculateQuote}
                  className="ml-auto flex items-center gap-2 px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  style={{ transform: 'scale(0.75)', transformOrigin: 'right center' }}
                >
                  <Calculator size={16} />
                  Get Instant Quote
                </button>
              )}
            </div>
          )}
          
          {/* Step 1: Contact Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl mb-2">Let's Get Started</h2>
                <p className="text-slate-600">Please provide your contact information to receive your personalized quote.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.firstName ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="John"
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.lastName ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Burkhardt"
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Website</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-slate-700 mb-3">
                  <span className="text-red-500">*</span> Please provide at least one contact method:
                </p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-2">Work Email</label>
                    <input
                      type="email"
                      value={formData.workEmail}
                      onChange={(e) => handleInputChange('workEmail', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.contact && !formData.workEmail && !formData.mobilePhone ? 'border-red-500' : 'border-slate-300'
                      }`}
                      placeholder="john@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Mobile Phone</label>
                    <input
                      type="tel"
                      value={formData.mobilePhone}
                      onChange={(e) => handleInputChange('mobilePhone', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.contact && !formData.workEmail && !formData.mobilePhone ? 'border-red-500' : 'border-slate-300'
                      }`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                {errors.contact && <p className="text-red-500 text-sm mt-2">{errors.contact}</p>}
              </div>
            </div>
          )}

          {/* Step 2: CRMs, Clouds & Tools */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl mb-2">Select Your Tech Stack</h2>
                <p className="text-slate-600">Choose the CRMs, clouds, integrations, and AI tools you need.</p>
              </div>

              {/* Project Description */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
                <div className="flex items-start gap-3 mb-3">
                  <Sparkles size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-blue-900 mb-1">Project Description (Optional but Recommended)</h3>
                    <p className="text-sm text-slate-700">
                      Provide details about your project for a more accurate estimate. Our AI assistant can help you craft a comprehensive description!
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={formData.projectDescription}
                    onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                    className="w-full px-4 py-3 pb-12 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px] bg-white"
                    placeholder="Describe your project objectives, current infrastructure, pain points, desired automations, deliverables, timeline, and any other relevant details..."
                  />
                  
                  {/* AI Toolbar */}
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    {showGenerateFromSelections && (
                      <button
                        onClick={() => onTriggerAIAction('generate')}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title={`Generate project description from selected configurations (${3 - aiUsageCount.generate} uses left)`}
                        disabled={aiUsageCount.generate >= 3}
                      >
                        <Wand2 size={14} />
                        Generate from Selections {aiUsageCount.generate >= 3 && '(Max reached)'}
                      </button>
                    )}
                    {showAutofillConfiguration && (
                      <button
                        onClick={() => onTriggerAIAction('autofill')}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-md hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed"
                        title={`Autofill tech stack from current project description (${3 - aiUsageCount.autofill} uses left)`}
                        disabled={aiUsageCount.autofill >= 3}
                      >
                        <Sparkles size={14} className="group-hover:text-blue-500" />
                        Autofill Configuration {aiUsageCount.autofill >= 3 && '(Max reached)'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* CRMs */}
              <div>
                <h3 className="mb-3">CRM Platforms</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(crmHours).map(crm => (
                    <label key={crm} className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formData.selectedCRMs.includes(crm)}
                        onChange={() => handleMultiSelect('selectedCRMs', crm)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>{crm}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Salesforce Clouds */}
              <div>
                <h3 className="mb-3">Salesforce Clouds</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(cloudHours).map(cloud => (
                    <label key={cloud} className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formData.selectedClouds.includes(cloud)}
                        onChange={() => handleMultiSelect('selectedClouds', cloud)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>{cloud}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Integrations */}
              <div>
                <h3 className="mb-3">Integrations</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(integrationHours).map(integration => (
                    <label key={integration} className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formData.selectedIntegrations.includes(integration)}
                        onChange={() => handleMultiSelect('selectedIntegrations', integration)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>{integration}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* AI Tools */}
              <div>
                <h3 className="mb-3">AI Tools</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(aiToolHours).map(tool => (
                    <label key={tool} className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formData.selectedAITools.includes(tool)}
                        onChange={() => handleMultiSelect('selectedAITools', tool)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>{tool}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Additional Services */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl mb-2">Additional Services</h2>
                <p className="text-slate-600">Select any additional modules or services you need.</p>
              </div>

              <div>
                <h3 className="mb-3">Service Modules</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(moduleHours).map(module => (
                    <label key={module} className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formData.additionalModules.includes(module)}
                        onChange={() => handleMultiSelect('additionalModules', module)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>{module}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Team & Power-Ups */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl mb-2">Team Configuration</h2>
                <p className="text-slate-600">Choose your delivery team and optional power-ups.</p>
              </div>

              <div>
                <h3 className="mb-3">Delivery Team</h3>
                <div className="space-y-2">
                  {['nearshore', 'offshore', 'onshore'].map(team => (
                    <label key={team} className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input
                        type="radio"
                        name="deliveryTeam"
                        checked={formData.deliveryTeam === team}
                        onChange={() => handleInputChange('deliveryTeam', team)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="capitalize">{team} (USA/SA/Europe)</div>
                        <div className="text-sm text-slate-500">
                          {team === 'nearshore' && 'Best balance of cost and timezone alignment'}
                          {team === 'offshore' && 'Most cost-effective option'}
                          {team === 'onshore' && 'Premium local support'}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3">Power-Ups (Optional)</h3>
                <div className="space-y-2">
                  {Object.keys(powerUpRates).map(powerUp => (
                    <label key={powerUp} className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formData.powerUps.includes(powerUp)}
                        onChange={() => handleMultiSelect('powerUps', powerUp)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1 flex justify-between items-center">
                        <span>{powerUp}</span>
                        <span className="text-sm text-slate-500">+${powerUpRates[powerUp]}/hr</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
            {currentStep > 1 && (
              <button
                onClick={handlePrevStep}
                className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                ← Previous
              </button>
            )}
            
            {currentStep < 4 ? (
              <button
                onClick={handleNextStep}
                className="ml-auto flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={calculateQuote}
                className="ml-auto flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Calculator size={20} />
                Get Instant Quote
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}