interface PersonalizationToken {
  key: string;
  displayName: string;
  description: string;
  category: TokenCategory;
  defaultValue?: string;
  isImplemented: boolean; // Flag to control whether token is active in the application
}

export type TokenCategory = 
  | 'basic'
  | 'location'
  | 'company'
  | 'social'
  | 'dates'
  | 'engagement'
  | 'campaign'
  | 'communication'
  | 'dynamic';

// Currently implemented tokens (already in the app)
const IMPLEMENTED_TOKENS: string[] = [
  'FIRSTNAME',
  'LASTNAME',
  'COMPANY',
  'EMAIL'
];

// All tokens, including future ones (inactive until approved)
export const PERSONALIZATION_TOKENS: PersonalizationToken[] = [
  // Basic Personal Information
  { key: 'FIRSTNAME', displayName: 'First Name', description: 'Customer\'s first name', category: 'basic', isImplemented: true },
  { key: 'LASTNAME', displayName: 'Last Name', description: 'Customer\'s last name', category: 'basic', isImplemented: true },
  { key: 'COMPANY', displayName: 'Company', description: 'Customer\'s company name', category: 'company', isImplemented: true },
  { key: 'EMAIL', displayName: 'Email', description: 'Customer\'s email address', category: 'basic', isImplemented: true },
  
  // Additional Basic Information (not implemented yet)
  { key: 'FULLNAME', displayName: 'Full Name', description: 'Complete name (first + last combined)', category: 'basic', isImplemented: false },
  { key: 'NICKNAME', displayName: 'Nickname', description: 'Preferred name or nickname', category: 'basic', isImplemented: false },
  { key: 'TITLE', displayName: 'Job Title', description: 'Job title or position (e.g., "Marketing Director")', category: 'company', isImplemented: false },
  { key: 'DEPARTMENT', displayName: 'Department', description: 'Department within company', category: 'company', isImplemented: false },
  { key: 'PHONE', displayName: 'Phone', description: 'Phone number', category: 'basic', isImplemented: false },
  { key: 'MOBILE', displayName: 'Mobile', description: 'Mobile number', category: 'basic', isImplemented: false },

  // Location-Based
  { key: 'CITY', displayName: 'City', description: 'User\'s city', category: 'location', isImplemented: false },
  { key: 'STATE', displayName: 'State/Province', description: 'User\'s state/province', category: 'location', isImplemented: false },
  { key: 'COUNTRY', displayName: 'Country', description: 'User\'s country', category: 'location', isImplemented: false },
  { key: 'ZIPCODE', displayName: 'ZIP/Postal Code', description: 'Postal/ZIP code', category: 'location', isImplemented: false },

  // Company Information
  { key: 'COMPANYSIZE', displayName: 'Company Size', description: 'Size of company (e.g., "10-50 employees")', category: 'company', isImplemented: false },
  { key: 'INDUSTRY', displayName: 'Industry', description: 'Industry sector', category: 'company', isImplemented: false },
  { key: 'WEBSITE', displayName: 'Website', description: 'Company website', category: 'company', isImplemented: false },
  { key: 'TEAMNAME', displayName: 'Team Name', description: 'Team or department name', category: 'company', isImplemented: false },
  { key: 'MANAGER', displayName: 'Manager', description: 'Manager\'s name', category: 'company', isImplemented: false },

  // Social Media & Online Presence
  { key: 'LINKEDIN', displayName: 'LinkedIn', description: 'LinkedIn profile', category: 'social', isImplemented: false },
  { key: 'TWITTER', displayName: 'Twitter/X', description: 'Twitter/X handle', category: 'social', isImplemented: false },
  { key: 'INSTAGRAM', displayName: 'Instagram', description: 'Instagram username', category: 'social', isImplemented: false },

  // Dates & Timing
  { key: 'DATE', displayName: 'Current Date', description: 'Current date (or campaign date)', category: 'dates', isImplemented: false },
  { key: 'BIRTHDAY', displayName: 'Birthday', description: 'User\'s birthday', category: 'dates', isImplemented: false },
  { key: 'JOINDATE', displayName: 'Join Date', description: 'When they became a customer', category: 'dates', isImplemented: false },
  { key: 'CURRENTMONTH', displayName: 'Current Month', description: 'Current month', category: 'dates', isImplemented: false },

  // Customer Engagement
  { key: 'MEMBERSHIP', displayName: 'Membership', description: 'Membership level/tier', category: 'engagement', isImplemented: false },
  { key: 'POINTS', displayName: 'Points', description: 'Loyalty points or rewards', category: 'engagement', isImplemented: false },
  { key: 'LASTPURCHASE', displayName: 'Last Purchase', description: 'Last purchase details', category: 'engagement', isImplemented: false },
  { key: 'TOTALSPENT', displayName: 'Total Spent', description: 'Total amount spent', category: 'engagement', isImplemented: false },

  // Campaign-Specific
  { key: 'DISCOUNT', displayName: 'Discount Code', description: 'Personalized discount code', category: 'campaign', isImplemented: false },
  { key: 'OFFEREXPIRY', displayName: 'Offer Expiry', description: 'Expiration date for an offer', category: 'campaign', isImplemented: false },
  { key: 'EVENTNAME', displayName: 'Event Name', description: 'Name of upcoming event', category: 'campaign', isImplemented: false },
  { key: 'REFERRALCODE', displayName: 'Referral Code', description: 'Custom referral code', category: 'campaign', isImplemented: false },

  // Communication
  { key: 'UNSUBSCRIBELINK', displayName: 'Unsubscribe Link', description: 'Unsubscribe link', category: 'communication', isImplemented: false },
  { key: 'MEETINGLINK', displayName: 'Meeting Link', description: 'Link to schedule a meeting', category: 'communication', isImplemented: false },

  // Dynamic/Calculated
  { key: 'DAYSLEFT', displayName: 'Days Left', description: 'Days remaining in trial/subscription', category: 'dynamic', isImplemented: false },
  { key: 'ACCOUNTAGE', displayName: 'Account Age', description: 'Customer tenure (in days/months/years)', category: 'dynamic', isImplemented: false }
];

