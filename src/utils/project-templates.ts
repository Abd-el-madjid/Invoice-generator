import { Invoice, ProjectConfig, Section } from '@/types/project';

// Template generation based on domain, type, and complexity
export function generateProjectTemplate(config: ProjectConfig): Invoice {
  const { domain, projectType, complexity } = config;
  
  const metadata = {
    projectName: `${domain} ${projectType} Project`,
    currency: 'USD',
    createdAt: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    domain,
    projectType,
    complexity,
  };

  const sections = generateSections(config);
  const totals = calculateTotals(sections);

  return {
    metadata,
    sections,
    totals,
  };
}

function generateSections(config: ProjectConfig): Section[] {
  const { domain, projectType, complexity } = config;
  const sections: Section[] = [];

  // Common sections for all projects
  sections.push(generatePreliminaryStudySection(complexity));
  sections.push(generateUXUISection(complexity));

  // Add sections based on project type
  if (projectType.includes('Web')) {
    sections.push(generateFrontendSection(complexity, domain));
    sections.push(generateBackendSection(complexity, domain));
  }

  if (projectType.includes('Mobile')) {
    sections.push(generateMobileSection(complexity, domain));
  }

  if (projectType === 'Platform / Marketplace') {
    sections.push(generateMarketplaceSection(complexity));
  }

  if (projectType === 'AI-Powered System' || domain === 'AI') {
    sections.push(generateAISection(complexity));
  }

  // Common infrastructure and support sections
  sections.push(generateInfrastructureSection(complexity));
  sections.push(generateSecuritySection(complexity));
  sections.push(generateDocumentationSection(complexity));
  sections.push(generateMaintenanceSection(complexity));

  return sections;
}

function generatePreliminaryStudySection(complexity: string): Section {
  const baseHours = complexity === 'MVP' ? 20 : complexity === 'Standard' ? 40 : 60;
  
  return {
    title: 'PRELIMINARY STUDY & PLANNING',
    categories: [
      {
        name: 'Project Analysis',
        features: [
          {
            desc: 'Requirements Gathering',
            detail: 'Stakeholder interviews, user stories, functional requirements',
            hours: baseHours * 0.4,
            price: baseHours * 0.4 * 100,
            required: true,
            selected: true,
          },
          {
            desc: 'Technical Feasibility Study',
            detail: 'Architecture planning, technology stack selection',
            hours: baseHours * 0.3,
            price: baseHours * 0.3 * 100,
            required: true,
            selected: true,
          },
          {
            desc: 'Project Roadmap',
            detail: 'Milestones, timeline, delivery schedule',
            hours: baseHours * 0.3,
            price: baseHours * 0.3 * 100,
            required: true,
            selected: true,
          },
        ],
      },
    ],
  };
}

function generateUXUISection(complexity: string): Section {
  const baseHours = complexity === 'MVP' ? 40 : complexity === 'Standard' ? 80 : 120;
  
  return {
    title: 'UX/UI DESIGN',
    categories: [
      {
        name: 'User Experience Design',
        features: [
          {
            desc: 'User Research & Personas',
            detail: 'User interviews, persona creation, journey mapping',
            hours: baseHours * 0.2,
            price: baseHours * 0.2 * 90,
            required: complexity !== 'MVP',
            selected: complexity !== 'MVP',
          },
          {
            desc: 'Wireframing',
            detail: 'Low-fidelity wireframes for all key screens',
            hours: baseHours * 0.3,
            price: baseHours * 0.3 * 90,
            required: true,
            selected: true,
          },
          {
            desc: 'High-Fidelity UI Design',
            detail: 'Complete visual design, design system, components',
            hours: baseHours * 0.5,
            price: baseHours * 0.5 * 90,
            required: true,
            selected: true,
          },
        ],
      },
    ],
  };
}

function generateFrontendSection(complexity: string, domain: string): Section {
  const baseHours = complexity === 'MVP' ? 120 : complexity === 'Standard' ? 240 : 400;
  
  return {
    title: 'FRONTEND DEVELOPMENT',
    categories: [
      {
        name: 'Web Application (React)',
        features: [
          {
            desc: 'Authentication System',
            detail: 'Login, registration, password reset, social auth',
            hours: baseHours * 0.15,
            price: baseHours * 0.15 * 85,
            required: true,
            selected: true,
          },
          {
            desc: 'Core User Interface',
            detail: 'Dashboard, navigation, responsive layouts',
            hours: baseHours * 0.4,
            price: baseHours * 0.4 * 85,
            required: true,
            selected: true,
          },
          {
            desc: 'Data Management & Forms',
            detail: 'CRUD operations, form validation, data tables',
            hours: baseHours * 0.25,
            price: baseHours * 0.25 * 85,
            required: true,
            selected: true,
          },
          {
            desc: 'Advanced Features',
            detail: 'Search, filtering, notifications, real-time updates',
            hours: baseHours * 0.2,
            price: baseHours * 0.2 * 85,
            required: complexity !== 'MVP',
            selected: complexity !== 'MVP',
          },
        ],
      },
    ],
  };
}

