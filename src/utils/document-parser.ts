import { Invoice, ParsedDocument } from '@/types/project';

// Validate JSON structure against expected schema
export function parseJSONDocument(jsonData: any): ParsedDocument {
  try {
    // Check if it matches our invoice schema
    if (!jsonData.metadata || !jsonData.sections || !Array.isArray(jsonData.sections)) {
      return {
        success: false,
        errors: ['Invalid JSON structure. Missing required fields: metadata, sections'],
        source: 'json',
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate metadata
    if (!jsonData.metadata.projectName) {
      errors.push('Missing project name in metadata');
    }
    if (!jsonData.metadata.currency) {
      warnings.push('Currency not specified, defaulting to USD');
      jsonData.metadata.currency = 'USD';
    }
    if (!jsonData.metadata.createdAt) {
      jsonData.metadata.createdAt = new Date().toISOString().split('T')[0];
    }

    // Validate sections
    jsonData.sections.forEach((section: any, idx: number) => {
      if (!section.title) {
        errors.push(`Section ${idx + 1}: Missing title`);
      }
      if (!section.categories || !Array.isArray(section.categories)) {
        errors.push(`Section ${idx + 1}: Missing or invalid categories`);
        return;
      }

      section.categories.forEach((category: any, catIdx: number) => {
        if (!category.name) {
          warnings.push(`Section ${idx + 1}, Category ${catIdx + 1}: Missing name`);
        }
        if (!category.features || !Array.isArray(category.features)) {
          errors.push(`Section ${idx + 1}, Category ${catIdx + 1}: Missing or invalid features`);
          return;
        }

        category.features.forEach((feature: any, featIdx: number) => {
          if (!feature.desc) {
            errors.push(
              `Section ${idx + 1}, Category ${catIdx + 1}, Feature ${featIdx + 1}: Missing description`
            );
          }
          if (feature.hours === undefined || feature.hours === null) {
            warnings.push(
              `Section ${idx + 1}, Category ${catIdx + 1}, Feature ${featIdx + 1}: Missing hours, defaulting to 0`
            );
            feature.hours = 0;
          }
          if (feature.price === undefined || feature.price === null) {
            warnings.push(
              `Section ${idx + 1}, Category ${catIdx + 1}, Feature ${featIdx + 1}: Missing price, defaulting to 0`
            );
            feature.price = 0;
          }
          if (feature.required === undefined) {
            feature.required = false;
          }
          if (feature.selected === undefined) {
            feature.selected = true;
          }
        });
      });
    });

    // Calculate totals if missing
    if (!jsonData.totals) {
      let totalHours = 0;
      let totalPrice = 0;
      jsonData.sections.forEach((section: any) => {
        section.categories.forEach((category: any) => {
          category.features.forEach((feature: any) => {
            totalHours += feature.hours || 0;
            totalPrice += feature.price || 0;
          });
        });
      });
      jsonData.totals = {
        totalHours,
        totalPrice,
        selectedHours: totalHours,
        selectedPrice: totalPrice,
      };
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
        warnings,
        source: 'json',
      };
    }

    return {
      success: true,
      invoice: jsonData as Invoice,
      warnings: warnings.length > 0 ? warnings : undefined,
      source: 'json',
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`],
      source: 'json',
    };
  }
}

// Parse PDF text (simplified - in production would use proper PDF parsing)
export function parsePDFDocument(text: string): ParsedDocument {
  try {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Try to detect if it's our system-generated PDF
    const isSystemPDF = detectSystemPDF(text);

    if (isSystemPDF) {
      // Use deterministic parsing for system PDFs
      return parseSystemPDF(text);
    } else {
      // Use heuristic parsing for external PDFs
      return parseExternalPDF(text);
    }
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`],
      source: 'pdf-external',
    };
  }
}

function detectSystemPDF(text: string): boolean {
  // Look for patterns that indicate our system-generated PDF
  const systemIndicators = [
    /DÉVELOPPEMENT MOBILE/i,
    /FRONTEND DEVELOPMENT/i,
    /BACKEND & API DEVELOPMENT/i,
    /Selected Items/i,
    /Total Hours:/i,
  ];

  let matchCount = 0;
  systemIndicators.forEach((pattern) => {
    if (pattern.test(text)) {
      matchCount++;
    }
  });

  // If at least 2 indicators match, consider it a system PDF
  return matchCount >= 2;
}

