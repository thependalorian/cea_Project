// Application Constants and Configuration
// Rule 14: Ensure application security and scalability

// === Community Focus Areas ===
export const CLIMATE_FOCUS_AREAS = [
  'solar_energy',
  'wind_energy',
  'energy_storage',
  'grid_modernization',
  'energy_efficiency',
  'electric_vehicles',
  'green_hydrogen',
  'carbon_capture',
  'sustainable_transportation',
  'green_building',
  'environmental_justice',
  'climate_adaptation',
  'clean_manufacturing',
  'renewable_energy_finance'
] as const;

// === Target Communities ===
export const TARGET_COMMUNITIES = [
  'veterans',
  'international_professionals', 
  'environmental_justice'
] as const;

// === User Types and Roles ===
export const USER_TYPES = ['user', 'partner', 'admin'] as const;
export const PARTNERSHIP_LEVELS = ['standard', 'premium', 'enterprise'] as const;
export const ORGANIZATION_TYPES = ['nonprofit', 'government', 'private', 'education'] as const;

// === Employment and Experience Levels ===
export const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contract', 'internship'] as const;
export const EXPERIENCE_LEVELS = ['entry_level', 'mid_level', 'senior_level'] as const;

// === Program and Content Types ===
export const PROGRAM_TYPES = ['certificate', 'degree', 'bootcamp', 'workshop', 'online_course'] as const;
export const CONTENT_TYPES = ['webpage', 'pdf', 'document', 'job_training', 'internship'] as const;
export const RESOURCE_DOMAINS = ['clean_energy', 'workforce_development', 'career_pathways', 'equity', 'policy'] as const;

// === File Upload Configuration ===
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ['.pdf', '.doc', '.docx', '.txt'] as const;

// === API Configuration ===
export const API_ENDPOINTS = {
  // v1 API Endpoints - Core System
  V1_INTERACTIVE_CHAT: '/api/v1/interactive-chat',
  V1_RESUME_ANALYSIS: '/api/v1/resume-analysis',
  V1_CAREER_SEARCH: '/api/v1/career-search',
  V1_CAREER_AGENT: '/api/v1/career-agent',
  V1_HUMAN_FEEDBACK: '/api/v1/human-feedback',
  V1_WORKFLOW_STATUS: '/api/v1/workflow-status',
  V1_HEALTH: '/api/v1/health',
  
  // v1 API Endpoints - Extended Features
  V1_SKILLS_TRANSLATE: '/api/v1/skills/translate',
  V1_JOBS_SEARCH: '/api/v1/jobs/search',
  V1_KNOWLEDGE: '/api/v1/knowledge',
  V1_PARTNERS: '/api/v1/partners',
  V1_SEARCH: '/api/v1/search',
  
  // Legacy endpoints (deprecated, use v1 equivalents)
  LEGACY_CHAT: '/api/chat', // Use V1_INTERACTIVE_CHAT instead
  LEGACY_SKILLS_TRANSLATION: '/api/skills-translation', // Use V1_SKILLS_TRANSLATE instead
} as const;

// === Search Configuration ===
export const DEFAULT_SEARCH_LIMIT = 10;
export const MAX_SEARCH_RESULTS = 50;
export const SIMILARITY_THRESHOLD = 0.7;

// === Military Branch Configurations ===
export const MILITARY_BRANCHES = {
  ARMY: 'army',
  NAVY: 'navy', 
  AIR_FORCE: 'air_force',
  MARINES: 'marines',
  COAST_GUARD: 'coast_guard',
  SPACE_FORCE: 'space_force'
} as const;

// === Massachusetts Credential Evaluation Partners ===
export const CREDENTIAL_AGENCIES = [
  {
    name: 'Center for Educational Documentation (CED)',
    location: 'Boston, MA',
    specialties: ['Academic Equivalency', 'Professional Licensing', 'CPA Examination'],
    website: 'https://www.cedevaluations.com/',
    contact: 'PO Box 170116, Boston, MA 02117'
  },
  {
    name: 'World Education Services (WES)',
    location: 'International',
    specialties: ['Academic Credentials', 'Digital Evaluations', 'iGPA Calculator'],
    website: 'https://www.wes.org/',
    contact: 'Digital Platform Available'
  }
] as const;

// === Success Metrics Thresholds ===
export const METRICS = {
  SKILLS_TRANSLATION_ACCURACY: 85,
  TRAINING_COMPLETION_RATE: 70,
  JOB_PLACEMENT_SUCCESS: 65,
  CLIMATE_READINESS_THRESHOLD: 60
} as const;

// === UI Configuration ===
export const UI_CONFIG = {
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  PAGINATION_SIZE: 20,
  CARD_GRID_COLUMNS: 3
} as const;

// === Error Messages ===
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
  INVALID_FILE_TYPE: `File type must be one of: ${ALLOWED_FILE_TYPES.join(', ')}`,
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  RESUME_NOT_FOUND: 'No resume found. Please upload a resume first.',
  PROCESSING_ERROR: 'Error processing your request. Please try again.'
} as const;

// === Feature Flags ===
export const FEATURE_FLAGS = {
  ENHANCED_CHAT: true,
  SKILLS_TRANSLATION: true,
  RESUME_ANALYSIS: true,
  PARTNER_PROFILES: true,
  SOCIAL_INTEGRATION: true,
  REAL_TIME_CHAT: false, // Disabled for initial release
  ADVANCED_ANALYTICS: false // Planned for future release
} as const; 