// Helper function to get active tokens only
function getImplementedTokens(): PersonalizationToken[] {
  return PERSONALIZATION_TOKENS.filter(token => token.isImplemented);
}

// Helper to create a default token values object
export function createDefaultTokenValues(): Record<string, string> {
  const defaults: Record<string, string> = {};
  
  PERSONALIZATION_TOKENS.forEach(token => {
    if (token.isImplemented && token.defaultValue) {
      defaults[token.key] = token.defaultValue;
    }
  });
  
  // Set some initial values for the currently implemented tokens
  defaults['FIRSTNAME'] = 'Sarah';
  defaults['LASTNAME'] = 'Smith';
  defaults['COMPANY'] = 'Acme Inc';
  defaults['EMAIL'] = 'sarah@example.com';
  
  return defaults;
}

// Helper to get token display information by key
function getTokenInfo(key: string): PersonalizationToken | undefined {
  return PERSONALIZATION_TOKENS.find(token => token.key === key);
}

// Helper to categorize tokens
export function getTokensByCategory(): Record<TokenCategory, PersonalizationToken[]> {
  const result: Record<TokenCategory, PersonalizationToken[]> = {
    basic: [],
    location: [],
    company: [],
    social: [],
    dates: [],
    engagement: [],
    campaign: [],
    communication: [],
    dynamic: []
  };
  
  PERSONALIZATION_TOKENS.forEach(token => {
    result[token.category].push(token);
  });
  
  return result;
}

// Helper to display token in format expected by components
export function formatTokenForDisplay(key: string): string {
  return `[${key}]`;
}