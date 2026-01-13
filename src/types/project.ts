// Core TypeScript interfaces based on the JSON schema

export interface Feature {
  desc: string;
  detail: string;
  hours: number;
  price: number;
  required: boolean;
  selected: boolean;
  flag?: 'needs_review' | 'imported' | 'custom';
}

export interface Category {
  name: string;
  features: Feature[];
}

export interface Section {
  title: string;
  categories: Category[];
}

export interface Metadata {
  projectName: string;
  clientName?: string;
  currency: string;
  createdAt: string;
  validUntil?: string;
  domain?: string;
  projectType?: string;
  complexity?: string;
}

export interface Totals {
  totalHours: number;
  totalPrice: number;
  selectedHours?: number;
  selectedPrice?: number;
}

export interface Invoice {
  metadata: Metadata;
  sections: Section[];
  totals: Totals;
}

// Domain types for project creation
export type ProjectDomain = 
  | 'SaaS' 
  | 'AI' 
  | 'FinTech' 
  | 'E-commerce' 
  | 'Agriculture' 
  | 'Healthcare' 
  | 'GovTech' 
  | 'Logistics' 
  | 'Education' 
  | 'Enterprise Systems' 
  | 'Startup MVP' 
  | 'Custom Software';

export type ProjectType = 
  | 'Web App' 
  | 'Mobile App' 
  | 'Web + Mobile' 
  | 'Platform / Marketplace' 
  | 'Internal System' 
  | 'AI-Powered System';

export type ComplexityLevel = 
  | 'MVP' 
  | 'Standard' 
  | 'Advanced / Enterprise' 
  | 'Fully Custom';

export type ExportFormat = 
  | 'invoice' 
  | 'quotation' 
  | 'commercial-offer' 
  | 'technical-scope' 
  | 'contract' 
  | 'maintenance';

export type PresentationStyle = 
  | 'professional' 
  | 'startup' 
  | 'enterprise' 
  | 'negotiation' 
  | 'minimal';

export interface ProjectConfig {
  domain: ProjectDomain;
  projectType: ProjectType;
  complexity: ComplexityLevel;
}

export interface ParsedDocument {
  success: boolean;
  invoice?: Invoice;
  errors?: string[];
  warnings?: string[];
  source: 'json' | 'pdf-system' | 'pdf-external' | 'docx';
}