function generateBackendSection(complexity: string, domain: string): Section {
  const baseHours = complexity === 'MVP' ? 100 : complexity === 'Standard' ? 200 : 350;
  
  return {
    title: 'BACKEND & API DEVELOPMENT',
    categories: [
      {
        name: 'Server & Database',
        features: [
          {
            desc: 'REST API Development',
            detail: 'RESTful endpoints, authentication, authorization',
            hours: baseHours * 0.4,
            price: baseHours * 0.4 * 95,
            required: true,
            selected: true,
          },
          {
            desc: 'Database Design & Implementation',
            detail: 'Schema design, migrations, optimization',
            hours: baseHours * 0.3,
            price: baseHours * 0.3 * 95,
            required: true,
            selected: true,
          },
          {
            desc: 'Business Logic & Services',
            detail: 'Core business rules, data processing, workflows',
            hours: baseHours * 0.3,
            price: baseHours * 0.3 * 95,
            required: true,
            selected: true,
          },
        ],
      },
    ],
  };
}

function generateMobileSection(complexity: string, domain: string): Section {
  const baseHours = complexity === 'MVP' ? 150 : complexity === 'Standard' ? 280 : 450;
  
  return {
    title: 'MOBILE APPLICATION DEVELOPMENT',
    categories: [
      {
        name: 'Mobile App (React Native)',
        features: [
          {
            desc: 'Authentication & Onboarding',
            detail: 'Login, registration, biometric auth, tutorials',
            hours: baseHours * 0.15,
            price: baseHours * 0.15 * 90,
            required: true,
            selected: true,
          },
          {
            desc: 'Core Mobile Features',
            detail: 'Navigation, screens, mobile-optimized UI',
            hours: baseHours * 0.5,
            price: baseHours * 0.5 * 90,
            required: true,
            selected: true,
          },
          {
            desc: 'Native Features',
            detail: 'Camera, geolocation, push notifications, offline mode',
            hours: baseHours * 0.25,
            price: baseHours * 0.25 * 90,
            required: complexity !== 'MVP',
            selected: complexity !== 'MVP',
          },
          {
            desc: 'App Store Deployment',
            detail: 'iOS and Android app store submission',
            hours: baseHours * 0.1,
            price: baseHours * 0.1 * 90,
            required: false,
            selected: false,
          },
        ],
      },
    ],
  };
}

function generateMarketplaceSection(complexity: string): Section {
  const baseHours = complexity === 'MVP' ? 80 : complexity === 'Standard' ? 150 : 250;
  
  return {
    title: 'MARKETPLACE FEATURES',
    categories: [
      {
        name: 'Marketplace Core',
        features: [
          {
            desc: 'Multi-User System',
            detail: 'Vendor/buyer roles, user profiles, verification',
            hours: baseHours * 0.3,
            price: baseHours * 0.3 * 100,
            required: true,
            selected: true,
          },
          {
            desc: 'Product/Service Listings',
            detail: 'Listing creation, search, filters, categories',
            hours: baseHours * 0.4,
            price: baseHours * 0.4 * 100,
            required: true,
            selected: true,
          },
          {
            desc: 'Payment Integration',
            detail: 'Payment gateway, escrow, commission handling',
            hours: baseHours * 0.3,
            price: baseHours * 0.3 * 100,
            required: true,
            selected: true,
          },
        ],
      },
    ],
  };
}

function generateAISection(complexity: string): Section {
  const baseHours = complexity === 'MVP' ? 60 : complexity === 'Standard' ? 120 : 200;
  
  return {
    title: 'AI & MACHINE LEARNING',
    categories: [
      {
        name: 'AI Features',
        features: [
          {
            desc: 'AI Model Integration',
            detail: 'LLM integration, API setup, prompt engineering',
            hours: baseHours * 0.4,
            price: baseHours * 0.4 * 120,
            required: true,
            selected: true,
          },
          {
            desc: 'Intelligent Features',
            detail: 'Recommendations, predictions, automated analysis',
            hours: baseHours * 0.4,
            price: baseHours * 0.4 * 120,
            required: true,
            selected: true,
          },
          {
            desc: 'Data Processing Pipeline',
            detail: 'Data collection, preprocessing, model training',
            hours: baseHours * 0.2,
            price: baseHours * 0.2 * 120,
            required: complexity !== 'MVP',
            selected: complexity !== 'MVP',
          },
        ],
      },
    ],
  };
}

