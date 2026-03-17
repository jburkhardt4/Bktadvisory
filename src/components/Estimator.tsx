import { useState, useEffect, useRef } from 'react';
import { FormData, QuoteData } from '../App';
import { EstimatorStepper } from './EstimatorStepper';
import { MultiSelectDropdown } from './MultiSelectDropdown';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
// @ts-ignore
import mammoth from 'mammoth/mammoth.browser';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
const pdfjsVersion = pdfjsLib.version || '4.0.379';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;

// Icon components
const ArrowRightIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ArrowLeftIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const CalculatorIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="16" y1="14" x2="16" y2="14" />
    <line x1="8" y1="14" x2="8" y2="14" />
    <line x1="12" y1="14" x2="12" y2="14" />
    <line x1="16" y1="18" x2="16" y2="18" />
    <line x1="8" y1="18" x2="8" y2="18" />
    <line x1="12" y1="18" x2="12" y2="18" />
  </svg>
);

const HomeIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const SparklesIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const Wand2Icon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 4V2" />
    <path d="M15 16v-2" />
    <path d="M8 9h2" />
    <path d="M20 9h2" />
    <path d="M17.8 11.8 19 13" />
    <path d="M15 9h0" />
    <path d="M17.8 6.2 19 5" />
    <path d="m3 21 9-9" />
    <path d="M12.2 6.2 11 5" />
  </svg>
);

const Trash2Icon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const FileIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </svg>
);

const UploadCloudIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
);

