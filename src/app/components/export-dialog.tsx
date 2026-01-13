import { useState } from 'react';
import { Invoice, ExportFormat, PresentationStyle } from '@/types/project';
import { exportAsPrintableHTML, generateContractHTML } from '@/utils/export-helpers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Separator } from '@/app/components/ui/separator';
import { 
  FileText, 
  FileContract, 
  Printer,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
}

export function ExportDialog({ open, onOpenChange, invoice }: ExportDialogProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('quotation');
  const [presentationStyle, setPresentationStyle] = useState<PresentationStyle>('professional');
  const [includeOptional, setIncludeOptional] = useState(true);

  const handleExport = () => {
    try {
      if (exportFormat === 'contract') {
        // Open contract in new window
        const contractHTML = generateContractHTML(invoice);
        const printWindow = window.open('', '_blank');
        
        if (printWindow) {
          printWindow.document.write(contractHTML);
          printWindow.document.close();
          toast.success('Contract opened in new window');
        }
      } else {
        // Export as printable HTML
        exportAsPrintableHTML(invoice, {
          format: exportFormat,
          style: presentationStyle,
          includeOptional,
        });
        toast.success('Document opened for printing');
      }
      
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to export document');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Document</DialogTitle>
          <DialogDescription>
            Choose the format and style for your exported document
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Export Format */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Document Type</Label>
            <RadioGroup value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    exportFormat === 'quotation'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <RadioGroupItem value="quotation" className="mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900">Quotation</div>
                    <div className="text-xs text-slate-600">Client pricing proposal</div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    exportFormat === 'invoice'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <RadioGroupItem value="invoice" className="mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900">Invoice</div>
                    <div className="text-xs text-slate-600">Billing document</div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    exportFormat === 'commercial-offer'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <RadioGroupItem value="commercial-offer" className="mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900">Commercial Offer</div>
                    <div className="text-xs text-slate-600">1-page summary</div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    exportFormat === 'technical-scope'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <RadioGroupItem value="technical-scope" className="mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900">Technical Scope</div>
                    <div className="text-xs text-slate-600">Detailed specifications</div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    exportFormat === 'contract'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <RadioGroupItem value="contract" className="mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900">Contract</div>
                    <div className="text-xs text-slate-600">Legal agreement draft</div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    exportFormat === 'maintenance'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <RadioGroupItem value="maintenance" className="mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900">Maintenance</div>
                    <div className="text-xs text-slate-600">Support agreement</div>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Presentation Style */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Presentation Style</Label>
            <RadioGroup
              value={presentationStyle}
              onValueChange={(v) => setPresentationStyle(v as PresentationStyle)}
            >
              <div className="space-y-2">
                {[
                  { value: 'professional', label: 'Professional', desc: 'Clean and modern design' },
                  { value: 'startup', label: 'Startup', desc: 'Bold and energetic style' },
                  { value: 'enterprise', label: 'Enterprise', desc: 'Formal and traditional' },
                  { value: 'minimal', label: 'Minimal', desc: 'Simple and lightweight' },
                ].map((style) => (
                  <label
                    key={style.value}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      presentationStyle === style.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <RadioGroupItem value={style.value} />
                    <div>
                      <div className="font-medium text-slate-900">{style.label}</div>
                      <div className="text-xs text-slate-600">{style.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Options */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Options</Label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={includeOptional}
                  onCheckedChange={(checked) => setIncludeOptional(checked === true)}
                />
                <div>
                  <div className="font-medium text-slate-900">Include Optional Features</div>
                  <div className="text-xs text-slate-600">
                    Show all features, not just selected ones
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="h-4 w-4 mr-2" />
            Generate & Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
