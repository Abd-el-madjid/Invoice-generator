import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Invoice } from '@/types/project';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Upload, X, Printer, Building, User } from 'lucide-react';
import { toast } from 'sonner';

interface PDFInvoiceGeneratorProps {
  invoice: Invoice;
  onClose?: () => void;
}

export const PDFInvoiceGenerator: React.FC<PDFInvoiceGeneratorProps> = ({ invoice, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    // Company info
    companyName: invoice.metadata.companyName || '',
    companyEmail: invoice.metadata.companyEmail || '',
    companyPhone: invoice.metadata.companyPhone || '',
    companyAddress: invoice.metadata.companyAddress || '',
    // Client info
    clientName: invoice.metadata.clientName || '',
    clientEmail: invoice.metadata.clientEmail || '',
    clientPhone: invoice.metadata.clientPhone || '',
    clientAddress: invoice.metadata.clientAddress || '',
    // Signatures
    companySignature: invoice.metadata.companySignature || '',
    clientSignature: invoice.metadata.clientSignature || '',
  });

  const [showForm, setShowForm] = useState(true);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignatureUpload = (type: 'company' | 'client', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleInputChange(`${type}Signature`, base64String);
        toast.success('Signature uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveSignature = (type: 'company' | 'client') => {
    handleInputChange(`${type}Signature`, '');
    toast.success('Signature removed');
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice_${invoice.metadata.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`,
  });

  const handleGeneratePDF = () => {
    setShowForm(false);
    setTimeout(() => {
      handlePrint();
      setTimeout(() => {
        setShowForm(true);
      }, 500);
    }, 100);
  };

  const getSelectedItems = () => {
    const items: Array<{
      section: string;
      category: string;
      description: string;
      detail: string;
      hours: number;
      price: number;
    }> = [];

    invoice.sections.forEach((section) => {
      section.categories.forEach((category) => {
        category.features.forEach((feature) => {
          if (feature.selected) {
            items.push({
              section: section.title,
              category: category.name,
              description: feature.desc,
              detail: feature.detail,
              hours: feature.hours,
              price: feature.price,
            });
          }
        });
      });
    });

    return items;
  };

  const selectedItems = getSelectedItems();
  const estimatedWeeks = Math.ceil(invoice.totals.selectedHours / 40);
  const estimatedMonths = (estimatedWeeks / 4.33).toFixed(1);
  const avgHourlyRate = invoice.totals.selectedHours > 0 
    ? Math.round(invoice.totals.selectedPrice / invoice.totals.selectedHours) 
    : 0;

  return (
    <>
      {/* Form Dialog */}
      <Dialog open={showForm && !!onClose} onOpenChange={(open) => !open && onClose?.()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Configure PDF Export
            </DialogTitle>
            <DialogDescription>
              Fill in the company and client information before generating the PDF
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="company" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="company">
                <Building className="h-4 w-4 mr-2" />
                Company Info
              </TabsTrigger>
              <TabsTrigger value="client">
                <User className="h-4 w-4 mr-2" />
                Client Info
              </TabsTrigger>
              <TabsTrigger value="signatures">Signatures</TabsTrigger>
            </TabsList>

            <TabsContent value="company" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Your Company Ltd."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email *</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={formData.companyEmail}
                    onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                    placeholder="contact@company.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Phone</Label>
                  <Input
                    id="companyPhone"
                    type="tel"
                    value={formData.companyPhone}
                    onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Address</Label>
                  <Input
                    id="companyAddress"
                    value={formData.companyAddress}
                    onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                    placeholder="123 Business St, City, Country"
                    // rows={2}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="client" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    placeholder="Client Company or Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                    placeholder="client@email.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Phone</Label>
                  <Input
                    id="clientPhone"
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                    placeholder="+1 (555) 987-6543"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientAddress">Address</Label>
                  <Input
                    id="clientAddress"
                    value={formData.clientAddress}
                    onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                    placeholder="456 Client Ave, City, Country"
                    // rows={2}
                  />
                </div>
              </div>
              <p className="text-sm text-slate-500 italic">
                Leave blank to show empty fields for manual completion
              </p>
            </TabsContent>

            <TabsContent value="signatures" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-6">
                {/* Company Signature */}
                <div className="space-y-3">
                  <Label>Company Signature (Optional)</Label>
                  {formData.companySignature ? (
                    <div className="relative border rounded-lg p-4 bg-slate-50">
                      <img 
                        src={formData.companySignature} 
                        alt="Company Signature" 
                        className="max-h-24 mx-auto"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => handleRemoveSignature('company')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm text-slate-600 mb-2">Upload signature image</p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSignatureUpload('company', e)}
                        className="max-w-xs mx-auto"
                      />
                    </div>
                  )}
                </div>

                {/* Client Signature */}
                <div className="space-y-3">
                  <Label>Client Signature (Optional)</Label>
                  {formData.clientSignature ? (
                    <div className="relative border rounded-lg p-4 bg-slate-50">
                      <img 
                        src={formData.clientSignature} 
                        alt="Client Signature" 
                        className="max-h-24 mx-auto"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => handleRemoveSignature('client')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm text-slate-600 mb-2">Leave blank for manual signature</p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSignatureUpload('client', e)}
                        className="max-w-xs mx-auto"
                      />
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Accepted formats: JPG, PNG, SVG • Max size: 2MB
              </p>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleGeneratePDF} className="gap-2">
              <Printer className="h-4 w-4" />
              Generate PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden PDF Content */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={printRef}>
          <div className="p-8 bg-white text-black" style={{ fontFamily: 'Arial, sans-serif', fontSize: '11pt' }}>
            {/* Header */}
            <div className="mb-8 pb-4 border-b-2 border-black">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-1" style={{ color: '#000' }}>INVOICE / DEVIS</h1>
                  <p className="text-sm">{invoice.metadata.projectName}</p>
                </div>
                <div className="text-right text-sm">
                  <p>Date: {invoice.metadata.createdAt}</p>
                  {invoice.metadata.validUntil && (
                    <p>Valid Until: {invoice.metadata.validUntil}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="mb-8 text-sm">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-bold mb-2">FROM:</p>
                  <p>{formData.companyName || '_____________________________'}</p>
                  <p>{formData.companyEmail || '_____________________________'}</p>
                  {formData.companyPhone && <p>{formData.companyPhone}</p>}
                  {formData.companyAddress && <p>{formData.companyAddress}</p>}
                </div>
                <div>
                  <p className="font-bold mb-2">TO:</p>
                  <p>{formData.clientName || '_____________________________'}</p>
                  <p>{formData.clientEmail || '_____________________________'}</p>
                  {formData.clientPhone ? <p>{formData.clientPhone}</p> : <p>_____________________________</p>}
                  {formData.clientAddress ? <p>{formData.clientAddress}</p> : <p>_____________________________</p>}
                </div>
              </div>
            </div>

            {/* Summary Info */}
            <div className="mb-8 text-sm">
              <p><strong>Estimated Duration:</strong> {estimatedMonths} months ({invoice.totals.selectedHours} hours)</p>
              <p><strong>Average Hourly Rate:</strong> {avgHourlyRate} {invoice.metadata.currency}/h</p>
            </div>

            {/* Services Table */}
            {selectedItems.length > 0 && (
              <div className="mb-8">
                <h2 className="text-base font-bold mb-3 uppercase">Project Services</h2>
                <table className="w-full text-xs border-collapse mb-4"
                // style={{ borderColor: '#000', border: '1px solid #000' }}
                >
                  <thead>
                    <tr style={{ borderBottom: '2px solid #000' }}>
                      <th className="text-left py-2 px-2" style={{ width: '5%' }}>No.</th>
                      <th className="text-left py-2 px-2" style={{ width: '45%' }}>Description</th>
                      <th className="text-right py-2 px-2" style={{ width: '10%' }}>Hours</th>
                      <th className="text-right py-2 px-2" style={{ width: '15%' }}>Rate</th>
                      <th className="text-right py-2 px-2" style={{ width: '25%' }}>Total ({invoice.metadata.currency})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                        <td className="py-2 px-2 text-left" >{idx + 1}</td>
                        <td className="py-2 px-2" >
                          <div className="font-semibold">{item.description}</div>
                          <div style={{ color: '#666', fontSize: '10px' }}>{item.detail}</div>
                          <div style={{ color: '#999', fontSize: '9px' }}>
                            {item.section} - {item.category}
                          </div>
                        </td>
                        <td className="py-2 px-2 text-right" >{item.hours}h</td>
                        <td className="py-2 px-2 text-right" >
                          {item.hours > 0 ? Math.round(item.price / item.hours) : 0}
                        </td>
                        <td className="py-2 px-2 text-right font-semibold" >
                          {item.price.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: '2px solid #000', fontWeight: 'bold' }}>
                      <td colSpan={4} className="py-2 px-2 text-right" >SUBTOTAL</td>
                      <td className="py-2 px-2 text-right" >
                        {invoice.totals.selectedPrice.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals Section */}
            <div className="mb-8 border-t-2 border-black pt-4">
              <div className="flex justify-end">
                <div style={{ width: '50%' }}>
                  <div className="flex justify-between py-2 text-sm">
                    <span>Subtotal:</span>
                    <span className="font-semibold">
                      {invoice.totals.selectedPrice.toLocaleString()} {invoice.metadata.currency}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 text-sm">
                    <span>Tax (0%):</span>
                    <span className="font-semibold">0 {invoice.metadata.currency}</span>
                  </div>
                  <div className="flex justify-between py-3 text-base border-t-2 border-black mt-2">
                    <span className="font-bold">TOTAL:</span>
                    <span className="font-bold text-lg">
                      {invoice.totals.selectedPrice.toLocaleString()} {invoice.metadata.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Schedule */}
            <div className="mb-8">
              <h2 className="text-base font-bold mb-3 uppercase">Payment Schedule</h2>
              <table className="w-full text-xs border-collapse" style={{ borderColor: '#000', border: '1px solid #000' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #000' }}>
                    <th className="text-left py-2 px-2" style={{ width: '10%', border: '1px solid #ddd' }}>Phase</th>
                    <th className="text-left py-2 px-2" style={{ width: '55%', border: '1px solid #ddd' }}>Description</th>
                    <th className="text-right py-2 px-2" style={{ width: '15%', border: '1px solid #ddd' }}>%</th>
                    <th className="text-right py-2 px-2" style={{ width: '20%', border: '1px solid #ddd' }}>Amount ({invoice.metadata.currency})</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td className="py-2 px-2" >1</td>
                    <td className="py-2 px-2" >Contract Signature</td>
                    <td className="py-2 px-2 text-right" >30%</td>
                    <td className="py-2 px-2 text-right font-semibold" >
                      {Math.round(invoice.totals.selectedPrice * 0.30).toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td className="py-2 px-2" >2</td>
                    <td className="py-2 px-2" >Milestone 1 - Design & Core Development</td>
                    <td className="py-2 px-2 text-right" >25%</td>
                    <td className="py-2 px-2 text-right font-semibold" >
                      {Math.round(invoice.totals.selectedPrice * 0.25).toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td className="py-2 px-2" >3</td>
                    <td className="py-2 px-2" >Milestone 2 - Feature Implementation</td>
                    <td className="py-2 px-2 text-right" >25%</td>
                    <td className="py-2 px-2 text-right font-semibold" >
                      {Math.round(invoice.totals.selectedPrice * 0.25).toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td className="py-2 px-2" >4</td>
                    <td className="py-2 px-2" >Milestone 3 - Testing & Deployment</td>
                    <td className="py-2 px-2 text-right" >15%</td>
                    <td className="py-2 px-2 text-right font-semibold" >
                      {Math.round(invoice.totals.selectedPrice * 0.15).toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td className="py-2 px-2" >5</td>
                    <td className="py-2 px-2" >Post-Launch Support (30 days)</td>
                    <td className="py-2 px-2 text-right" >5%</td>
                    <td className="py-2 px-2 text-right font-semibold" >
                      {Math.round(invoice.totals.selectedPrice * 0.05).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Terms and Conditions */}
            <div className="mb-8">
              <h2 className="text-base font-bold mb-3 uppercase">Terms & Conditions</h2>
              <div className="text-xs space-y-1">
                <p>• This quote is valid for 30 days from the date of issue</p>
                <p>• 30 days of bug fixes included after deployment</p>
                <p>• Complete technical documentation and user guides provided</p>
                <p>• Payment due according to the schedule defined above</p>
                <p>• Estimated project duration: {estimatedMonths} months ({invoice.totals.selectedHours} work hours)</p>
                <p>• Major modifications or new features after delivery not included</p>
                <p>• All intellectual property rights transferred upon final payment</p>
              </div>
            </div>

            {/* Acceptance Section */}
            <div className="mb-8 border-t-2 border-black pt-6">
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <p className="text-sm font-bold mb-4">Client Acceptance</p>
                  <p className="text-xs mb-2">Name:</p>
                  <p className="border-b border-black mb-3 pb-1">
                    {formData.clientName || '_____________________________'}
                  </p>
                  <p className="text-xs mb-2">Date:</p>
                  <p className="border-b border-black mb-3 pb-1">_____________________________</p>
                  <p className="text-xs mb-2">Signature:</p>
                  {formData.clientSignature ? (
                    <div className="border border-black p-2 h-20 flex items-center justify-center">
                      <img 
                        src={formData.clientSignature} 
                        alt="Client Signature" 
                        style={{ maxHeight: '60px', maxWidth: '100%' }}
                      />
                    </div>
                  ) : (
                    <div className="border border-black h-16 mt-2"></div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold mb-4">Service Provider</p>
                  <p className="text-xs mb-2">{formData.companyName || 'Your Company Name'}</p>
                  <p className="text-xs mb-2">{formData.companyEmail || 'email@company.com'}</p>
                  {formData.companyPhone && <p className="text-xs mb-2">{formData.companyPhone}</p>}
                  <p className="text-xs mt-8">Date: {new Date().toLocaleDateString()}</p>
                  {formData.companySignature && (
                    <div className="mt-4">
                      <p className="text-xs mb-2">Signature:</p>
                      <div className="border border-black p-2 h-20 flex items-center justify-center">
                        <img 
                          src={formData.companySignature} 
                          alt="Company Signature" 
                          style={{ maxHeight: '60px', maxWidth: '100%' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-black pt-3 text-center text-xs" style={{ color: '#666' }}>
              <p>Invoice generated on {new Date().toLocaleDateString()} - {invoice.metadata.projectName}</p>
              <p>Page 1/1</p>
            </div>
          </div>
        </div>
      </div>

      <style >{`
        @media print {
          body { 
            print-color-adjust: exact; 
            -webkit-print-color-adjust: exact; 
            margin: 0;
            padding: 0;
          }
          @page { 
            margin: 15mm;
            size: A4; 
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </>
  );
};