const Loader2Icon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${className} animate-spin`}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

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
  const [refiningField, setRefiningField] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scopeProblemsRef = useRef<HTMLTextAreaElement>(null);
  const scopeRequirementsRef = useRef<HTMLTextAreaElement>(null);
  const scopeGoalsRef = useRef<HTMLTextAreaElement>(null);
  const analyzedFileNamesRef = useRef<Set<string>>(new Set());

  // Helper to auto-resize textareas
  const adjustTextareaHeight = (element: HTMLTextAreaElement | null) => {
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${Math.max(element.scrollHeight, 100)}px`;
  };

  useEffect(() => {
    if (currentStep === 3) {
      adjustTextareaHeight(scopeProblemsRef.current);
    }
  }, [formData.scopeProblems, currentStep]);

  useEffect(() => {
    if (currentStep === 3) {
      adjustTextareaHeight(scopeRequirementsRef.current);
    }
  }, [formData.scopeRequirements, currentStep]);

  useEffect(() => {
    if (currentStep === 3) {
      adjustTextareaHeight(scopeGoalsRef.current);
    }
  }, [formData.scopeGoals, currentStep]);

  // Pricing configuration
  const crmHours: Record<string, number> = {
    'Salesforce': 60,
    'Dynamics 365': 55,
    'GoHighLevel': 45,
    'HubSpot': 40,
    'Monday.com': 40,
    'Zoho': 25,
  };

  const cloudHours: Record<string, number> = {
    'Sales Cloud': 25,
    'Service Cloud': 30,
    'Marketing Cloud': 35,
    'Commerce Cloud': 40,
    'Financial Services Cloud': 45,
    'Experience Cloud': 35,
    'CPQ': 35,
    'Insurance Cloud': 45,
    'Agentforce': 50,
  };

  const integrationHours: Record<string, number> = {
    'Slack': 10,
    'Asana': 12,
    'Jira': 15,
    'GitHub': 20,
    'Google Workspace': 15,
    'Microsoft 365': 15,
    'Zoom': 8,
    'DocuSign': 12,
    'Make.com': 15,
    'Zapier': 8,
    'n8n': 15,
    'MuleSoft': 60,
  };

  const aiToolHours: Record<string, number> = {
    'OpenAI': 20,
    'Gemini': 20,
    'Copilot': 15,
    'Claude': 20,
  };

  const moduleHours: Record<string, number> = {
    'Reporting and Dashboards': 15,
    'Workflow Automation': 30,
    'Custom Development': 50,
    'Lead Management': 20,
    'Data Migration': 30,
    'User Training': 10,
  };

  const powerUpRates: Record<string, number> = {
    'Business Analyst': 4,
    'Project Manager': 5,
    'Customer Success Manager': 4,
    'Developer': 5,
    'Solutions Architect': 8,
    'AI/ML Engineers': 6,
  };

  // Helper to extract text from files
  const extractText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      } else if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item: any) => item.str).join(' ');
              fullText += pageText + '\n';
            }
            resolve(fullText);
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
         const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const result = await mammoth.extractRawText({ arrayBuffer });
            resolve(result.value);
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        resolve(`[File: ${file.name} - Content analysis not supported for this type]`);
      }
    });
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Check 5 file limit on total uploaded
    const currentCount = formData.uploadedFiles?.length || 0;
    if (currentCount + files.length > 5) {
      toast.error('Maximum 5 documents allowed.');
      return;
    }

    const newFiles: { name: string; size: number; type: string; file: File }[] = [];

    Array.from(files).forEach(file => {
      if (file.size > 500 * 1024 * 1024) { // 500MB
        toast.error(`File ${file.name} exceeds 500MB limit.`);
        return;
      }
      
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/png', 'image/jpeg'];
      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid file type for ${file.name}. Please upload PDF, DOCX, TXT, PNG, or JPG.`);
        return;
      }

      newFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        file: file // Store actual file object for later analysis
      });
    });
    
    if (newFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        uploadedFiles: [...(prev.uploadedFiles || []), ...newFiles]
      }));
      toast.success(`${newFiles.length} file(s) attached.`);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index)
    }));
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleRefineScope = async (field: 'scopeProblems' | 'scopeRequirements' | 'scopeGoals', label: string) => {
    const content = formData[field];
    if (!content || content.length < 5) return;

    setRefiningField(field);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-07a007e1/refine-scope`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          text: content,
          type: label
        }),
      });

      if (response.status === 429) {
        toast.error("AI Limit Reached. Please refine manually.");
        setRefiningField(null);
        return;
      }

      const data = await response.json();
      if (data.content || data.refinedText) {
        handleInputChange(field, data.content || data.refinedText);
      }
    } catch (error) {
      console.error('Failed to refine scope:', error);
    } finally {
      setRefiningField(null);
    }
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

  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.workEmail.trim() && !formData.mobilePhone.trim()) {
      newErrors.contact = 'Either work email or mobile phone is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.scopeGoals.trim()) newErrors.scopeGoals = 'Goals are required before proceeding';
    if (!formData.scopeProblems.trim()) newErrors.scopeProblems = 'Problems are required before proceeding';
    if (!formData.scopeRequirements.trim()) newErrors.scopeRequirements = 'Requirements are required before proceeding';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Generate project summary from scope fields (when no document was uploaded)
  const generateSummaryFromScope = async () => {
    // Skip if project description was already populated (e.g. by document analyzer)
    if (formData.projectDescription.trim().length > 0) return;

    setIsGeneratingSummary(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-07a007e1/generate-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          goals: formData.scopeGoals,
          problems: formData.scopeProblems,
          requirements: formData.scopeRequirements,
        }),
      });

      if (response.status === 429) {
        toast.error("AI Limit Reached. You can manually enter a project description.");
        return;
      }

      if (!response.ok) throw new Error('Summary generation failed');

      const data = await response.json();
      if (data.projectDescription) {
        setFormData(prev => ({
          ...prev,
          projectDescription: data.projectDescription,
        }));
        toast.success('Project summary generated from your scope!');
      }
    } catch (error) {
      console.error('Summary generation error:', error);
      // Non-blocking — user can still proceed and write description manually
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const analyzeDocuments = async () => {
    // Filter for analyzable files that have the file object stored
    const analyzableFiles = (formData.uploadedFiles || []).filter(f => 
      ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(f.type) && 
      // @ts-ignore: Check for file property
      f.file
    );

    // Deduplicate: only analyze files that haven't been analyzed yet
    const newFiles = analyzableFiles.filter(f => !analyzedFileNamesRef.current.has(f.name + '|' + f.size));

    if (newFiles.length === 0) {
      // All files already analyzed — skip straight to next step
      setCurrentStep(3);
      return;
    }

    setIsAnalyzing(true);
    let aggregatedText = "";

    try {
      // Extract text only from NEW files
      for (const fileData of newFiles) {
        // @ts-ignore: We are storing the File object in the state now
        const text = await extractText(fileData.file);
        aggregatedText += `\n--- Document: ${fileData.name} ---\n${text}\n`;
      }

      if (!aggregatedText.trim()) {
         setCurrentStep(3);
         return;
      }

      // Truncate text on frontend to avoid payload limits (Supabase Edge Functions have 6MB limit, but smaller is better for latency)
      // The backend truncates to 15000 anyway.
      const truncatedText = aggregatedText.length > 20000 ? aggregatedText.substring(0, 20000) + "...[truncated]" : aggregatedText;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-07a007e1/analyze-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          text: truncatedText,
          fileName: "Aggregated Documents"
        }),
      });

      if (response.status === 429) {
        toast.error("AI Usage Limit Reached. Proceeding to manual entry.");
        setCurrentStep(3);
        return;
      }

      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      
      if (data) {
          // Helper to ensure string
          const safeString = (val: any) => {
            if (!val) return '';
            if (Array.isArray(val)) return val.map(v => typeof v === 'string' ? v : JSON.stringify(v)).join('\n- ');
            if (typeof val === 'string') return val;
            return String(val);
          };

          setFormData(prev => {
            const mergedCRMs = [...new Set([...prev.selectedCRMs, ...(data.suggestedInfrastructure || [])])].filter(i => Object.keys(crmHours).includes(i));
            const mergedClouds = [...new Set([...prev.selectedClouds, ...(data.suggestedInfrastructure || [])])].filter(i => Object.keys(cloudHours).includes(i));
            const mergedIntegrations = [...new Set([...prev.selectedIntegrations, ...(data.suggestedInfrastructure || [])])].filter(i => Object.keys(integrationHours).includes(i));
            
            const mergedModules = [...new Set([...prev.additionalModules, ...(data.suggestedServices || [])])].filter(i => Object.keys(moduleHours).includes(i));
            const mergedPowerUps = [...new Set([...prev.powerUps, ...(data.suggestedPowerUps || [])])].filter(i => Object.keys(powerUpRates).includes(i));

            return {
              ...prev,
              projectDescription: safeString(data.projectDescription) || prev.projectDescription,
              scopeProblems: safeString(data.problems) || prev.scopeProblems,
              scopeRequirements: safeString(data.requirements) || prev.scopeRequirements,
              scopeGoals: safeString(data.goals) || prev.scopeGoals,
              selectedCRMs: mergedCRMs,
              selectedClouds: mergedClouds,
              selectedIntegrations: mergedIntegrations,
              additionalModules: mergedModules,
              powerUps: mergedPowerUps,
            };
          });
          
          toast.success('Project details analyzed and auto-filled!');

          // Mark these files as analyzed so navigating back won't re-trigger
          newFiles.forEach(f => analyzedFileNamesRef.current.add(f.name + '|' + f.size));
      }

    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Could not analyze documents. Proceeding to next step.');
    } finally {
      setIsAnalyzing(false);
      setCurrentStep(3);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
        if (formData.uploadedFiles && formData.uploadedFiles.length > 0) {
            analyzeDocuments();
        } else {
            setCurrentStep(3);
        }
    } else if (currentStep === 3) {
      if (!validateStep3()) return;
      // If no document was uploaded, generate a project summary from scope fields
      const hasUploadedDocs = formData.uploadedFiles && formData.uploadedFiles.length > 0;
      if (!hasUploadedDocs && !formData.projectDescription.trim()) {
        await generateSummaryFromScope();
      }
      setCurrentStep(4);
    } else {
      setCurrentStep(prev => Math.min(6, prev + 1));
    }
  };

  const handlePrevStep = () => {
    if (isAnalyzing || isGeneratingSummary) return;
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const showGenerateFromSelections = 
    aiUsageCount.generate < 3 &&
    (
      formData.selectedCRMs.length > 0 || 
      formData.selectedClouds.length > 0 || 
      formData.selectedIntegrations.length > 0 ||
      formData.selectedAITools.length > 0
    );

  const allTechKeywords = [
    ...Object.keys(crmHours),
    ...Object.keys(cloudHours),
    ...Object.keys(integrationHours),
    ...Object.keys(aiToolHours)
  ];

  const showAutofillConfiguration = (() => {
    if (aiUsageCount.autofill >= 3) return false;
    const combinedText = [
      formData.projectDescription,
      formData.scopeGoals,
      formData.scopeProblems,
      formData.scopeRequirements,
    ].join(' ').toLowerCase();
    if (!combinedText.trim()) return false;
    return allTechKeywords.some(keyword => combinedText.includes(keyword.toLowerCase()));
  })();

  const calculateQuote = async () => {
    setIsFinalizing(true);
    let valueStatement: string | undefined = undefined;

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-07a007e1/generate-value-prop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          problems: formData.scopeProblems,
          goals: formData.scopeGoals,
          infrastructure: [...formData.selectedCRMs, ...formData.selectedClouds, ...formData.selectedIntegrations].join(", "),
          services: formData.additionalModules.join(", ")
        }),
      });

      if (response.ok) {
        const data = await response.json();
        valueStatement = data.valueStatement;
      }
    } catch (e) {
      console.error("Value prop generation failed", e);
    }

    let baseHours = 20;
    formData.selectedCRMs.forEach(crm => { baseHours += crmHours[crm] || 0; });
    formData.selectedClouds.forEach(cloud => { baseHours += cloudHours[cloud] || 0; });
    formData.selectedIntegrations.forEach(integration => { baseHours += integrationHours[integration] || 0; });
    formData.selectedAITools.forEach(tool => { baseHours += aiToolHours[tool] || 0; });
    formData.additionalModules.forEach(module => { baseHours += moduleHours[module] || 0; });

    const totalSelections = 
      formData.selectedCRMs.length + 
      formData.selectedClouds.length + 
      formData.selectedIntegrations.length +
      formData.selectedAITools.length;
    
    const complexityMultiplier = totalSelections > 10 ? 1.15 : totalSelections > 7 ? 1.05 : 1;
    const adjustedHours = Math.round(baseHours * complexityMultiplier);

    const adminRate = 55;
    const developerRate = 70;
    const adminPercentage = 0.4;
    const developerPercentage = 0.6;
    const baseBlendedRate = Math.round(adminRate * adminPercentage + developerRate * developerPercentage);

    let powerUpRate = 0;
    formData.powerUps.forEach(powerUp => { powerUpRate += powerUpRates[powerUp] || 0; });

    const finalHourlyRate = baseBlendedRate + powerUpRate;
    const totalCost = adjustedHours * finalHourlyRate;
    const estimatedWeeks = Math.max(1, Math.round(adjustedHours / 35));

    if (valueStatement) {
      setFormData(prev => ({ ...prev, valueStatement }));
    }

    const quoteData: QuoteData = {
      formData: { ...formData, valueStatement },
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
    setIsFinalizing(false);
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
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const fadeDistance = 200;
      const opacity = Math.max(0, 1 - scrollTop / fadeDistance);
      setScrollOpacity(opacity);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // NOTE: Verbatim scope-to-projectDescription autofill removed.
  // The /generate-summary AI endpoint handles this on Step 3 → 4 transition.

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const minHeight = 150;
      const maxHeight = minHeight * 2;
      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
      
      if (textarea.scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto';
        textarea.classList.add('project-description-textarea');
      } else {
        textarea.style.overflowY = 'hidden';
        textarea.classList.remove('project-description-textarea');
      }
    }
  }, [formData.projectDescription]);

  const steps = [
    { num: 1, label: 'Contact Info' },
    { num: 2, label: 'Upload Docs' },
    { num: 3, label: 'Scope' },
    { num: 4, label: 'IT Infrastructure' },
    { num: 5, label: 'Services' },
    { num: 6, label: 'Team & Extras' }
  ];

  return (
    <div className="min-h-screen flex-1 bg-[#eff6ff]">
      {/* Sticky wrapper for header + stepper (all viewports) */}
      <div className="estimator-sticky-header sticky top-[116px] z-40 shadow-md">
        <header className="bg-gradient-to-r from-[#0F172B] via-[#1e293b] to-[#0F172B] text-white py-4 px-4 md:py-6 md:px-8">
          <div className="max-w-[1440px] mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4 md:gap-6">
              <a href="https://bktadvisory.com" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                <HomeIcon size={20} />
                <span className="hidden md:inline">Back to Home</span>
              </a>
              <div className="h-6 w-px bg-slate-600"></div>
              <div>
                <a href="https://bktadvisory.com/project" className="block hover:text-blue-300 transition-colors">
                  <h1 className="text-2xl mb-1 hidden md:block">BKT Advisory</h1>
                </a>
                <p className="text-slate-300 text-sm">
                  <span className="md:hidden">BKT Project Estimator</span>
                  <span className="hidden md:inline">Tech Project Estimator</span>
                </p>
              </div>
            </div>
            <a href="https://www.upwork.com/freelancers/~01dd56d750898225c0" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
              <span className="md:hidden">Upwork →</span>
              <span className="hidden md:inline">View Upwork Profile →</span>
            </a>
          </div>
        </header>

        <EstimatorStepper currentStep={currentStep} totalSteps={6} steps={steps} />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-12">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-8">
          
          {currentStep > 1 && (
            <div 
              className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 transition-opacity duration-300"
              style={{ opacity: scrollOpacity }}
            >
              {/* Previous: text at all viewports */}
              <button
                onClick={() => { handlePrevStep(); window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }}
                className="px-3 py-1.5 md:px-4 md:py-1.5 text-[13px] md:text-[14px] border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors min-h-[36px] w-[100px] md:w-[110px] flex items-center justify-center gap-1.5"
              >
                <ArrowLeftIcon size={18} className="text-slate-500" />
                <span className="text-slate-600">Previous</span>
              </button>
              
              {currentStep < 6 ? (
                <button
                  onClick={() => { handleNextStep(); window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }}
                  disabled={isAnalyzing || isGeneratingSummary}
                  className={`ml-auto px-3.5 py-1.5 md:px-5 md:py-1.5 text-[13px] md:text-[14px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[36px] w-[101px] md:w-[111px] flex items-center justify-center gap-1.5 ${(isAnalyzing || isGeneratingSummary) ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {isAnalyzing ? (
                    <Loader2Icon size={18} className="text-white" />
                  ) : isGeneratingSummary ? (
                    <Loader2Icon size={18} className="text-white" />
                  ) : (
                    <>
                      <span>Next</span>
                      <ArrowRightIcon size={18} className="text-white" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => { calculateQuote(); window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }}
                  disabled={isFinalizing}
                  className={`ml-auto flex items-center gap-1.5 px-3.5 py-2 md:px-6 md:py-2 text-[13px] md:text-[14px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[36px] w-[120px] md:w-[111px] justify-center whitespace-nowrap ${isFinalizing ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {isFinalizing ? (
                    <>
                      <Loader2Icon size={16} />
                      <span className="sr-only">Loading...</span>
                    </>
                  ) : (
                    <>
                      <CalculatorIcon size={16} />
                      <span>Get Quote</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
          
          {/* Step 1: Contact Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <div className="flex flex-row items-start justify-between">
                  <h2 className="mb-0 text-[#0f172b] font-bold text-[18px] md:text-[20px]">Let's Get Started</h2>
                  <button
                    onClick={() => { handleNextStep(); window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }}
                    disabled={isAnalyzing || isGeneratingSummary}
                    className={`px-3.5 py-1.5 md:px-5 md:py-1.5 text-[13px] md:text-[14px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-opacity duration-300 min-h-[36px] w-[101px] md:w-[111px] flex items-center justify-center gap-1.5 shrink-0 ${(isAnalyzing || isGeneratingSummary) ? 'opacity-70 cursor-wait' : ''}`}
                    style={{ opacity: (isAnalyzing || isGeneratingSummary) ? 0.7 : scrollOpacity }}
                  >
                    {isAnalyzing ? (
                      <Loader2Icon size={18} className="text-white" />
                    ) : isGeneratingSummary ? (
                      <Loader2Icon size={18} className="text-white" />
                    ) : (
                      <>
                        <span>Next</span>
                        <ArrowRightIcon size={18} className="text-white" />
                      </>
                    )}
                  </button>
                  </div>
                  <p className="text-slate-600 text-[14px] md:text-[16px]">Please provide your contact information to receive your personalized quote.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-[14px] md:text-[16px]">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-[10px] md:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base ${errors.firstName ? 'border-red-500' : 'border-slate-300'}`}
                    placeholder="John"
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block mb-2 text-[14px] md:text-[16px]">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-4 py-[10px] md:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base ${errors.lastName ? 'border-red-500' : 'border-slate-300'}`}
                    placeholder="Burkhardt"
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-[14px] md:text-[16px]">Company</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-4 py-[10px] md:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Acme Corp"
                />
              </div>

              <div>
                <label className="block mb-2 text-[14px] md:text-[16px]">Website</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-4 py-[10px] md:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-[14px] md:text-[16px] text-slate-700 mb-3"><span className="text-red-500">*</span> Please provide at least one contact method:</p>
                <div className="space-y-3">
                  <div>
                    <label className="block mb-2 text-[14px] md:text-[16px]">Work Email</label>
                    <input
                      type="email"
                      value={formData.workEmail}
                      onChange={(e) => handleInputChange('workEmail', e.target.value)}
                      className={`w-full px-4 py-[10px] md:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base ${errors.contact && !formData.workEmail && !formData.mobilePhone ? 'border-red-500' : 'border-slate-300'}`}
                      placeholder="john@company.com"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-[14px] md:text-[16px]">Mobile Phone</label>
                    <input
                      type="tel"
                      value={formData.mobilePhone}
                      onChange={(e) => handleInputChange('mobilePhone', e.target.value)}
                      className={`w-full px-4 py-[10px] md:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base ${errors.contact && !formData.workEmail && !formData.mobilePhone ? 'border-red-500' : 'border-slate-300'}`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                {errors.contact && <p className="text-red-500 text-sm mt-2">{errors.contact}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Upload Docs (NEW) */}
          {currentStep === 2 && (
             <div className="space-y-6">
               <div>
                 <h2 className="text-[18px] md:text-[20px] mb-2">Upload Documentation</h2>
                 <p className="text-slate-600 text-[14px] md:text-[16px]">Drag and drop specifications, RFPs, or architecture diagrams to auto-fill your project details.</p>
               </div>

               <div 
                 className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                 onDragOver={onDragOver}
                 onDragLeave={onDragLeave}
                 onDrop={onDrop}
               >
                 <input 
                   type="file" 
                   multiple 
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                   onChange={(e) => handleFileUpload(e.target.files)}
                 />
                 
                 {isAnalyzing ? (
                   <div className="flex flex-col items-center">
                     <Loader2Icon size={48} className="text-blue-500 mb-4" />
                     <p className="text-lg font-medium text-slate-700">Analyzing document...</p>
                     <p className="text-[14px] md:text-[16px] text-slate-500 mt-2">Extracting structured data to autofill your scope.</p>
                   </div>
                 ) : (
                   <>
                     <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                       <UploadCloudIcon size={32} />
                     </div>
                     <p className="text-lg font-medium text-slate-700 mb-2">Click to upload or drag and drop</p>
                     <p className="text-sm text-slate-500 max-w-sm">
                       Supports PDF, DOCX, TXT, PNG, JPG (Max 500MB)
                     </p>
                   </>
                 )}
               </div>

               {formData.uploadedFiles && formData.uploadedFiles.length > 0 && (
                 <div className="space-y-3">
                   <h3 className="text-sm font-semibold text-slate-900">Attached Files</h3>
                   {formData.uploadedFiles.map((file, idx) => (
                     <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-50 rounded-md text-blue-600">
                           <FileIcon size={20} />
                         </div>
                         <div>
                           <p className="text-sm font-medium text-slate-700">{file.name}</p>
                           <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                         </div>
                       </div>
                       <button 
                         onClick={() => handleRemoveFile(idx)}
                         className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                       >
                         <Trash2Icon size={18} />
                       </button>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          )}

          {/* Step 3: Scope (Was Step 2) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[18px] md:text-[20px] mb-2">Project Scope</h2>
                <p className="text-slate-600 text-[14px] md:text-[16px]">Define the core drivers and objectives for this engagement.</p>
              </div>

              <div className="relative group">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[14px] md:text-[16px]">Goals</label>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide hidden sm:inline-block">Max 500 chars</span>
                    {formData.scopeGoals.length > 5 && (
                      <button
                        onClick={() => handleRefineScope('scopeGoals', 'Goal')}
                        disabled={refiningField === 'scopeGoals'}
                        className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                      >
                        {refiningField === 'scopeGoals' ? 'Refining...' : <>Refine <SparklesIcon size={12} /></>}
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  ref={scopeGoalsRef}
                  value={formData.scopeGoals}
                  onChange={(e) => handleInputChange('scopeGoals', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none overflow-hidden text-base ${errors.scopeGoals ? 'border-red-500' : 'border-slate-300'}`}
                  placeholder="Define success metrics..."
                />
                {errors.scopeGoals && <p className="text-red-500 text-xs mt-1">{errors.scopeGoals}</p>}
              </div>

              <div className="relative group">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[14px] md:text-[16px]">Problems</label>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide hidden sm:inline-block">Max 750 chars</span>
                    {formData.scopeProblems.length > 5 && (
                      <button
                        onClick={() => handleRefineScope('scopeProblems', 'Problem')}
                        disabled={refiningField === 'scopeProblems'}
                        className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                      >
                        {refiningField === 'scopeProblems' ? 'Refining...' : <>Refine <SparklesIcon size={12} /></>}
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  ref={scopeProblemsRef}
                  value={formData.scopeProblems}
                  onChange={(e) => handleInputChange('scopeProblems', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none overflow-hidden text-base ${errors.scopeProblems ? 'border-red-500' : 'border-slate-300'}`}
                  placeholder="Describe current pain points..."
                />
                {errors.scopeProblems && <p className="text-red-500 text-xs mt-1">{errors.scopeProblems}</p>}
              </div>

              <div className="relative group">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[14px] md:text-[16px]">Requirements</label>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide hidden sm:inline-block">Max 1,000 chars</span>
                    {formData.scopeRequirements.length > 5 && (
                      <button
                        onClick={() => handleRefineScope('scopeRequirements', 'Requirement')}
                        disabled={refiningField === 'scopeRequirements'}
                        className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                      >
                        {refiningField === 'scopeRequirements' ? 'Refining...' : <>Refine <SparklesIcon size={12} /></>}
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  ref={scopeRequirementsRef}
                  value={formData.scopeRequirements}
                  onChange={(e) => handleInputChange('scopeRequirements', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none overflow-hidden text-base ${errors.scopeRequirements ? 'border-red-500' : 'border-slate-300'}`}
                  placeholder="List key technical requirements..."
                />
                {errors.scopeRequirements && <p className="text-red-500 text-xs mt-1">{errors.scopeRequirements}</p>}
              </div>
            </div>
          )}

          {/* Step 4: IT Infrastructure (Was Step 3) */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-[18px] md:text-[20px] mb-2">IT Infrastructure</h2>
                <p className="text-slate-600 text-[14px] md:text-[16px]">Choose the CRMs, clouds, integrations, and AI tools you need.</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
                <div className="flex items-start gap-3 mb-3">
                  <SparklesIcon size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-blue-900 mb-1">Project Description</h3>
                    <p className="text-[14px] md:text-[16px] text-slate-700">
                      Provide project details for a more accurate estimate. Our AI assistant can help you craft this description!
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={formData.projectDescription}
                    onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                    className="w-full px-4 py-3 pb-12 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px] bg-white text-base"
                    placeholder="Describe your project objectives, infrastructure, pain points..."
                  />
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    {showGenerateFromSelections && (
                      <button
                        onClick={() => onTriggerAIAction('generate')}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
                        title="Generate description"
                        disabled={aiUsageCount.generate >= 3}
                      >
                        <Wand2Icon size={14} />
                        Generate from Selections {aiUsageCount.generate >= 3 && '(Max reached)'}
                      </button>
                    )}
                    {showAutofillConfiguration && (
                      <button
                        onClick={() => onTriggerAIAction('autofill')}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-md hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm group disabled:opacity-50"
                        title="Autofill stack"
                        disabled={aiUsageCount.autofill >= 3}
                      >
                        <SparklesIcon size={14} className="group-hover:text-blue-500" />
                        Autofill Configurations {aiUsageCount.autofill >= 3 && '(Max reached)'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3">CRM Platforms</h3>
                {/* Desktop: exposed checkbox grid */}
                <div className="hidden md:grid grid-cols-2 gap-3">
                  {Object.keys(crmHours).map(crm => (
                    <label key={crm} className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input type="checkbox" checked={formData.selectedCRMs.includes(crm)} onChange={() => handleMultiSelect('selectedCRMs', crm)} className="w-4 h-4 text-blue-600" />
                      <span>{crm}</span>
                    </label>
                  ))}
                </div>
                {/* Mobile: multi-select dropdown */}
                <div className="block md:hidden">
                  <MultiSelectDropdown
                    options={Object.keys(crmHours)}
                    selected={formData.selectedCRMs}
                    onToggle={(crm) => handleMultiSelect('selectedCRMs', crm)}
                    onClear={() => handleInputChange('selectedCRMs', [])}
                    placeholder="Select CRMs..."
                  />
                </div>
              </div>

              {formData.selectedCRMs.includes('Salesforce') && (
                <div>
                  <h3 className="mb-3">Salesforce Clouds</h3>
                  {/* Desktop: exposed checkbox grid */}
                  <div className="hidden md:grid grid-cols-2 gap-3">
                    {Object.keys(cloudHours).map(cloud => (
                      <label key={cloud} className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                        <input type="checkbox" checked={formData.selectedClouds.includes(cloud)} onChange={() => handleMultiSelect('selectedClouds', cloud)} className="w-4 h-4 text-blue-600" />
                        <span>{cloud}</span>
                      </label>
                    ))}
                  </div>
                  {/* Mobile: multi-select dropdown */}
                  <div className="block md:hidden">
                    <MultiSelectDropdown
                      options={Object.keys(cloudHours)}
                      selected={formData.selectedClouds}
                      onToggle={(cloud) => handleMultiSelect('selectedClouds', cloud)}
                      onClear={() => handleInputChange('selectedClouds', [])}
                      placeholder="Select Salesforce Clouds..."
                    />
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-3">Integrations</h3>
                {/* Desktop: exposed checkbox grid */}
                <div className="hidden md:grid grid-cols-2 gap-3">
                  {Object.keys(integrationHours).map(integration => (
                    <label key={integration} className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input type="checkbox" checked={formData.selectedIntegrations.includes(integration)} onChange={() => handleMultiSelect('selectedIntegrations', integration)} className="w-4 h-4 text-blue-600" />
                      <span>{integration}</span>
                    </label>
                  ))}
                </div>
                {/* Mobile: multi-select dropdown */}
                <div className="block md:hidden">
                  <MultiSelectDropdown
                    options={Object.keys(integrationHours)}
                    selected={formData.selectedIntegrations}
                    onToggle={(integration) => handleMultiSelect('selectedIntegrations', integration)}
                    onClear={() => handleInputChange('selectedIntegrations', [])}
                    placeholder="Select Integrations..."
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3">AI Tools</h3>
                {/* Desktop: exposed checkbox grid */}
                <div className="hidden md:grid grid-cols-2 gap-3">
                  {Object.keys(aiToolHours).map(tool => (
                    <label key={tool} className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input type="checkbox" checked={formData.selectedAITools.includes(tool)} onChange={() => handleMultiSelect('selectedAITools', tool)} className="w-4 h-4 text-blue-600" />
                      <span>{tool}</span>
                    </label>
                  ))}
                </div>
                {/* Mobile: multi-select dropdown */}
                <div className="block md:hidden">
                  <MultiSelectDropdown
                    options={Object.keys(aiToolHours)}
                    selected={formData.selectedAITools}
                    onToggle={(tool) => handleMultiSelect('selectedAITools', tool)}
                    onClear={() => handleInputChange('selectedAITools', [])}
                    placeholder="Select AI Tools..."
                  />
                </div>
              </div>

              {/* Mobile-only Assist Me button */}
              <div className="md:hidden">
                <button
                  onClick={() => onTriggerAIAction('autofill')}
                  disabled={aiUsageCount.autofill >= 3 || !(formData.projectDescription.trim() || formData.scopeGoals.trim() || formData.scopeProblems.trim() || formData.scopeRequirements.trim())}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SparklesIcon size={18} />
                  <span className="font-medium text-[14px]">Assist Me</span>
                </button>
                {!(formData.projectDescription.trim() || formData.scopeGoals.trim() || formData.scopeProblems.trim() || formData.scopeRequirements.trim()) && (
                  <p className="text-[10px] text-slate-400 text-center mt-1.5">Add scope details or a project description to enable AI assistance</p>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Services (Was Step 4) */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[18px] md:text-[20px] mb-2">Additional Services</h2>
                <p className="text-slate-600 text-[13px] md:text-[16px]">Select any additional modules or services you need.</p>
              </div>
              <div>
                <h3 className="mb-3 text-[14px] md:text-base">Service Modules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.keys(moduleHours).map(module => (
                    <label key={module} className="flex items-center gap-3 p-[10px] md:p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input type="checkbox" checked={formData.additionalModules.includes(module)} onChange={() => handleMultiSelect('additionalModules', module)} className="w-4 h-4 text-blue-600" />
                      <span className="text-[13px] md:text-[16px]">{module}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Team & Extras (Was Step 5) */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[18px] md:text-[20px] mb-2">Team Configuration</h2>
                <p className="text-slate-600 text-[14px] md:text-[16px]">Choose your delivery team and optional power-ups.</p>
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
                    <label key={powerUp} className="flex items-center gap-3 p-[10px] md:p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formData.powerUps.includes(powerUp)}
                        onChange={() => handleMultiSelect('powerUps', powerUp)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1 flex justify-between items-center">
                        <span className="text-[15px] text-[14px]">{powerUp}</span>
                        <span className="text-sm text-slate-500">+${powerUpRates[powerUp]}/hr</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col mt-8 pt-6 border-t border-slate-200">
            <div className="flex justify-between w-full">
            {currentStep > 1 && (
              <button
                onClick={() => { handlePrevStep(); window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }}
                disabled={isAnalyzing}
                className="px-5 py-3 md:px-6 md:py-2 min-h-[44px] min-w-[140px] md:min-w-[150px] flex items-center justify-center gap-2 text-[16px] md:text-[16px] border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <ArrowLeftIcon size={18} /> Previous
              </button>
            )}
            
            {currentStep < 6 ? (
              <button
                onClick={() => { handleNextStep(); window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }}
                disabled={isAnalyzing || isGeneratingSummary}
                className={`ml-auto flex items-center justify-center gap-2 px-5 py-3 md:px-6 md:py-2 min-h-[44px] min-w-[140px] md:min-w-[150px] text-[16px] md:text-[16px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${(isAnalyzing || isGeneratingSummary) ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isAnalyzing ? (
                   <>Analyzing... <Loader2Icon size={18} /></>
                ) : isGeneratingSummary ? (
                   <>Summarizing... <Loader2Icon size={18} /></>
                ) : (
                   <>Next <ArrowRightIcon size={18} /></>
                )}
              </button>
            ) : (
              <button
                onClick={() => { calculateQuote(); window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }}
                disabled={isFinalizing}
                className={`ml-auto flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-3 min-h-[44px] min-w-[140px] md:min-w-[150px] text-[16px] md:text-[16px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${isFinalizing ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isFinalizing ? (
                  <>
                    <Loader2Icon size={20} />
                    <span>Finalizing...</span>
                  </>
                ) : (
                  <>
                    <CalculatorIcon size={20} />
                    Get Quote
                  </>
                )}
              </button>
            )}
            </div>
            {/* Disclaimer for Step 2 */}
            {currentStep === 2 && (
              <p className="text-slate-500 text-center p-[0px] mx-[0px] mt-[16px] mb-[0px] text-[10px] md:text-[12px]">
                Clicking 'Next' triggers our AI Estimator to analyze uploaded docs & autofill fields.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}