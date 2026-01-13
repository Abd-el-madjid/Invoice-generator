import { FileUp, Sparkles, ArrowRight } from 'lucide-react';
import { Card } from '@/app/components/ui/card';

interface WorkflowSelectionProps {
  onSelectWorkflow: (workflow: 'create' | 'rebuild') => void;
}

export function WorkflowSelection({ onSelectWorkflow }: WorkflowSelectionProps) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">
          How would you like to start?
        </h2>
        <p className="text-lg text-slate-600">
          Create a new project from scratch or rebuild from an existing document
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Workflow A: Create from Scratch */}
        <Card 
          className="p-8 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500 group"
          onClick={() => onSelectWorkflow('create')}
        >
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Create Project From Scratch
            </h3>
            
            <p className="text-slate-600 mb-6">
              Build a complete project template by selecting your domain, project type, and complexity level. 
              Get instant estimates with editable features.
            </p>

            <div className="w-full space-y-2 mb-6 text-left">
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5" />
                <span>Choose from 12+ domains (SaaS, AI, FinTech, etc.)</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5" />
                <span>Select project type (Web, Mobile, Platform)</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5" />
                <span>Auto-generated features with realistic pricing</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5" />
                <span>Fully editable sections and features</span>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 group-hover:gap-3">
              Start Creating
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </Card>

        {/* Workflow B: Rebuild from Document */}
        <Card 
          className="p-8 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-emerald-500 group"
          onClick={() => onSelectWorkflow('rebuild')}
        >
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileUp className="h-8 w-8 text-white" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Rebuild From Document
            </h3>
            
            <p className="text-slate-600 mb-6">
              Upload an existing invoice, quote, or contract (JSON, PDF, DOCX) and convert it 
              into a fully editable project structure.
            </p>

            <div className="w-full space-y-2 mb-6 text-left">
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full mt-1.5" />
                <span>Upload JSON, PDF, or DOCX files</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full mt-1.5" />
                <span>Intelligent parsing with validation</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full mt-1.5" />
                <span>Preserves original structure and data</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full mt-1.5" />
                <span>Edit and export in multiple formats</span>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2 group-hover:gap-3">
              Upload Document
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </Card>
      </div>

      {/* Features Section */}
      <div className="mt-16 bg-white rounded-xl p-8 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">
          What You Can Do With This Tool
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">✏️</span>
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Fully Editable</h4>
            <p className="text-sm text-slate-600">
              Add, remove, or modify any section, category, or feature. Complete control over your project.
            </p>
          </div>

          <div className="text-center">
            <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">⚡</span>
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Live Calculations</h4>
            <p className="text-sm text-slate-600">
              Auto-calculates totals, hours, and delivery timelines as you make changes.
            </p>
          </div>

          <div className="text-center">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📄</span>
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Export Formats</h4>
            <p className="text-sm text-slate-600">
              Generate invoices, contracts, technical scopes, and commercial offers in PDF or JSON.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
