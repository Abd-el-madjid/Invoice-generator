import { Invoice, ExportFormat, PresentationStyle } from '@/types/project';

export interface ExportOptions {
  format: ExportFormat;
  style?: PresentationStyle;
  includeOptional?: boolean;
  includeNotes?: boolean;
}

// Generate HTML for PDF export (can be used with browser print or PDF libraries)
export function generateHTMLExport(invoice: Invoice, options: ExportOptions): string {
  const { format, style = 'professional', includeOptional = true } = options;

  const selectedFeatures = invoice.sections.flatMap((section) =>
    section.categories.flatMap((category) =>
      category.features.filter((feature) => feature.selected || (includeOptional && !feature.required))
    )
  );

  const totalSelectedHours = selectedFeatures.reduce((sum, f) => sum + f.hours, 0);
  const totalSelectedPrice = selectedFeatures.reduce((sum, f) => sum + f.price, 0);

  const styles = getStylesForPresentation(style);

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${invoice.metadata.projectName} - ${format.toUpperCase()}</title>
  <style>
    ${styles}
  </style>
</head>
<body>
  <div class="document">
    ${generateHeader(invoice, format)}
    ${generateBody(invoice, format, includeOptional)}
    ${generateFooter(invoice, totalSelectedHours, totalSelectedPrice)}
  </div>
</body>
</html>
  `;

  return html;
}

function getStylesForPresentation(style: PresentationStyle): string {
  const baseStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: white;
    }
    .document { 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 40px;
      background: white;
    }
    .header { 
      margin-bottom: 40px; 
      padding-bottom: 20px;
      border-bottom: 3px solid #3b82f6;
    }
    .header h1 { 
      font-size: 28px; 
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .header .subtitle { 
      font-size: 14px; 
      color: #64748b;
    }
    .metadata { 
      margin-top: 16px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      font-size: 13px;
    }
    .metadata-item { 
      display: flex;
      justify-content: space-between;
    }
    .metadata-label { 
      color: #64748b;
      font-weight: 500;
    }
    .metadata-value { 
      color: #0f172a;
      font-weight: 600;
    }
    .section { 
      margin-bottom: 32px;
      page-break-inside: avoid;
    }
    .section-title { 
      font-size: 18px; 
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
    }
    .category { 
      margin-bottom: 24px;
    }
    .category-name { 
      font-size: 15px; 
      font-weight: 600;
      color: #475569;
      margin-bottom: 12px;
    }
    .feature { 
      margin-bottom: 12px;
      padding: 12px;
      background: #f8fafc;
      border-left: 3px solid #3b82f6;
      border-radius: 4px;
    }
    .feature-header { 
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 6px;
    }
    .feature-name { 
      font-weight: 600;
      color: #0f172a;
      font-size: 14px;
    }
    .feature-badge { 
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 12px;
      background: #dbeafe;
      color: #1e40af;
      font-weight: 600;
      text-transform: uppercase;
    }
    .feature-detail { 
      font-size: 13px;
      color: #64748b;
      margin-bottom: 8px;
    }
    .feature-meta { 
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: #475569;
    }
    .feature-hours::before { content: '⏱ '; }
    .feature-price::before { content: '💰 '; }
    .totals { 
      margin-top: 40px;
      padding: 24px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      border-radius: 8px;
    }
    .totals h3 { 
      font-size: 18px;
      margin-bottom: 16px;
    }
    .totals-grid { 
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .total-item { 
      background: rgba(255,255,255,0.1);
      padding: 12px;
      border-radius: 6px;
    }
    .total-label { 
      font-size: 12px;
      opacity: 0.9;
      margin-bottom: 4px;
    }
    .total-value { 
      font-size: 24px;
      font-weight: 700;
    }
    .footer { 
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    @media print {
      .document { padding: 20px; }
      .feature { page-break-inside: avoid; }
    }
  `;

  // Add style-specific overrides
  if (style === 'startup') {
    return baseStyles + `
      .header { border-bottom-color: #10b981; }
      .section-title { border-bottom-color: #10b981; }
      .feature { border-left-color: #10b981; }
      .totals { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    `;
  } else if (style === 'enterprise') {
    return baseStyles + `
      body { font-family: 'Times New Roman', serif; }
      .header { border-bottom-color: #1e293b; border-bottom-width: 4px; }
      .section-title { border-bottom-color: #1e293b; }
      .feature { border-left-color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; }
    `;
  } else if (style === 'minimal') {
    return baseStyles + `
      .header { border-bottom: 1px solid #e2e8f0; }
      .section-title { border-bottom: 1px solid #e2e8f0; font-size: 16px; }
      .feature { background: transparent; border-left: 2px solid #cbd5e1; padding: 8px; }
      .totals { background: #f1f5f9; color: #0f172a; }
    `;
  }

  return baseStyles;
}

