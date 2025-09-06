// Token system types and definitions

export interface TokenDefinition {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  defaultValue?: any;
  description: string;
  examples: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    enum?: string[];
  };
}

export interface TokenGroup {
  name: string;
  description: string;
  tokens: TokenDefinition[];
  category: 'personal' | 'company' | 'technical' | 'creative' | 'system';
}

export interface TokenReplacementResult {
  original: string;
  replaced: string;
  tokensFound: string[];
  tokensReplaced: string[];
  errors: string[];
}

// Standard token groups
export const PERSONAL_TOKENS: TokenGroup = {
  name: 'Personal Information',
  description: 'User personal details for personalization',
  category: 'personal',
  tokens: [
    {
      key: 'FIRSTNAME',
      type: 'string',
      required: false,
      defaultValue: 'User',
      description: 'User first name',
      examples: ['John', 'Sarah', 'Mike'],
      validation: { minLength: 1, maxLength: 50 }
    },
    {
      key: 'LASTNAME',
      type: 'string',
      required: false,
      defaultValue: '',
      description: 'User last name',
      examples: ['Smith', 'Johnson', 'Williams'],
      validation: { minLength: 1, maxLength: 50 }
    },
    {
      key: 'FULLNAME',
      type: 'string',
      required: false,
      description: 'User full name (auto-generated from FIRSTNAME + LASTNAME)',
      examples: ['John Smith', 'Sarah Johnson'],
      validation: { minLength: 1, maxLength: 100 }
    }
  ]
};

export const COMPANY_TOKENS: TokenGroup = {
  name: 'Company Information',
  description: 'Company and business details',
  category: 'company',
  tokens: [
    {
      key: 'COMPANY',
      type: 'string',
      required: false,
      defaultValue: 'the company',
      description: 'Company name',
      examples: ['Acme Corp', 'Tech Solutions Inc'],
      validation: { minLength: 1, maxLength: 100 }
    },
    {
      key: 'INDUSTRY',
      type: 'string',
      required: false,
      description: 'Company industry',
      examples: ['Technology', 'Healthcare', 'Finance'],
      validation: { minLength: 1, maxLength: 50 }
    }
  ]
};

export const SYSTEM_TOKENS: TokenGroup = {
  name: 'System Tokens',
  description: 'Built-in system tokens',
  category: 'system',
  tokens: [
    {
      key: 'CURRENT_DATE',
      type: 'string',
      required: false,
      description: 'Current date in YYYY-MM-DD format',
      examples: ['2024-01-15'],
      validation: { pattern: /^\d{4}-\d{2}-\d{2}$/ }
    },
    {
      key: 'CURRENT_TIME',
      type: 'string',
      required: false,
      description: 'Current time in HH:MM format',
      examples: ['14:30', '09:15'],
      validation: { pattern: /^\d{2}:\d{2}$/ }
    }
  ]
};

// All available token groups
export const ALL_TOKEN_GROUPS: TokenGroup[] = [
  PERSONAL_TOKENS,
  COMPANY_TOKENS,
  SYSTEM_TOKENS
];

// Helper functions
export function getTokenDefinition(key: string): TokenDefinition | undefined {
  for (const group of ALL_TOKEN_GROUPS) {
    const token = group.tokens.find(t => t.key === key);
    if (token) return token;
  }
  return undefined;
}

export function getAllTokens(): TokenDefinition[] {
  return ALL_TOKEN_GROUPS.flatMap(group => group.tokens);
}

export function validateTokenValue(key: string, value: any): { valid: boolean; errors: string[] } {
  const definition = getTokenDefinition(key);
  if (!definition) {
    return { valid: false, errors: [`Unknown token: ${key}`] };
  }

  const errors: string[] = [];

  // Type validation
  if (typeof value !== definition.type && definition.type !== 'string') {
    errors.push(`Token ${key} must be of type ${definition.type}`);
  }

  // String-specific validations
  if (definition.type === 'string' && typeof value === 'string') {
    if (definition.validation?.minLength && value.length < definition.validation.minLength) {
      errors.push(`Token ${key} must be at least ${definition.validation.minLength} characters`);
    }
    if (definition.validation?.maxLength && value.length > definition.validation.maxLength) {
      errors.push(`Token ${key} must be at most ${definition.validation.maxLength} characters`);
    }
    if (definition.validation?.pattern && !definition.validation.pattern.test(value)) {
      errors.push(`Token ${key} format is invalid`);
    }
    if (definition.validation?.enum && !definition.validation.enum.includes(value)) {
      errors.push(`Token ${key} must be one of: ${definition.validation.enum.join(', ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}