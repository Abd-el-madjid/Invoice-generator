import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import { Invoice } from '@/types/project';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Upload, X, Printer, Building, User } from 'lucide-react';
import { toast } from 'sonner';
import { styles } from '@/utils/pdf-style';

interface PDFInvoiceGeneratorProps {
  invoice: Invoice;
  onClose?: () => void;
}

// Helper function to format numbers
const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true 
  });
};

// PDF Document Component
const InvoicePDFDocument = ({ invoice, formData }: { invoice: Invoice; formData: any }) => {
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
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>INVOICE / DEVIS</Text>
              <Text style={styles.text}>{invoice.metadata.projectName}</Text>
            </View>
            <View>
              <Text style={styles.text}>Date: {invoice.metadata.createdAt}</Text>
              {invoice.metadata.validUntil && (
                <Text style={styles.text}>Valid Until: {invoice.metadata.validUntil}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Client Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.boldText}>FROM:</Text>
            <Text style={styles.text}>{formData.companyName || '_____________________________'}</Text>
            <Text style={styles.text}>{formData.companyEmail || '_____________________________'}</Text>
            {formData.companyPhone && <Text style={styles.text}>{formData.companyPhone}</Text>}
            {formData.companyAddress && <Text style={styles.text}>{formData.companyAddress}</Text>}
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.boldText}>TO:</Text>
            <Text style={styles.text}>{formData.clientName || '_____________________________'}</Text>
            <Text style={styles.text}>{formData.clientEmail || '_____________________________'}</Text>
            <Text style={styles.text}>{formData.clientPhone || '_____________________________'}</Text>
            <Text style={styles.text}>{formData.clientAddress || '_____________________________'}</Text>
          </View>
        </View>

        {/* Summary Info */}
        <View style={styles.summarySection}>
          <Text style={styles.text}>
            Estimated Duration: {estimatedMonths} months ({invoice.totals.selectedHours} hours)
          </Text>
          <Text style={styles.text}>
            Average Hourly Rate: {avgHourlyRate} {invoice.metadata.currency}/h
          </Text>
        </View>

        {/* Services Table */}
        {selectedItems.length > 0 && (
          <View style={styles.table}>
            <Text style={styles.sectionTitle}>Project Services</Text>
            
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.col1]}>No.</Text>
              <Text style={[styles.tableCell, styles.col2]}>Description</Text>
              <Text style={[styles.tableCell, styles.col3]}>Hours</Text>
              <Text style={[styles.tableCell, styles.col4]}>Rate</Text>
              <Text style={[styles.tableCell, styles.col5]}>Total ({invoice.metadata.currency})</Text>
            </View>

            {/* Table Rows */}
            {selectedItems.map((item, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col1]}>{idx + 1}</Text>
                <View style={styles.col2}>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                  <Text style={styles.itemDetail}>{item.detail}</Text>
                  <Text style={styles.itemMeta}>{item.section} - {item.category}</Text>
                </View>
                <Text style={[styles.tableCell, styles.col3]}>{item.hours}h</Text>
                <Text style={[styles.tableCell, styles.col4]}>
                  {item.hours > 0 ? Math.round(item.price / item.hours) : 0}
                </Text>
                <Text style={[styles.tableCell, styles.col5, { fontWeight: 'bold' }]}>
                  {formatNumber(item.price)}
                </Text>
              </View>
            ))}

            {/* Subtotal Row */}
            <View style={styles.totalRow}>
              <Text style={[styles.tableCell, { width: '75%', textAlign: 'right' }]}>SUBTOTAL</Text>
              <Text style={[styles.tableCell, styles.col5]}>
                {formatNumber(invoice.totals.selectedPrice)}
              </Text>
            </View>
          </View>
        )}

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalLine}>
              <Text>Subtotal:</Text>
              <Text style={styles.boldText}>
                {formatNumber(invoice.totals.selectedPrice)} {invoice.metadata.currency}
              </Text>
            </View>
            <View style={styles.totalLine}>
              <Text>Tax (0%):</Text>
              <Text style={styles.boldText}>0 {invoice.metadata.currency}</Text>
            </View>
            <View style={styles.grandTotal}>
              <Text style={{ fontSize: 12 }}>TOTAL:</Text>
              <Text style={{ fontSize: 14 }}>
                {formatNumber(invoice.totals.selectedPrice)} {invoice.metadata.currency}
              </Text>
            </View>
          </View>
        </View>
      </Page>

      {/* Second Page - Payment Schedule and Terms */}
      <Page size="A4" style={styles.page}>
        {/* Payment Schedule */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>Payment Schedule</Text>
          <View style={styles.paymentTable}>
            {/* Header */}
            <View style={[styles.paymentRow, { borderBottomWidth: 2, borderBottomColor: '#000' }]}>
              <Text style={[styles.tableCell, styles.paymentCol1]}>Phase</Text>
              <Text style={[styles.tableCell, styles.paymentCol2]}>Description</Text>
              <Text style={[styles.tableCell, styles.paymentCol3]}>%</Text>
              <Text style={[styles.tableCell, styles.paymentCol4]}>Amount ({invoice.metadata.currency})</Text>
            </View>

            {/* Payment Rows */}
            {[
              { phase: 1, desc: 'Contract Signature', pct: 30 },
              { phase: 2, desc: 'Milestone 1 - Design & Core Development', pct: 25 },
              { phase: 3, desc: 'Milestone 2 - Feature Implementation', pct: 25 },
              { phase: 4, desc: 'Milestone 3 - Testing & Deployment', pct: 15 },
              { phase: 5, desc: 'Post-Launch Support (30 days)', pct: 5 },
            ].map((payment) => (
              <View key={payment.phase} style={styles.paymentRow}>
                <Text style={[styles.tableCell, styles.paymentCol1]}>{payment.phase}</Text>
                <Text style={[styles.tableCell, styles.paymentCol2]}>{payment.desc}</Text>
                <Text style={[styles.tableCell, styles.paymentCol3]}>{payment.pct}%</Text>
                <Text style={[styles.tableCell, styles.paymentCol4, { fontWeight: 'bold' }]}>
                  {formatNumber(Math.round(invoice.totals.selectedPrice * (payment.pct / 100)))}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsSection}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          <Text style={styles.termItem}>• This quote is valid for 30 days from the date of issue</Text>
          <Text style={styles.termItem}>• 30 days of bug fixes included after deployment</Text>
          <Text style={styles.termItem}>• Complete technical documentation and user guides provided</Text>
          <Text style={styles.termItem}>• Payment due according to the schedule defined above</Text>
          <Text style={styles.termItem}>
            • Estimated project duration: {estimatedMonths} months ({invoice.totals.selectedHours} work hours)
          </Text>
          <Text style={styles.termItem}>• Major modifications or new features after delivery not included</Text>
          <Text style={styles.termItem}>• All intellectual property rights transferred upon final payment</Text>
        </View>

        {/* Acceptance Section */}
        <View style={styles.acceptanceSection}>
          <View style={styles.signatureBlock}>
            <Text style={styles.boldText}>Client Acceptance</Text>
            <Text style={[styles.text, { fontSize: 9, marginTop: 10 }]}>Name:</Text>
            <View style={styles.signatureLine}>
              <Text>{formData.clientName || '_____________________________'}</Text>
            </View>
            <Text style={[styles.text, { fontSize: 9 }]}>Date:</Text>
            <View style={styles.signatureLine}>
              <Text>_____________________________</Text>
            </View>
            <Text style={[styles.text, { fontSize: 9 }]}>Signature:</Text>
            {formData.clientSignature ? (
              <View style={styles.signatureBox}>
                <Image src={formData.clientSignature} style={styles.signatureImage} />
              </View>
            ) : (
              <View style={styles.signatureBox}></View>
            )}
          </View>

          <View style={styles.signatureBlock}>
            <Text style={styles.boldText}>Service Provider</Text>
            <Text style={[styles.text, { marginTop: 10 }]}>{formData.companyName || 'Your Company Name'}</Text>
            <Text style={styles.text}>{formData.companyEmail || 'email@company.com'}</Text>
            {formData.companyPhone && <Text style={styles.text}>{formData.companyPhone}</Text>}
            <Text style={[styles.text, { marginTop: 20 }]}>Date: {new Date().toLocaleDateString()}</Text>
            {formData.companySignature && (
              <View>
                <Text style={[styles.text, { fontSize: 9, marginTop: 10 }]}>Signature:</Text>
                <View style={styles.signatureBox}>
                  <Image src={formData.companySignature} style={styles.signatureImage} />
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Invoice generated on {new Date().toLocaleDateString()} - {invoice.metadata.projectName}</Text>
        </View>
      </Page>
    </Document>
  );
};

export const PDFInvoiceGenerator: React.FC<PDFInvoiceGeneratorProps> = ({ invoice, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const [formData, setFormData] = useState({
    companyName: invoice.metadata.companyName || '',
    companyEmail: invoice.metadata.companyEmail || '',
    companyPhone: invoice.metadata.companyPhone || '',
    companyAddress: invoice.metadata.companyAddress || '',
    clientName: invoice.metadata.clientName || '',
    clientEmail: invoice.metadata.clientEmail || '',
    clientPhone: invoice.metadata.clientPhone || '',
    clientAddress: invoice.metadata.clientAddress || '',
    companySignature: invoice.metadata.companySignature || '',
    clientSignature: invoice.metadata.clientSignature || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignatureUpload = (type: 'company' | 'client', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

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

  const generatePDF = async () => {
    if (!formData.companyName || !formData.companyEmail) {
      toast.error('Please fill in required company information (Name and Email)');
      return;
    }

    setIsGenerating(true);
    toast.info('Generating PDF...');

    try {
      // Create the PDF document
      const pdfDoc = <InvoicePDFDocument invoice={invoice} formData={formData} />;
      
      // Generate blob
      const blob = await pdf(pdfDoc).toBlob();
      
      // Create download link
      const fileName = `Invoice_${invoice.metadata.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      toast.success('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
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
                />
              </div>
            </div>
            <p className="text-sm text-slate-500 italic">
              Leave blank to show empty fields for manual completion
            </p>
          </TabsContent>

          <TabsContent value="signatures" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-6">
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
          <Button onClick={generatePDF} disabled={isGenerating} className="gap-2">
            <Printer className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};