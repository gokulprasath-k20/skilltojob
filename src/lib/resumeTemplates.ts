// Resume templates configuration
export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  fontFamily: string;
  layout: 'single' | 'two-column';
  style: 'modern' | 'classic' | 'minimal' | 'creative' | 'executive';
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: 'modern',
    name: 'Modern Pro',
    description: 'Clean, contemporary design with colored header',
    accentColor: '#6c63ff',
    fontFamily: 'Inter, sans-serif',
    layout: 'single',
    style: 'modern',
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Bold, professional look for senior roles',
    accentColor: '#1e293b',
    fontFamily: 'Georgia, serif',
    layout: 'single',
    style: 'executive',
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Ultra-clean with maximum white space',
    accentColor: '#0f172a',
    fontFamily: 'Inter, sans-serif',
    layout: 'single',
    style: 'minimal',
  },
  {
    id: 'creative',
    name: 'Creative Bold',
    description: 'Stand out with bold typography and color',
    accentColor: '#a855f7',
    fontFamily: 'Inter, sans-serif',
    layout: 'two-column',
    style: 'creative',
  },
  {
    id: 'tech',
    name: 'Tech Dev',
    description: 'Optimized for software developers and engineers',
    accentColor: '#06b6d4',
    fontFamily: 'JetBrains Mono, monospace',
    layout: 'two-column',
    style: 'modern',
  },
  {
    id: 'gradient',
    name: 'Gradient Flow',
    description: 'Vibrant gradient accents for creative roles',
    accentColor: '#f59e0b',
    fontFamily: 'Inter, sans-serif',
    layout: 'single',
    style: 'creative',
  },
  {
    id: 'corporate',
    name: 'Corporate Blue',
    description: 'Traditional corporate style optimized for ATS',
    accentColor: '#2563eb',
    fontFamily: 'Calibri, sans-serif',
    layout: 'single',
    style: 'classic',
  },
  {
    id: 'green',
    name: 'Emerald Fresh',
    description: 'Fresh green accent for standout applications',
    accentColor: '#10b981',
    fontFamily: 'Inter, sans-serif',
    layout: 'single',
    style: 'modern',
  },
];

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  education: Array<{ school: string; degree: string; field: string; year: string; gpa?: string }>;
  experience: Array<{ company: string; role: string; duration: string; description: string[] }>;
  projects: Array<{ name: string; description: string; tech: string[]; link?: string }>;
  certifications: string[];
  links: { linkedin?: string; github?: string; website?: string };
}

export const EMPTY_RESUME: ResumeData = {
  name: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  skills: [],
  education: [{ school: '', degree: '', field: '', year: '', gpa: '' }],
  experience: [{ company: '', role: '', duration: '', description: [''] }],
  projects: [{ name: '', description: '', tech: [], link: '' }],
  certifications: [],
  links: { linkedin: '', github: '', website: '' },
};