function generateHeader(invoice: Invoice, format: ExportFormat): string {
  const formatTitles: Record<ExportFormat, string> = {
    invoice: 'INVOICE',
    quotation: 'QUOTATION',
    'commercial-offer': 'COMMERCIAL OFFER',
    'technical-scope': 'TECHNICAL SCOPE OF WORK',
    contract: 'CONTRACT PROPOSAL',
    maintenance: 'MAINTENANCE & SUPPORT AGREEMENT',
  };

  return `
    <div class="header">
      <h1>${invoice.metadata.projectName}</h1>
      <div class="subtitle">${formatTitles[format]}</div>
      <div class="metadata">
        ${invoice.metadata.clientName ? `
          <div class="metadata-item">
            <span class="metadata-label">Client:</span>
            <span class="metadata-value">${invoice.metadata.clientName}</span>
          </div>
        ` : ''}
        <div class="metadata-item">
          <span class="metadata-label">Date:</span>
          <span class="metadata-value">${invoice.metadata.createdAt}</span>
        </div>
        ${invoice.metadata.validUntil ? `
          <div class="metadata-item">
            <span class="metadata-label">Valid Until:</span>
            <span class="metadata-value">${invoice.metadata.validUntil}</span>
          </div>
        ` : ''}
        <div class="metadata-item">
          <span class="metadata-label">Currency:</span>
          <span class="metadata-value">${invoice.metadata.currency}</span>
        </div>
      </div>
    </div>
  `;
}

function generateBody(invoice: Invoice, format: ExportFormat, includeOptional: boolean): string {
  let body = '<div class="body">';

  invoice.sections.forEach((section) => {
    const sectionFeatures = section.categories.flatMap((cat) =>
      cat.features.filter((f) => f.selected || (includeOptional && !f.required))
    );

    if (sectionFeatures.length === 0) return;

    body += `<div class="section">`;
    body += `<h2 class="section-title">${section.title}</h2>`;

    section.categories.forEach((category) => {
      const categoryFeatures = category.features.filter(
        (f) => f.selected || (includeOptional && !f.required)
      );

      if (categoryFeatures.length === 0) return;

      body += `<div class="category">`;
      body += `<h3 class="category-name">${category.name}</h3>`;

      categoryFeatures.forEach((feature) => {
        body += `
          <div class="feature">
            <div class="feature-header">
              <div class="feature-name">${feature.selected ? '✓' : '○'} ${feature.desc}</div>
              ${feature.required ? '<span class="feature-badge">Required</span>' : ''}
            </div>
            <div class="feature-detail">${feature.detail}</div>
            <div class="feature-meta">
              <span class="feature-hours">${feature.hours} hours</span>
              <span class="feature-price">${feature.price.toLocaleString()} ${invoice.metadata.currency}</span>
            </div>
          </div>
        `;
      });

      body += `</div>`;
    });

    body += `</div>`;
  });

  body += '</div>';
  return body;
}

function generateFooter(invoice: Invoice, totalHours: number, totalPrice: number): string {
  const estimatedWeeks = Math.ceil(totalHours / 40);
  const estimatedMonths = Math.ceil(estimatedWeeks / 4);

  return `
    <div class="totals">
      <h3>Project Summary</h3>
      <div class="totals-grid">
        <div class="total-item">
          <div class="total-label">Total Hours</div>
          <div class="total-value">${totalHours}h</div>
        </div>
        <div class="total-item">
          <div class="total-label">Total Price</div>
          <div class="total-value">${totalPrice.toLocaleString()} ${invoice.metadata.currency}</div>
        </div>
        <div class="total-item">
          <div class="total-label">Estimated Duration</div>
          <div class="total-value">${estimatedMonths} month${estimatedMonths !== 1 ? 's' : ''}</div>
        </div>
        <div class="total-item">
          <div class="total-label">Weekly Effort</div>
          <div class="total-value">${estimatedWeeks} weeks</div>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>Generated by Smart Project Builder on ${new Date().toLocaleDateString()}</p>
      <p style="margin-top: 8px; font-size: 11px; opacity: 0.7;">This document is for informational purposes and subject to revision.</p>
    </div>
  `;
}