function generateInfrastructureSection(complexity: string): Section {
  const baseHours = complexity === 'MVP' ? 20 : complexity === 'Standard' ? 40 : 60;
  
  return {
    title: 'INFRASTRUCTURE & HOSTING',
    categories: [
      {
        name: 'Cloud Infrastructure',
        features: [
          {
            desc: 'Cloud Deployment',
            detail: 'AWS/Azure/GCP setup, CI/CD pipeline',
            hours: baseHours * 0.5,
            price: baseHours * 0.5 * 95,
            required: true,
            selected: true,
          },
          {
            desc: 'Domain & SSL',
            detail: 'Domain configuration, SSL certificates',
            hours: baseHours * 0.2,
            price: baseHours * 0.2 * 95,
            required: true,
            selected: true,
          },
          {
            desc: 'Monitoring & Logging',
            detail: 'Application monitoring, error tracking, analytics',
            hours: baseHours * 0.3,
            price: baseHours * 0.3 * 95,
            required: complexity !== 'MVP',
            selected: complexity !== 'MVP',
          },
        ],
      },
    ],
  };
}

function generateSecuritySection(complexity: string): Section {
  const baseHours = complexity === 'MVP' ? 15 : complexity === 'Standard' ? 30 : 50;
  
  return {
    title: 'SECURITY & COMPLIANCE',
    categories: [
      {
        name: 'Security Implementation',
        features: [
          {
            desc: 'Security Audit',
            detail: 'Vulnerability assessment, penetration testing',
            hours: baseHours * 0.4,
            price: baseHours * 0.4 * 110,
            required: complexity !== 'MVP',
            selected: complexity !== 'MVP',
          },
          {
            desc: 'Data Protection',
            detail: 'Encryption, GDPR compliance, privacy policies',
            hours: baseHours * 0.4,
            price: baseHours * 0.4 * 110,
            required: true,
            selected: true,
          },
          {
            desc: 'Backup & Recovery',
            detail: 'Automated backups, disaster recovery plan',
            hours: baseHours * 0.2,
            price: baseHours * 0.2 * 110,
            required: true,
            selected: true,
          },
        ],
      },
    ],
  };
}

function generateDocumentationSection(complexity: string): Section {
  const baseHours = complexity === 'MVP' ? 20 : complexity === 'Standard' ? 40 : 60;
  
  return {
    title: 'DOCUMENTATION & TRAINING',
    categories: [
      {
        name: 'Documentation',
        features: [
          {
            desc: 'Technical Documentation',
            detail: 'API docs, architecture diagrams, developer guides',
            hours: baseHours * 0.5,
            price: baseHours * 0.5 * 80,
            required: true,
            selected: true,
          },
          {
            desc: 'User Manual',
            detail: 'End-user documentation, tutorials, FAQs',
            hours: baseHours * 0.3,
            price: baseHours * 0.3 * 80,
            required: complexity !== 'MVP',
            selected: complexity !== 'MVP',
          },
          {
            desc: 'Training Sessions',
            detail: 'Staff training, admin training, video tutorials',
            hours: baseHours * 0.2,
            price: baseHours * 0.2 * 80,
            required: false,
            selected: false,
          },
        ],
      },
    ],
  };
}

function generateMaintenanceSection(complexity: string): Section {
  const monthlyHours = complexity === 'MVP' ? 10 : complexity === 'Standard' ? 20 : 40;
  
  return {
    title: 'MAINTENANCE & SUPPORT',
    categories: [
      {
        name: 'Post-Launch Support (Monthly)',
        features: [
          {
            desc: 'Bug Fixes & Updates',
            detail: 'Monthly bug fixes, minor updates, compatibility',
            hours: monthlyHours * 0.5,
            price: monthlyHours * 0.5 * 85,
            required: false,
            selected: false,
          },
          {
            desc: 'Technical Support',
            detail: 'Email/chat support, issue resolution',
            hours: monthlyHours * 0.3,
            price: monthlyHours * 0.3 * 85,
            required: false,
            selected: false,
          },
          {
            desc: 'Performance Optimization',
            detail: 'Monthly performance reviews and optimizations',
            hours: monthlyHours * 0.2,
            price: monthlyHours * 0.2 * 85,
            required: false,
            selected: false,
          },
        ],
      },
    ],
  };
}

export function calculateTotals(sections: Section[]): { totalHours: number; totalPrice: number; selectedHours: number; selectedPrice: number } {
  let totalHours = 0;
  let totalPrice = 0;
  let selectedHours = 0;
  let selectedPrice = 0;

  sections.forEach((section) => {
    section.categories.forEach((category) => {
      category.features.forEach((feature) => {
        totalHours += feature.hours;
        totalPrice += feature.price;
        
        if (feature.selected) {
          selectedHours += feature.hours;
          selectedPrice += feature.price;
        }
      });
    });
  });

  return {
    totalHours: Math.round(totalHours),
    totalPrice: Math.round(totalPrice),
    selectedHours: Math.round(selectedHours),
    selectedPrice: Math.round(selectedPrice),
  };
}
