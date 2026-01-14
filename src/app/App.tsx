import { useState, useEffect } from 'react';
import { Invoice } from '@/types/project';
import { WorkflowSelection } from '@/app/components/workflow-selection';
import { ProjectCreator } from '@/app/components/project-creator';
import { DocumentUploader } from '@/app/components/document-uploader';
import { ProjectEditor } from '@/app/components/project-editor';
import { Toaster } from '@/app/components/ui/sonner';
import { FileText, Sparkles } from 'lucide-react';
import Logo from '@/app/assets/logo.webp';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

type WorkflowMode = 'selection' | 'create' | 'rebuild' | 'editing';

const STORAGE_KEY = 'smart-project-builder-state';

export default function App() {
  const [mode, setMode] = useState<WorkflowMode>('selection');
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const { mode: savedMode, invoice } = JSON.parse(savedState);
        if (savedMode && invoice) {
          setMode(savedMode);
          setCurrentInvoice(invoice);
        }
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (currentInvoice) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, invoice: currentInvoice }));
    } else if (mode === 'selection') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [mode, currentInvoice]);

  const handleWorkflowSelect = (workflow: 'create' | 'rebuild') => {
    setMode(workflow);
  };

  const handleProjectCreated = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setMode('editing');
  };

  const handleDocumentParsed = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setMode('editing');
  };

  const handleBackToSelection = () => {
    setMode('selection');
    setCurrentInvoice(null);
  };

  const handleNewProject = () => {
    setMode('selection');
    setCurrentInvoice(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10  rounded-lg flex items-center justify-center">
                <img src={Logo}
                  alt="Logo"
                  className="h-10 w-8 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900">Smart Project Builder</h1>
                <p className="text-xs text-slate-500">Invoice, Contract & Document Generator</p>
              </div>
            </div>
            
            {mode !== 'selection' && (
              <button
                onClick={handleBackToSelection}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ← Back to Home
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mode === 'selection' && (
          <WorkflowSelection onSelectWorkflow={handleWorkflowSelect} />
        )}

        {mode === 'create' && (
          <ProjectCreator 
            onProjectCreated={handleProjectCreated}
            onCancel={handleBackToSelection}
          />
        )}

        {mode === 'rebuild' && (
          <DocumentUploader
            onDocumentParsed={handleDocumentParsed}
            onCancel={handleBackToSelection}
          />
        )}

        {mode === 'editing' && currentInvoice && (
          <ProjectEditor
            invoice={currentInvoice}
            onInvoiceChange={setCurrentInvoice}
            onNewProject={handleNewProject}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>© 2026  K-Abd El Madjid - Built with intention, designed with purpose.</p>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Auto-saved • Data persists in browser</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      <Toaster />
       {/* Vercel Analytics */}
      <SpeedInsights  sampleRate={100} // send metrics for 100% of users
  debug={false} />
      <Analytics />
    </div>
  );
}