function parseSystemPDF(text: string): ParsedDocument {
  const warnings: string[] = [
    'PDF parsing is limited. For best results, export and import JSON files.',
  ];

  // Extract project name (usually at the top)
  const projectNameMatch = text.match(/^(.+?)(?:\n|Client:)/m);
  const projectName = projectNameMatch ? projectNameMatch[1].trim() : 'Imported Project';

  // Extract client name
  const clientMatch = text.match(/Client:\s*(.+)/i);
  const clientName = clientMatch ? clientMatch[1].trim() : undefined;

  // Try to parse sections
  const sections = [];
  const sectionMatches = text.matchAll(/^([A-Z\s&\/]+)$/gm);

  for (const match of sectionMatches) {
    const title = match[1].trim();
    if (title.length > 3 && title.length < 50) {
      sections.push({
        title,
        categories: [
          {
            name: 'Imported Features',
            features: [],
          },
        ],
      });
    }
  }

  // If no sections found, create a default one
  if (sections.length === 0) {
    sections.push({
      title: 'IMPORTED FEATURES',
      categories: [
        {
          name: 'Features',
          features: [],
        },
      ],
    });
  }

  // Try to extract features with hours and prices
  const featurePattern = /[☑☐]\s*(.+?)\n\s*(.+?)\n\s*(\d+)\s*h\s*(\d+[\d\s,]*)/g;
  const features = [];
  let featureMatch;

  while ((featureMatch = featurePattern.exec(text)) !== null) {
    const [, desc, detail, hours, price] = featureMatch;
    features.push({
      desc: desc.trim(),
      detail: detail.trim(),
      hours: parseInt(hours),
      price: parseInt(price.replace(/[\s,]/g, '')),
      required: true,
      selected: true,
      flag: 'imported' as const,
    });
  }

  // Distribute features across sections
  if (features.length > 0) {
    const featuresPerSection = Math.ceil(features.length / sections.length);
    sections.forEach((section, idx) => {
      const start = idx * featuresPerSection;
      const end = start + featuresPerSection;
      section.categories[0].features = features.slice(start, end);
    });
  }

  const invoice: Invoice = {
    metadata: {
      projectName,
      clientName,
      currency: 'USD',
      createdAt: new Date().toISOString().split('T')[0],
    },
    sections,
    totals: {
      totalHours: features.reduce((sum, f) => sum + f.hours, 0),
      totalPrice: features.reduce((sum, f) => sum + f.price, 0),
      selectedHours: features.reduce((sum, f) => sum + f.hours, 0),
      selectedPrice: features.reduce((sum, f) => sum + f.price, 0),
    },
  };

  return {
    success: true,
    invoice,
    warnings,
    source: 'pdf-system',
  };
}

function parseExternalPDF(text: string): ParsedDocument {
  const warnings: string[] = [
    'External PDF detected. Parsing is best-effort.',
    'Please review all extracted data carefully.',
  ];

  // Extract lines
  const lines = text.split('\n').filter((line) => line.trim().length > 0);

  // Try to find project name (usually first significant line)
  const projectName = lines[0] || 'Imported External Document';

  // Look for potential section headers (all caps, short lines)
  const sections = [];
  let currentSection = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Potential section header (all caps, reasonable length)
    if (
      trimmed === trimmed.toUpperCase() &&
      trimmed.length > 3 &&
      trimmed.length < 50 &&
      /^[A-Z\s&\/]+$/.test(trimmed)
    ) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: trimmed,
        categories: [
          {
            name: 'Extracted Items',
            features: [],
          },
        ],
      };
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  // If no sections detected, create a default one
  if (sections.length === 0) {
    sections.push({
      title: 'IMPORTED CONTENT',
      categories: [
        {
          name: 'Items',
          features: [
            {
              desc: 'Imported from external PDF',
              detail: 'Content extracted from uploaded document. Please review and edit.',
              hours: 0,
              price: 0,
              required: false,
              selected: true,
              flag: 'needs_review' as const,
            },
          ],
        },
      ],
    });
  }

  const invoice: Invoice = {
    metadata: {
      projectName,
      currency: 'USD',
      createdAt: new Date().toISOString().split('T')[0],
    },
    sections,
    totals: {
      totalHours: 0,
      totalPrice: 0,
      selectedHours: 0,
      selectedPrice: 0,
    },
  };

  return {
    success: true,
    invoice,
    warnings,
    source: 'pdf-external',
  };
}

// Parse DOCX/Text (simplified)
export function parseTextDocument(text: string): ParsedDocument {
  // For text documents, use similar logic to external PDF
  return parseExternalPDF(text);
}
