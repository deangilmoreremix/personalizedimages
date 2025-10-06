/**
 * Comprehensive Token System
 * All 88 personalization tokens with validation and formatting
 */

export interface TokenDefinition {
  key: string;
  label: string;
  category: string;
  description: string;
  placeholder: string;
  validator?: (value: string) => boolean;
  formatter?: (value: string) => string;
  computed?: (tokens: Record<string, string>) => string;
  required?: boolean;
  defaultValue?: string;
}

export const TOKEN_CATEGORIES = {
  PERSONAL: 'Personal Information',
  PROFESSIONAL: 'Professional Details',
  CONTACT: 'Contact Information',
  LOCATION: 'Location Details',
  COMPANY: 'Company Information',
  TEMPORAL: 'Date & Time',
  CUSTOM: 'Custom Fields',
  COMPUTED: 'Auto-Generated'
} as const;

export const ALL_TOKENS: TokenDefinition[] = [
  // Personal Information (8 tokens)
  {
    key: 'FIRSTNAME',
    label: 'First Name',
    category: TOKEN_CATEGORIES.PERSONAL,
    description: 'Individual first name',
    placeholder: 'John',
    required: true,
    validator: (value) => value.length >= 2
  },
  {
    key: 'LASTNAME',
    label: 'Last Name',
    category: TOKEN_CATEGORIES.PERSONAL,
    description: 'Individual last name',
    placeholder: 'Smith',
    required: true,
    validator: (value) => value.length >= 2
  },
  {
    key: 'FULLNAME',
    label: 'Full Name',
    category: TOKEN_CATEGORIES.COMPUTED,
    description: 'Auto-generated from first and last name',
    placeholder: 'John Smith',
    computed: (tokens) => `${tokens.FIRSTNAME || ''} ${tokens.LASTNAME || ''}`.trim()
  },
  {
    key: 'NICKNAME',
    label: 'Nickname',
    category: TOKEN_CATEGORIES.PERSONAL,
    description: 'Informal name or alias',
    placeholder: 'Johnny'
  },
  {
    key: 'MIDDLENAME',
    label: 'Middle Name',
    category: TOKEN_CATEGORIES.PERSONAL,
    description: 'Middle name or initial',
    placeholder: 'Michael'
  },
  {
    key: 'SUFFIX',
    label: 'Name Suffix',
    category: TOKEN_CATEGORIES.PERSONAL,
    description: 'Name suffix (Jr., Sr., III, etc.)',
    placeholder: 'Jr.'
  },
  {
    key: 'SALUTATION',
    label: 'Salutation',
    category: TOKEN_CATEGORIES.PERSONAL,
    description: 'Formal title (Mr., Ms., Dr., etc.)',
    placeholder: 'Mr.',
    defaultValue: 'Mr.'
  },
  {
    key: 'GENDER',
    label: 'Gender',
    category: TOKEN_CATEGORIES.PERSONAL,
    description: 'Gender identity',
    placeholder: 'Male/Female/Other'
  },

  // Professional Details (15 tokens)
  {
    key: 'TITLE',
    label: 'Job Title',
    category: TOKEN_CATEGORIES.PROFESSIONAL,
    description: 'Professional job title',
    placeholder: 'Senior Marketing Manager',
    required: true
  },
  {
    key: 'DEPARTMENT',
    label: 'Department',
    category: TOKEN_CATEGORIES.PROFESSIONAL,
    description: 'Department or division',
    placeholder: 'Marketing'
  },
  {
    key: 'ROLE',
    label: 'Role',
    category: TOKEN_CATEGORIES.PROFESSIONAL,
    description: 'Functional role',
    placeholder: 'Team Lead'
  },
  {
    key: 'LEVEL',
    label: 'Level',
    category: TOKEN_CATEGORIES.PROFESSIONAL,
    description: 'Seniority level',
    placeholder: 'Senior'
  },
  {
    key: 'MANAGER',
    label: 'Manager Name',
    category: TOKEN_CATEGORIES.PROFESSIONAL,
    description: 'Direct manager or supervisor',
    placeholder: 'Jane Doe'
  },
  {
    key: 'TEAM',
    label: 'Team Name',
    category: TOKEN_CATEGORIES.PROFESSIONAL,
    description: 'Team or group name',
    placeholder: 'Growth Team'
  },
  {
    key: 'EMPLOYEEID',
    label: 'Employee ID',
    category: TOKEN_CATEGORIES.PROFESSIONAL,
    description: 'Unique employee identifier',
    placeholder: 'EMP-12345'
  },
  {
    key: 'STARTDATE',
    label: 'Start Date',
    category: TOKEN_CATEGORIES.PROFESSIONAL,
    description: 'Employment start date',
    placeholder: '2020-01-15'
  },
  {
    key: 'YEARS_OF_SERVICE',
    label: 'Years of Service',
    category: TOKEN_CATEGORIES.COMPUTED,
    description: 'Auto-calculated tenure',
    placeholder: '3',
    computed: (tokens) => {
      if (!tokens.STARTDATE) return '0';
      const start = new Date(tokens.STARTDATE);
      const now = new Date();
      return Math.floor((now.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toString();
    }
  },
  {
    key: 'CERTIFICATIONS',
    label: 'Certifications',
    category: TOKEN_CATEGORIES.PROFESSIONAL,
    description: 'Professional certifications',
    placeholder: 'PMP, CSPO'
  },
  {
    key: 'SKILLS',
    label: 'Key Skills',
    category: TOKEN_CATEGORIES.PROFESSIONAL,
    description: 'Primary professional skills',
    placeholder: 'Leadership, Strategy, Analytics'
  },
  {
    key: 'EDUCATION',
    label: 'Education',
    category: TOKEN_CATEGORIES.PROFESSIONAL,
    description: 'Highest education level',
    placeholder: 'MBA from Harvard'
  },
  {
    key: 'AWARDS',
    label: 'Awards',
    category: TOKEN_CATEGORIES.PROFESSIONAL,
    description: 'Professional awards or recognition',
    placeholder: 'Employee of the Year 2023'
  },
  {
    key: 'PROJECTS',
    label: 'Key Projects',
    category: TOKEN_CATEGORIES.PROFESSIONAL,
    description: 'Notable projects',
    placeholder: 'Product Launch 2024'
  },
  {
    key: 'ACHIEVEMENTS',
    label: 'Achievements',
    category: TOKEN_CATEGORIES.PROFESSIONAL,
    description: 'Major accomplishments',
    placeholder: 'Increased revenue by 150%'
  },

  // Contact Information (10 tokens)
  {
    key: 'EMAIL',
    label: 'Email Address',
    category: TOKEN_CATEGORIES.CONTACT,
    description: 'Primary email address',
    placeholder: 'john.smith@company.com',
    required: true,
    validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  },
  {
    key: 'PERSONAL_EMAIL',
    label: 'Personal Email',
    category: TOKEN_CATEGORIES.CONTACT,
    description: 'Personal email address',
    placeholder: 'john@gmail.com',
    validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  },
  {
    key: 'PHONE',
    label: 'Phone Number',
    category: TOKEN_CATEGORIES.CONTACT,
    description: 'Primary phone number',
    placeholder: '+1-555-123-4567'
  },
  {
    key: 'MOBILE',
    label: 'Mobile Number',
    category: TOKEN_CATEGORIES.CONTACT,
    description: 'Mobile phone number',
    placeholder: '+1-555-987-6543'
  },
  {
    key: 'OFFICE_PHONE',
    label: 'Office Phone',
    category: TOKEN_CATEGORIES.CONTACT,
    description: 'Office phone number',
    placeholder: '+1-555-100-2000'
  },
  {
    key: 'EXTENSION',
    label: 'Extension',
    category: TOKEN_CATEGORIES.CONTACT,
    description: 'Phone extension',
    placeholder: 'x1234'
  },
  {
    key: 'FAX',
    label: 'Fax Number',
    category: TOKEN_CATEGORIES.CONTACT,
    description: 'Fax number',
    placeholder: '+1-555-100-2001'
  },
  {
    key: 'WEBSITE',
    label: 'Website',
    category: TOKEN_CATEGORIES.CONTACT,
    description: 'Personal or professional website',
    placeholder: 'https://johnsmith.com'
  },
  {
    key: 'LINKEDIN',
    label: 'LinkedIn',
    category: TOKEN_CATEGORIES.CONTACT,
    description: 'LinkedIn profile URL',
    placeholder: 'linkedin.com/in/johnsmith'
  },
  {
    key: 'SOCIAL_MEDIA',
    label: 'Social Media',
    category: TOKEN_CATEGORIES.CONTACT,
    description: 'Primary social media handle',
    placeholder: '@johnsmith'
  },

  // Location Details (15 tokens)
  {
    key: 'STREET',
    label: 'Street Address',
    category: TOKEN_CATEGORIES.LOCATION,
    description: 'Street address',
    placeholder: '123 Main Street'
  },
  {
    key: 'STREET2',
    label: 'Address Line 2',
    category: TOKEN_CATEGORIES.LOCATION,
    description: 'Apartment, suite, etc.',
    placeholder: 'Suite 100'
  },
  {
    key: 'CITY',
    label: 'City',
    category: TOKEN_CATEGORIES.LOCATION,
    description: 'City name',
    placeholder: 'San Francisco'
  },
  {
    key: 'STATE',
    label: 'State/Province',
    category: TOKEN_CATEGORIES.LOCATION,
    description: 'State or province',
    placeholder: 'California'
  },
  {
    key: 'STATE_ABBR',
    label: 'State Abbreviation',
    category: TOKEN_CATEGORIES.LOCATION,
    description: 'State abbreviation',
    placeholder: 'CA'
  },
  {
    key: 'ZIP',
    label: 'ZIP/Postal Code',
    category: TOKEN_CATEGORIES.LOCATION,
    description: 'ZIP or postal code',
    placeholder: '94102'
  },
  {
    key: 'COUNTRY',
    label: 'Country',
    category: TOKEN_CATEGORIES.LOCATION,
    description: 'Country name',
    placeholder: 'United States',
    defaultValue: 'United States'
  },
  {
    key: 'COUNTRY_CODE',
    label: 'Country Code',
    category: TOKEN_CATEGORIES.LOCATION,
    description: 'Two-letter country code',
    placeholder: 'US',
    defaultValue: 'US'
  },
  {
    key: 'REGION',
    label: 'Region',
    category: TOKEN_CATEGORIES.LOCATION,
    description: 'Geographic region',
    placeholder: 'West Coast'
  },
  {
    key: 'TIMEZONE',
    label: 'Timezone',
    category: TOKEN_CATEGORIES.LOCATION,
    description: 'Timezone',
    placeholder: 'PST',
    defaultValue: 'PST'
  },
  {
    key: 'OFFICE_LOCATION',
    label: 'Office Location',
    category: TOKEN_CATEGORIES.LOCATION,
    description: 'Office or building location',
    placeholder: 'HQ Building A'
  },
  {
    key: 'FLOOR',
    label: 'Floor',
    category: TOKEN_CATEGORIES.LOCATION,
    description: 'Building floor',
    placeholder: '5th Floor'
  },
  {
    key: 'DESK',
    label: 'Desk Number',
    category: TOKEN_CATEGORIES.LOCATION,
    description: 'Desk or workstation number',
    placeholder: 'Desk 42'
  },
  {
    key: 'LATITUDE',
    label: 'Latitude',
    category: TOKEN_CATEGORIES.LOCATION,
    description: 'Geographic latitude',
    placeholder: '37.7749'
  },
  {
    key: 'LONGITUDE',
    label: 'Longitude',
    category: TOKEN_CATEGORIES.LOCATION,
    description: 'Geographic longitude',
    placeholder: '-122.4194'
  },

  // Company Information (20 tokens)
  {
    key: 'COMPANY',
    label: 'Company Name',
    category: TOKEN_CATEGORIES.COMPANY,
    description: 'Company or organization name',
    placeholder: 'Acme Corporation',
    required: true
  },
  {
    key: 'COMPANY_LEGAL',
    label: 'Legal Company Name',
    category: TOKEN_CATEGORIES.COMPANY,
    description: 'Full legal company name',
    placeholder: 'Acme Corporation, Inc.'
  },
  {
    key: 'COMPANY_SHORT',
    label: 'Company Short Name',
    category: TOKEN_CATEGORIES.COMPANY,
    description: 'Abbreviated company name',
    placeholder: 'Acme'
  },
  {
    key: 'COMPANY_TAGLINE',
    label: 'Company Tagline',
    category: TOKEN_CATEGORIES.COMPANY,
    description: 'Company tagline or slogan',
    placeholder: 'Innovation at its finest'
  },
  {
    key: 'COMPANY_WEBSITE',
    label: 'Company Website',
    category: TOKEN_CATEGORIES.COMPANY,
    description: 'Company website URL',
    placeholder: 'https://acmecorp.com'
  },
  {
    key: 'COMPANY_EMAIL',
    label: 'Company Email',
    category: TOKEN_CATEGORIES.COMPANY,
    description: 'General company email',
    placeholder: 'info@acmecorp.com'
  },
  {
    key: 'COMPANY_PHONE',
    label: 'Company Phone',
    category: TOKEN_CATEGORIES.COMPANY,
    description: 'Main company phone number',
    placeholder: '+1-800-555-ACME'
  },
  {
    key: 'INDUSTRY',
    label: 'Industry',
    category: TOKEN_CATEGORIES.COMPANY,
    description: 'Industry or sector',
    placeholder: 'Technology'
  },
  {
    key: 'COMPANY_SIZE',
    label: 'Company Size',
    category: TOKEN_CATEGORIES.COMPANY,
    description: 'Number of employees',
    placeholder: '500-1000'
  },
  {
    key: 'FOUNDED_YEAR',
    label: 'Founded Year',
    category: TOKEN_CATEGORIES.COMPANY,
    description: 'Year company was founded',
    placeholder: '2010'
  },
  {
    key: 'COMPANY_ADDRESS',
    label: 'Company Address',
    category: TOKEN_CATEGORIES.COMPANY,
    description: 'Company headquarters address',
    placeholder: '123 Business Blvd, San Francisco, CA'
  },
  {
    key: 'CEO',
    label: 'CEO Name',
    category: TOKEN_CATEGORIES.COMPANY,
    description: 'Chief Executive Officer name',
    placeholder: 'Jane Doe'
  },
  {
    key: 'REVENUE',
    label: 'Revenue',
    category: TOKEN_CATEGORIES.COMPANY,
    description: 'Company revenue',
    placeholder: '$50M'
  },
  {
    key: 'STOCK_SYMBOL',
    label: 'Stock Symbol',
    category: TOKEN_CATEGORIES.COMPANY,
    description: 'Stock ticker symbol',
    placeholder: 'ACME'
  },
  {
    key: 'BRAND_COLOR',
    label: 'Brand Color',
    category: TOKEN_CATEGORIES.COMPANY,
    description: 'Primary brand color',
    placeholder: '#0066CC'
  },
  {
    key: 'LOGO_URL',
    label: 'Logo URL',
    category: TOKEN_CATEGORIES.COMPANY,
    description: 'Company logo image URL',
    placeholder: 'https://acmecorp.com/logo.png'
  },
  {
    key: 'MISSION',
    label: 'Mission Statement',
    category: TOKEN_CATEGORIES.COMPANY,
    description: 'Company mission',
    placeholder: 'To innovate and inspire'
  },
  {
    key: 'VALUES',
    label: 'Company Values',
    category: TOKEN_CATEGORIES.COMPANY,
    description: 'Core company values',
    placeholder: 'Integrity, Innovation, Excellence'
  },
  {
    key: 'PRODUCTS',
    label: 'Products/Services',
    category: TOKEN_CATEGORIES.COMPANY,
    description: 'Main products or services',
    placeholder: 'SaaS Platform, Consulting'
  },
  {
    key: 'TARGET_MARKET',
    label: 'Target Market',
    category: TOKEN_CATEGORIES.COMPANY,
    description: 'Primary target market',
    placeholder: 'Enterprise B2B'
  },

  // Date & Time (20 tokens)
  {
    key: 'DATE',
    label: 'Current Date',
    category: TOKEN_CATEGORIES.TEMPORAL,
    description: 'Current date',
    placeholder: '2024-01-15',
    computed: () => new Date().toISOString().split('T')[0]
  },
  {
    key: 'DATE_LONG',
    label: 'Date (Long Format)',
    category: TOKEN_CATEGORIES.TEMPORAL,
    description: 'Date in long format',
    placeholder: 'January 15, 2024',
    computed: () => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  },
  {
    key: 'DATE_SHORT',
    label: 'Date (Short Format)',
    category: TOKEN_CATEGORIES.TEMPORAL,
    description: 'Date in short format',
    placeholder: '01/15/24',
    computed: () => new Date().toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' })
  },
  {
    key: 'TIME',
    label: 'Current Time',
    category: TOKEN_CATEGORIES.TEMPORAL,
    description: 'Current time',
    placeholder: '14:30',
    computed: () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  },
  {
    key: 'TIME_12HR',
    label: 'Time (12-hour)',
    category: TOKEN_CATEGORIES.TEMPORAL,
    description: 'Time in 12-hour format',
    placeholder: '2:30 PM',
    computed: () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  },
  {
    key: 'DATETIME',
    label: 'Date & Time',
    category: TOKEN_CATEGORIES.TEMPORAL,
    description: 'Current date and time',
    placeholder: '2024-01-15 14:30',
    computed: () => new Date().toISOString().replace('T', ' ').substring(0, 16)
  },
  {
    key: 'YEAR',
    label: 'Current Year',
    category: TOKEN_CATEGORIES.TEMPORAL,
    description: 'Current year',
    placeholder: '2024',
    computed: () => new Date().getFullYear().toString()
  },
  {
    key: 'MONTH',
    label: 'Current Month',
    category: TOKEN_CATEGORIES.TEMPORAL,
    description: 'Current month number',
    placeholder: '1',
    computed: () => (new Date().getMonth() + 1).toString()
  },
  {
    key: 'MONTH_NAME',
    label: 'Month Name',
    category: TOKEN_CATEGORIES.TEMPORAL,
    description: 'Current month name',
    placeholder: 'January',
    computed: () => new Date().toLocaleDateString('en-US', { month: 'long' })
  },
  {
    key: 'MONTH_SHORT',
    label: 'Month (Short)',
    category: TOKEN_CATEGORIES.TEMPORAL,
    description: 'Month abbreviation',
    placeholder: 'Jan',
    computed: () => new Date().toLocaleDateString('en-US', { month: 'short' })
  },
  {
    key: 'DAY',
    label: 'Day of Month',
    category: TOKEN_CATEGORIES.TEMPORAL,
    description: 'Day of the month',
    placeholder: '15',
    computed: () => new Date().getDate().toString()
  },
  {
    key: 'DAY_NAME',
    label: 'Day Name',
    category: TOKEN_CATEGORIES.TEMPORAL,
    description: 'Day of the week name',
    placeholder: 'Monday',
    computed: () => new Date().toLocaleDateString('en-US', { weekday: 'long' })
  },
  {
    key: 'DAY_SHORT',
    label: 'Day (Short)',
    category: TOKEN_CATEGORIES.TEMPORAL,
    description: 'Day abbreviation',
    placeholder: 'Mon',
    computed: () => new Date().toLocaleDateString('en-US', { weekday: 'short' })
  },
  {
    key: 'QUARTER',
    label: 'Current Quarter',
    category: TOKEN_CATEGORIES.TEMPORAL,
    description: 'Current fiscal quarter',
    placeholder: 'Q1',
    computed: () => `Q${Math.floor(new Date().getMonth() / 3) + 1}`
  },
  {
    key: 'WEEK',
    label: 'Week Number',
    category: TOKEN_CATEGORIES.TEMPORAL,
    description: 'Week number of the year',
    placeholder: '3',
    computed: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const diff = now.getTime() - start.getTime();
      return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)).toString();
    }
  },
  {
    key: 'TIMESTAMP',
    label: 'Unix Timestamp',
    category: TOKEN_CATEGORIES.TEMPORAL,
    description: 'Unix timestamp',
    placeholder: '1705334400',
    computed: () => Math.floor(Date.now() / 1000).toString()
  },
  {
    key: 'ISO_DATE',
    label: 'ISO Date',
    category: TOKEN_CATEGORIES.TEMPORAL,
    description: 'ISO 8601 date format',
    placeholder: '2024-01-15T14:30:00Z',
    computed: () => new Date().toISOString()
  },
  {
    key: 'TOMORROW',
    label: 'Tomorrow',
    category: TOKEN_CATEGORIES.TEMPORAL,
    description: 'Tomorrow\'s date',
    placeholder: '2024-01-16',
    computed: () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
  },
  {
    key: 'YESTERDAY',
    label: 'Yesterday',
    category: TOKEN_CATEGORIES.TEMPORAL,
    description: 'Yesterday\'s date',
    placeholder: '2024-01-14',
    computed: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    }
  },
  {
    key: 'AGE',
    label: 'Age',
    category: TOKEN_CATEGORIES.PERSONAL,
    description: 'Person\'s age',
    placeholder: '35'
  }
];

