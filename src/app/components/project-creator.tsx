import { useState } from 'react';
import { Invoice, ProjectDomain, ProjectType, ComplexityLevel, ProjectConfig } from '@/types/project';
import { generateProjectTemplate } from '@/utils/project-templates';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/app/components/ui/select';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

interface ProjectCreatorProps {
  onProjectCreated: (invoice: Invoice) => void;
  onCancel: () => void;
}

const DOMAINS: ProjectDomain[] = [
  'SaaS',
  'AI',
  'FinTech',
  'E-commerce',
  'Agriculture',
  'Healthcare',
  'GovTech',
  'Logistics',
  'Education',
  'Enterprise Systems',
  'Startup MVP',
  'Custom Software',
];

const PROJECT_TYPES: ProjectType[] = [
  'Web App',
  'Mobile App',
  'Web + Mobile',
  'Platform / Marketplace',
  'Internal System',
  'AI-Powered System',
];

const COMPLEXITY_LEVELS: ComplexityLevel[] = [
  'MVP',
  'Standard',
  'Advanced / Enterprise',
  'Fully Custom',
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'DZD', symbol: 'د.ج', name: 'Algerian Dinar' },
  { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham' },
];

export function ProjectCreator({ onProjectCreated, onCancel }: ProjectCreatorProps) {
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [domain, setDomain] = useState<ProjectDomain>('SaaS');
  const [projectType, setProjectType] = useState<ProjectType>('Web App');
  const [complexity, setComplexity] = useState<ComplexityLevel>('Standard');

  const handleGenerate = () => {
    const config: ProjectConfig = {
      domain,
      projectType,
      complexity,
    };

    const invoice = generateProjectTemplate(config);
    
    // Override with user inputs
    invoice.metadata.projectName = projectName || invoice.metadata.projectName;
    invoice.metadata.clientName = clientName;
    invoice.metadata.currency = currency;

    onProjectCreated(invoice);
  };

  const canProceedStep1 = projectName.trim().length > 0;
  const canProceedStep2 = domain && projectType && complexity;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step === s
                    ? 'bg-blue-600 text-white scale-110'
                    : step > s
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {s}
              </div>
              {s < 2 && (
                <div
                  className={`h-1 w-16 rounded transition-all ${
                    step > s ? 'bg-green-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-slate-600">
          {step === 1 ? 'Project Details' : 'Configuration'}
        </p>
      </div>

      <Card className="p-8">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Project Information
              </h2>
              <p className="text-slate-600">
                Let's start with the basic details of your project
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="projectName" className="text-sm font-medium">
                  Project Name *
                </Label>
                <Input
                  id="projectName"
                  placeholder="e.g., E-commerce Platform, AI Chatbot, Mobile App"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-1.5"
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="clientName" className="text-sm font-medium">
                  Client Name (Optional)
                </Label>
                <Input
                  id="clientName"
                  placeholder="e.g., Acme Corporation"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="currency" className="text-sm font-medium">
                  Currency
                </Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((cur) => (
                      <SelectItem key={cur.code} value={cur.code}>
                        {cur.symbol} {cur.name} ({cur.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={onCancel}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next Step
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Project Configuration
              </h2>
              <p className="text-slate-600">
                Choose the domain, type, and complexity level
              </p>
            </div>

            <div className="space-y-6">
              {/* Domain Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Project Domain
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DOMAINS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDomain(d)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        domain === d
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="font-medium text-sm">{d}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Type Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Project Type
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PROJECT_TYPES.map((pt) => (
                    <button
                      key={pt}
                      onClick={() => setProjectType(pt)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        projectType === pt
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="font-medium">{pt}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Complexity Level */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Complexity Level
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {COMPLEXITY_LEVELS.map((cl, idx) => (
                    <button
                      key={cl}
                      onClick={() => setComplexity(cl)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        complexity === cl
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium">{cl}</div>
                        <div className="text-xs text-slate-500">
                          {idx === 0 && '~2-4 months'}
                          {idx === 1 && '~4-8 months'}
                          {idx === 2 && '~8-16 months'}
                          {idx === 3 && 'Custom timeline'}
                        </div>
                      </div>
                      <div className="text-xs text-slate-600">
                        {idx === 0 && 'Basic features, fast delivery'}
                        {idx === 1 && 'Full-featured, production-ready'}
                        {idx === 2 && 'Enterprise-grade, scalable'}
                        {idx === 3 && 'Tailored to exact needs'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!canProceedStep2}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Project
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Preview Summary */}
      {step === 2 && (
        <Card className="mt-6 p-6 bg-slate-50 border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3">Project Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Project Name:</span>
              <span className="font-medium text-slate-900">{projectName}</span>
            </div>
            {clientName && (
              <div className="flex justify-between">
                <span className="text-slate-600">Client:</span>
                <span className="font-medium text-slate-900">{clientName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">Domain:</span>
              <span className="font-medium text-slate-900">{domain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Type:</span>
              <span className="font-medium text-slate-900">{projectType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Complexity:</span>
              <span className="font-medium text-slate-900">{complexity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Currency:</span>
              <span className="font-medium text-slate-900">{currency}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