// Export as printable HTML (opens in new window for printing)
export function exportAsPrintableHTML(invoice: Invoice, options: ExportOptions) {
  const html = generateHTMLExport(invoice, options);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Auto-trigger print dialog after a short delay
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  }
}

// Generate contract template
export function generateContractHTML(invoice: Invoice): string {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Contract - ${invoice.metadata.projectName}</title>
  <style>
    body { 
      font-family: 'Times New Roman', serif;
      line-height: 1.8;
      max-width: 800px;
      margin: 40px auto;
      padding: 40px;
      color: #1e293b;
    }
    h1 { text-align: center; margin-bottom: 40px; }
    h2 { margin-top: 32px; margin-bottom: 16px; }
    .clause { margin-bottom: 24px; }
    .parties { 
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin: 32px 0;
    }
    .signature-line {
      margin-top: 80px;
      border-top: 1px solid #000;
      padding-top: 8px;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>SOFTWARE DEVELOPMENT CONTRACT</h1>
  
  <div class="clause">
    <strong>Project:</strong> ${invoice.metadata.projectName}<br>
    <strong>Date:</strong> ${invoice.metadata.createdAt}
  </div>

  <h2>1. PARTIES</h2>
  <div class="parties">
    <div>
      <strong>Service Provider:</strong><br>
      [Company Name]<br>
      [Address]<br>
      [Contact Information]
    </div>
    <div>
      <strong>Client:</strong><br>
      ${invoice.metadata.clientName || '[Client Name]'}<br>
      [Address]<br>
      [Contact Information]
    </div>
  </div>

  <h2>2. SCOPE OF WORK</h2>
  <div class="clause">
    The Service Provider agrees to develop the following project as outlined:
    <ul>
      ${invoice.sections.map(section => `
        <li><strong>${section.title}</strong>
          <ul>
            ${section.categories.flatMap(cat => 
              cat.features.filter(f => f.selected).map(f => 
                `<li>${f.desc} - ${f.hours} hours</li>`
              )
            ).join('')}
          </ul>
        </li>
      `).join('')}
    </ul>
  </div>

  <h2>3. TIMELINE</h2>
  <div class="clause">
    Estimated project duration: ${Math.ceil(invoice.totals.totalHours / 40 / 4)} months<br>
    Total estimated hours: ${invoice.totals.totalHours} hours
  </div>

  <h2>4. COMPENSATION</h2>
  <div class="clause">
    Total project cost: ${invoice.totals.totalPrice.toLocaleString()} ${invoice.metadata.currency}
  </div>

  <h2>5. PAYMENT TERMS</h2>
  <div class="clause">
    Payment schedule to be agreed upon by both parties. Typical structure:
    <ul>
      <li>30% upon contract signing</li>
      <li>40% at project midpoint</li>
      <li>30% upon project completion</li>
    </ul>
  </div>

  <h2>6. INTELLECTUAL PROPERTY</h2>
  <div class="clause">
    Upon full payment, all intellectual property rights will transfer to the Client.
  </div>

  <h2>7. CONFIDENTIALITY</h2>
  <div class="clause">
    Both parties agree to maintain confidentiality of all proprietary information.
  </div>

  <h2>8. MAINTENANCE & SUPPORT</h2>
  <div class="clause">
    Post-launch support terms to be defined separately.
  </div>

  <h2>9. TERMINATION</h2>
  <div class="clause">
    Either party may terminate this agreement with 30 days written notice.
  </div>

  <div class="parties" style="margin-top: 60px;">
    <div>
      <div class="signature-line">
        Service Provider Signature
      </div>
    </div>
    <div>
      <div class="signature-line">
        Client Signature
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}
