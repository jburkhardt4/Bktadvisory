export type PersonaMode = 'lite' | 'enterprise';
export type PersonaRole = 'business-owner' | 'technical-lead' | 'project-manager' | 'other';

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
  personaMode?: PersonaMode;
  personaRole?: PersonaRole;
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

export const initialFormData: FormData = {
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
