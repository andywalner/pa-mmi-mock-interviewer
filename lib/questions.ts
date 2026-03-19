export const STATION_CONFIG = [
  { category: 'academic-integrity', timeLimit: 420 },
  { category: 'teamwork-conflict', timeLimit: 420 },
  { category: 'healthcare-policy', timeLimit: 420 },
  { category: 'professional-responsibility', timeLimit: 420 },
  { category: 'personal-motivation', timeLimit: 420 },
];

export const NUM_STATIONS = STATION_CONFIG.length;

export const CATEGORY_LABELS: Record<string, string> = {
  'academic-integrity': 'Academic Integrity',
  'teamwork-conflict': 'Teamwork & Conflict Resolution',
  'healthcare-policy': 'Healthcare Policy',
  'professional-responsibility': 'Professional Responsibility',
  'personal-motivation': 'Personal Motivation',
};
