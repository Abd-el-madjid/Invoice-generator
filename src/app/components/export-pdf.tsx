import React, { useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Invoice } from '@/types/project';

interface PDFInvoiceGeneratorProps {
  invoice: Invoice;
  onClose?: () => void;
}

export const PDFInvoiceGenerator: React.FC<PDFInvoiceGeneratorProps> = ({ invoice, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice_${invoice.metadata.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`,
    onAfterPrint: () => {
      if (onClose) onClose();
    },
  });

  // Auto-trigger print on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      handlePrint();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

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
                  <p>{invoice.metadata.companyName || 'Your Company Name'}</p>
                  <p>{invoice.metadata.companyEmail || 'email@company.com'}</p>
                  <p>{invoice.metadata.companyPhone || '+1234567890'}</p>
                </div>
                <div>
                  <p className="font-bold mb-2">TO:</p>
                  <p>{invoice.metadata.clientName || '_____________________________'}</p>
                  <p>_____________________________</p>
                  <p>_____________________________</p>
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
                <table className="w-full text-xs border-collapse mb-4" style={{ borderColor: '#000', border: '1px solid #000' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #000' }}>
                      <th className="text-left py-2 px-2" style={{ width: '5%', border: '1px solid #ddd' }}>No.</th>
                      <th className="text-left py-2 px-2" style={{ width: '45%', border: '1px solid #ddd' }}>Description</th>
                      <th className="text-right py-2 px-2" style={{ width: '10%', border: '1px solid #ddd' }}>Hours</th>
                      <th className="text-right py-2 px-2" style={{ width: '15%', border: '1px solid #ddd' }}>Rate</th>
                      <th className="text-right py-2 px-2" style={{ width: '25%', border: '1px solid #ddd' }}>Total ({invoice.metadata.currency})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                        <td className="py-2 px-2 text-left" style={{ border: '1px solid #ddd' }}>{idx + 1}</td>
                        <td className="py-2 px-2" style={{ border: '1px solid #ddd' }}>
                          <div className="font-semibold">{item.description}</div>
                          <div style={{ color: '#666', fontSize: '10px' }}>{item.detail}</div>
                          <div style={{ color: '#999', fontSize: '9px' }}>
                            {item.section} - {item.category}
                          </div>
                        </td>
                        <td className="py-2 px-2 text-right" style={{ border: '1px solid #ddd' }}>{item.hours}h</td>
                        <td className="py-2 px-2 text-right" style={{ border: '1px solid #ddd' }}>
                          {item.hours > 0 ? Math.round(item.price / item.hours) : 0}
                        </td>
                        <td className="py-2 px-2 text-right font-semibold" style={{ border: '1px solid #ddd' }}>
                          {item.price.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: '2px solid #000', fontWeight: 'bold' }}>
                      <td colSpan={4} className="py-2 px-2 text-right" style={{ border: '1px solid #ddd' }}>SUBTOTAL</td>
                      <td className="py-2 px-2 text-right" style={{ border: '1px solid #ddd' }}>
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
                    <td className="py-2 px-2" style={{ border: '1px solid #ddd' }}>1</td>
                    <td className="py-2 px-2" style={{ border: '1px solid #ddd' }}>Contract Signature</td>
                    <td className="py-2 px-2 text-right" style={{ border: '1px solid #ddd' }}>30%</td>
                    <td className="py-2 px-2 text-right font-semibold" style={{ border: '1px solid #ddd' }}>
                      {Math.round(invoice.totals.selectedPrice * 0.30).toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td className="py-2 px-2" style={{ border: '1px solid #ddd' }}>2</td>
                    <td className="py-2 px-2" style={{ border: '1px solid #ddd' }}>Milestone 1 - Design & Core Development</td>
                    <td className="py-2 px-2 text-right" style={{ border: '1px solid #ddd' }}>25%</td>
                    <td className="py-2 px-2 text-right font-semibold" style={{ border: '1px solid #ddd' }}>
                      {Math.round(invoice.totals.selectedPrice * 0.25).toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td className="py-2 px-2" style={{ border: '1px solid #ddd' }}>3</td>
                    <td className="py-2 px-2" style={{ border: '1px solid #ddd' }}>Milestone 2 - Feature Implementation</td>
                    <td className="py-2 px-2 text-right" style={{ border: '1px solid #ddd' }}>25%</td>
                    <td className="py-2 px-2 text-right font-semibold" style={{ border: '1px solid #ddd' }}>
                      {Math.round(invoice.totals.selectedPrice * 0.25).toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td className="py-2 px-2" style={{ border: '1px solid #ddd' }}>4</td>
                    <td className="py-2 px-2" style={{ border: '1px solid #ddd' }}>Milestone 3 - Testing & Deployment</td>
                    <td className="py-2 px-2 text-right" style={{ border: '1px solid #ddd' }}>15%</td>
                    <td className="py-2 px-2 text-right font-semibold" style={{ border: '1px solid #ddd' }}>
                      {Math.round(invoice.totals.selectedPrice * 0.15).toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td className="py-2 px-2" style={{ border: '1px solid #ddd' }}>5</td>
                    <td className="py-2 px-2" style={{ border: '1px solid #ddd' }}>Post-Launch Support (30 days)</td>
                    <td className="py-2 px-2 text-right" style={{ border: '1px solid #ddd' }}>5%</td>
                    <td className="py-2 px-2 text-right font-semibold" style={{ border: '1px solid #ddd' }}>
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
                  <p className="border-b border-black mb-3 pb-1">_____________________________</p>
                  <p className="text-xs mb-2">Date:</p>
                  <p className="border-b border-black mb-3 pb-1">_____________________________</p>
                  <p className="text-xs mb-2">Signature:</p>
                  <div className="border border-black h-16 mt-2"></div>
                </div>
                <div>
                  <p className="text-sm font-bold mb-4">Service Provider</p>
                  <p className="text-xs mb-2">{invoice.metadata.companyName || 'Your Company Name'}</p>
                  <p className="text-xs mb-2">{invoice.metadata.companyEmail || 'email@company.com'}</p>
                  <p className="text-xs mt-8">Date: {new Date().toLocaleDateString()}</p>
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

      <style jsx global>{`
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