// Helper functions
export function getTokenByKey(key: string): TokenDefinition | undefined {
  return ALL_TOKENS.find(token => token.key === key);
}

export function getTokensByCategory(category: string): TokenDefinition[] {
  return ALL_TOKENS.filter(token => token.category === category);
}

export function getRequiredTokens(): TokenDefinition[] {
  return ALL_TOKENS.filter(token => token.required);
}

export function getComputedTokens(): TokenDefinition[] {
  return ALL_TOKENS.filter(token => token.computed);
}

export function validateToken(key: string, value: string): boolean {
  const token = getTokenByKey(key);
  if (!token) return false;
  if (token.validator) return token.validator(value);
  return true;
}

export function formatToken(key: string, value: string): string {
  const token = getTokenByKey(key);
  if (!token) return value;
  if (token.formatter) return token.formatter(value);
  return value;
}

export function computeTokenValue(key: string, tokens: Record<string, string>): string {
  const token = getTokenByKey(key);
  if (!token || !token.computed) return tokens[key] || '';
  return token.computed(tokens);
}

export function computeAllTokens(tokens: Record<string, string>): Record<string, string> {
  const result = { ...tokens };

  getComputedTokens().forEach(token => {
    if (token.computed) {
      result[token.key] = token.computed(result);
    }
  });

  return result;
}

export function getTokensRecord(): Record<string, string> {
  const record: Record<string, string> = {};

  ALL_TOKENS.forEach(token => {
    if (token.defaultValue) {
      record[token.key] = token.defaultValue;
    } else if (token.computed) {
      record[token.key] = token.computed({});
    } else {
      record[token.key] = '';
    }
  });

  return record;
}
