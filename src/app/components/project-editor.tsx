import { useState, useMemo, useRef } from 'react';
import { Invoice, Section, Category, Feature, ExportFormat, PresentationStyle } from '@/types/project';
import { calculateTotals } from '@/utils/project-templates';
import { exportAsPrintableHTML, generateContractHTML, generateHTMLExport } from '@/utils/export-helpers';
import { ExportDialog } from '@/app/components/export-dialog';
import { PDFInvoiceGenerator } from '@/app/components/export-pdf';

import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Checkbox } from '@/app/components/ui/checkbox';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/app/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Separator } from '@/app/components/ui/separator';
import { 
  Download, 
  Plus, 
  Trash2, 
  Edit2, 
  Save,
  FileJson,
  FileText,
  Clock,
  DollarSign,
  CheckCircle2,
  Circle,
  AlertCircle,
  Printer,
  FileContract,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProjectEditorProps {
  invoice: Invoice;
  onInvoiceChange: (invoice: Invoice) => void;
  onNewProject: () => void;
}

export function ProjectEditor({ invoice, onInvoiceChange, onNewProject }: ProjectEditorProps) {
  const [editingMetadata, setEditingMetadata] = useState(false);
  const [addingSectionDialog, setAddingSectionDialog] = useState(false);
  const [addingFeatureDialog, setAddingFeatureDialog] = useState<{ sectionIdx: number; categoryIdx: number } | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newFeature, setNewFeature] = useState<Partial<Feature>>({
    desc: '',
    detail: '',
    hours: 0,
    price: 0,
    required: false,
    selected: true,
  });

  // Calculate totals
  const totals = useMemo(() => {
    return calculateTotals(invoice.sections);
  }, [invoice.sections]);

  // Update invoice when sections change
  const updateInvoice = (newSections: Section[]) => {
    const newTotals = calculateTotals(newSections);
    onInvoiceChange({
      ...invoice,
      sections: newSections,
      totals: newTotals,
    });
  };

  // Toggle feature selection
  const toggleFeature = (sectionIdx: number, categoryIdx: number, featureIdx: number) => {
    const newSections = [...invoice.sections];
    const feature = newSections[sectionIdx].categories[categoryIdx].features[featureIdx];
    feature.selected = !feature.selected;
    updateInvoice(newSections);
  };

  // Update feature
  const updateFeature = (
    sectionIdx: number,
    categoryIdx: number,
    featureIdx: number,
    updates: Partial<Feature>
  ) => {
    const newSections = [...invoice.sections];
    newSections[sectionIdx].categories[categoryIdx].features[featureIdx] = {
      ...newSections[sectionIdx].categories[categoryIdx].features[featureIdx],
      ...updates,
    };
    updateInvoice(newSections);
  };

  // Delete feature
  const deleteFeature = (sectionIdx: number, categoryIdx: number, featureIdx: number) => {
    const newSections = [...invoice.sections];
    newSections[sectionIdx].categories[categoryIdx].features.splice(featureIdx, 1);
    updateInvoice(newSections);
    toast.success('Feature deleted');
  };

  // Add new section
  const addSection = () => {
    if (!newSectionTitle.trim() || !newCategoryName.trim()) return;

    const newSection: Section = {
      title: newSectionTitle.toUpperCase(),
      categories: [
        {
          name: newCategoryName,
          features: [],
        },
      ],
    };

    updateInvoice([...invoice.sections, newSection]);
    setNewSectionTitle('');
    setNewCategoryName('');
    setAddingSectionDialog(false);
    toast.success('Section added');
  };

  // Delete section
  const deleteSection = (sectionIdx: number) => {
    const newSections = [...invoice.sections];
    newSections.splice(sectionIdx, 1);
    updateInvoice(newSections);
    toast.success('Section deleted');
  };

  // Add feature to category
  const addFeature = () => {
    if (!addingFeatureDialog || !newFeature.desc?.trim()) return;

    const { sectionIdx, categoryIdx } = addingFeatureDialog;
    const newSections = [...invoice.sections];
    newSections[sectionIdx].categories[categoryIdx].features.push({
      desc: newFeature.desc || '',
      detail: newFeature.detail || '',
      hours: newFeature.hours || 0,
      price: newFeature.price || 0,
      required: newFeature.required || false,
      selected: newFeature.selected || true,
    });

    updateInvoice(newSections);
    setNewFeature({ desc: '', detail: '', hours: 0, price: 0, required: false, selected: true });
    setAddingFeatureDialog(null);
    toast.success('Feature added');
  };

  // Export as JSON
  const exportJSON = () => {
    const dataStr = JSON.stringify(invoice, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.metadata.projectName.replace(/\s+/g, '_')}.json`;
    link.click();
    toast.success('JSON exported successfully');
  };
  // Export as pdf
  const [showPDFGenerator, setShowPDFGenerator] = useState(false);


  // Calculate estimated duration
  const estimatedWeeks = Math.ceil(totals.selectedHours / 40);
  const estimatedMonths = Math.ceil(estimatedWeeks / 4);

  // Print functionality
  const componentRef = useRef(null);
  // Dynamically import react-to-print only in browser
  const handlePrint = useMemo(() => {
    if (typeof window === 'undefined') return () => {}; // SSR guard
    const { useReactToPrint } = require('react-to-print');
    return useReactToPrint({
      content: () => componentRef.current,
    });
  }, []);

  return (
    <div className="grid lg:grid-cols-[1fr_350px] gap-6">
      {/* Main Editor */}
      <div className="space-y-6">
        {/* Metadata Card */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                {invoice.metadata.projectName}
              </h2>
              {invoice.metadata.clientName && (
                <p className="text-slate-600">Client: {invoice.metadata.clientName}</p>
              )}
              <p className="text-sm text-slate-500 mt-1">
                Created: {invoice.metadata.createdAt}
                {invoice.metadata.validUntil && ` • Valid until: ${invoice.metadata.validUntil}`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingMetadata(!editingMetadata)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
          </div>

          {editingMetadata && (
            <div className="space-y-3 pt-4 border-t">
              <div>
                <Label>Project Name</Label>
                <Input
                  value={invoice.metadata.projectName}
                  onChange={(e) =>
                    onInvoiceChange({
                      ...invoice,
                      metadata: { ...invoice.metadata, projectName: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>Client Name</Label>
                <Input
                  value={invoice.metadata.clientName || ''}
                  onChange={(e) =>
                    onInvoiceChange({
                      ...invoice,
                      metadata: { ...invoice.metadata, clientName: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          )}
        </Card>

        {/* Sections */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Project Sections</h3>
            <Button
              size="sm"
              onClick={() => setAddingSectionDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>

          <Accordion type="multiple" className="space-y-3">
            {invoice.sections.map((section, sectionIdx) => (
              <AccordionItem
                key={sectionIdx}
                value={`section-${sectionIdx}`}
                className="border rounded-lg bg-white"
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-semibold text-slate-900">{section.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        {section.categories.reduce((acc, cat) => acc + cat.features.length, 0)} features
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSection(sectionIdx);
                        }}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    {section.categories.map((category, categoryIdx) => (
                      <div key={categoryIdx} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-slate-900">{category.name}</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAddingFeatureDialog({ sectionIdx, categoryIdx })}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Feature
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {category.features.map((feature, featureIdx) => (
                            <FeatureCard
                              key={featureIdx}
                              feature={feature}
                              onToggle={() => toggleFeature(sectionIdx, categoryIdx, featureIdx)}
                              onUpdate={(updates) =>
                                updateFeature(sectionIdx, categoryIdx, featureIdx, updates)
                              }
                              onDelete={() => deleteFeature(sectionIdx, categoryIdx, featureIdx)}
                              currency={invoice.metadata.currency}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Sidebar - Totals & Actions */}
      <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        {/* Totals Card */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Project Summary</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-900 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Selected Items</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-blue-700">Hours</div>
                  <div className="text-xl font-bold text-blue-900">{totals.selectedHours}</div>
                </div>
                <div>
                  <div className="text-blue-700">Total</div>
                  <div className="text-xl font-bold text-blue-900">
                    {totals.selectedPrice.toLocaleString()} {invoice.metadata.currency}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">All Features:</span>
                <span className="font-medium">{totals.totalHours}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Selected:</span>
                <span className="font-medium text-blue-600">{totals.selectedHours}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Optional:</span>
                <span className="font-medium text-slate-500">
                  {totals.totalHours - totals.selectedHours}h
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                <span>Estimated Duration</span>
              </div>
              <div className="text-lg font-semibold text-slate-900">
                {estimatedMonths} {estimatedMonths === 1 ? 'month' : 'months'}
                <span className="text-sm font-normal text-slate-500 ml-2">
                  (~{estimatedWeeks} weeks)
                </span>
              </div>
            </div>

            {invoice.sections.some((s) =>
              s.categories.some((c) => c.features.some((f) => f.flag === 'needs_review'))
            ) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-xs text-amber-800">
                  Some items need review. Check for flagged features.
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Actions Card */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Export Options</h3>
          
          <div className="space-y-2">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={exportJSON}
            >
              <FileJson className="h-4 w-4 mr-2" />
              Export as JSON
            </Button>
            
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => setShowPDFGenerator(true)}

            >
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF 
            </Button>

            <Separator className="my-4" />

            <Button
              className="w-full"
              variant="outline"
              onClick={onNewProject}
            >
              Start New Project
            </Button>
            {showPDFGenerator && (
  <PDFInvoiceGenerator 
    invoice={invoice} 
    onClose={() => setShowPDFGenerator(false)} 
  />
)}
          </div>
        </Card>
      </div>

      {/* Add Section Dialog */}
      <Dialog open={addingSectionDialog} onOpenChange={setAddingSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
            <DialogDescription>
              Create a new section with a category for organizing features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Section Title</Label>
              <Input
                placeholder="e.g., CUSTOM INTEGRATIONS"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
              />
            </div>
            <div>
              <Label>First Category Name</Label>
              <Input
                placeholder="e.g., Third-Party APIs"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingSectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addSection}>Add Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Feature Dialog */}
      <Dialog
        open={addingFeatureDialog !== null}
        onOpenChange={(open) => !open && setAddingFeatureDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Feature</DialogTitle>
            <DialogDescription>
              Add a custom feature to this category.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Feature Name</Label>
              <Input
                placeholder="e.g., Payment Gateway Integration"
                value={newFeature.desc}
                onChange={(e) => setNewFeature({ ...newFeature, desc: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Detailed description of the feature"
                value={newFeature.detail}
                onChange={(e) => setNewFeature({ ...newFeature, detail: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hours</Label>
                <Input
                  type="number"
                  value={newFeature.hours}
                  onChange={(e) =>
                    setNewFeature({ ...newFeature, hours: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label>Price ({invoice.metadata.currency})</Label>
                <Input
                  type="number"
                  value={newFeature.price}
                  onChange={(e) =>
                    setNewFeature({ ...newFeature, price: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={newFeature.required}
                onCheckedChange={(checked) =>
                  setNewFeature({ ...newFeature, required: checked === true })
                }
              />
              <Label>Required feature</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingFeatureDialog(null)}>
              Cancel
            </Button>
            <Button onClick={addFeature}>Add Feature</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Feature Card Component
interface FeatureCardProps {
  feature: Feature;
  onToggle: () => void;
  onUpdate: (updates: Partial<Feature>) => void;
  onDelete: () => void;
  currency: string;
}

function FeatureCard({ feature, onToggle, onUpdate, onDelete, currency }: FeatureCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFeature, setEditedFeature] = useState(feature);

  const handleSave = () => {
    onUpdate(editedFeature);
    setIsEditing(false);
    toast.success('Feature updated');
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${
        feature.selected
          ? 'border-blue-200 bg-blue-50/50'
          : 'border-slate-200 bg-slate-50/50'
      } ${feature.flag === 'needs_review' ? 'border-amber-300' : ''}`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={feature.selected}
          onCheckedChange={onToggle}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <Input
                value={editedFeature.desc}
                onChange={(e) => setEditedFeature({ ...editedFeature, desc: e.target.value })}
                className="font-medium"
              />
              <Textarea
                value={editedFeature.detail}
                onChange={(e) => setEditedFeature({ ...editedFeature, detail: e.target.value })}
                rows={2}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={editedFeature.hours}
                  onChange={(e) =>
                    setEditedFeature({ ...editedFeature, hours: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="Hours"
                />
                <Input
                  type="number"
                  value={editedFeature.price}
                  onChange={(e) =>
                    setEditedFeature({ ...editedFeature, price: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="Price"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditedFeature(feature);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <h5 className="font-medium text-slate-900">{feature.desc}</h5>
                  {feature.required && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                      Required
                    </span>
                  )}
                  {feature.flag === 'needs_review' && (
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                      Needs Review
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="h-7 w-7 p-0"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onDelete}
                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-2">{feature.detail}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-600">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {feature.hours}h
                </span>
                <span className="font-medium text-slate-900">
                  {feature.price.toLocaleString()} {currency}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
