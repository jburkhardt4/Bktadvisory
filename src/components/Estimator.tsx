import { useState } from 'react';
import { FormData, QuoteData } from '../App';
import { ArrowRight, Calculator, Home, Sparkles } from 'lucide-react';

interface EstimatorProps {
  onGenerateQuote: (data: QuoteData) => void;
  onBackToHome: () => void;
}

export function Estimator({ onGenerateQuote, onBackToHome }: EstimatorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pricing configuration
  const crmHours: Record<string, number> = {
    'Salesforce': 80,
    'Dynamics 365': 75,
    'GoHighLevel': 60,
    'HubSpot': 50,
    'Zoho': 45,
  };

  const cloudHours: Record<string, number> = {
    'Sales Cloud': 40,
    'Service Cloud': 45,
    'Marketing Cloud': 50,
    'Commerce Cloud': 55,
    'Experience Cloud': 48,
  };

  const integrationHours: Record<string, number> = {
    'Slack': 15,
    'DocuSign': 20,
    'Jira': 18,
    'Google Workspace': 25,
    'Microsoft 365': 25,
    'Zapier': 12,
    'MuleSoft': 60,
  };

  const aiToolHours: Record<string, number> = {
    'OpenAI ChatGPT': 25,
    'Gemini': 25,
    'Copilot': 20,
    'Claude': 25,
  };

  const moduleHours: Record<string, number> = {
    'Reporting and Dashboards': 30,
    'Workflow Automation': 35,
    'Custom Development': 50,
    'Lead Management': 25,
    'Data Migration': 40,
    'User Training': 20,
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

  const calculateQuote = () => {
    // Calculate base hours
    let baseHours = 50; // Base project hours

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

    // Complexity multiplier based on number of selections
    const totalSelections = 
      formData.selectedCRMs.length + 
      formData.selectedClouds.length + 
      formData.selectedIntegrations.length +
      formData.selectedAITools.length;
    
    const complexityMultiplier = totalSelections > 8 ? 1.2 : totalSelections > 5 ? 1.1 : 1;
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
    const estimatedWeeks = Math.round(adjustedHours / 25);

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
          <div className="flex items-center justify-between mb-3">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            <span className={currentStep >= 1 ? 'text-slate-900' : 'text-slate-400'}>Contact Info</span>
            <span className={currentStep >= 2 ? 'text-slate-900' : 'text-slate-400'}>CRMs & Tools</span>
            <span className={currentStep >= 3 ? 'text-slate-900' : 'text-slate-400'}>Services</span>
            <span className={currentStep >= 4 ? 'text-slate-900' : 'text-slate-400'}>Team & Extras</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          
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
                <textarea
                  value={formData.projectDescription}
                  onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                  className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px] bg-white"
                  placeholder="Describe your project objectives, current infrastructure, pain points, desired automations, deliverables, timeline, and any other relevant details..."
                />
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
