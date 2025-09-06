// Core types for the modular prompt system

export interface PromptToken {
  key: string;
  value: string;
  required?: boolean;
  defaultValue?: string;
  description?: string;
}

export interface PromptValidationRule {
  field: string;
  rule: 'required' | 'minLength' | 'maxLength' | 'pattern';
  value?: any;
  message: string;
}

export interface PromptMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  author?: string;
  created: Date;
  modified: Date;
}

export interface PromptComponent {
  type: 'text' | 'token' | 'conditional' | 'composite';
  content: string;
  tokens?: PromptToken[];
  conditions?: PromptCondition[];
  children?: PromptComponent[];
}

export interface PromptCondition {
  token: string;
  operator: 'exists' | 'equals' | 'not_equals' | 'contains';
  value?: string;
  then: PromptComponent;
  else?: PromptComponent;
}

export interface PromptTemplate {
  metadata: PromptMetadata;
  components: PromptComponent[];
  validationRules: PromptValidationRule[];
  variables: Record<string, any>;
}

export interface PromptResult {
  success: boolean;
  prompt: string;
  tokens: Record<string, string>;
  errors: string[];
  warnings: string[];
  metadata: {
    templateId: string;
    generatedAt: Date;
    tokenCount: number;
    characterCount: number;
  };
}

export interface PromptBuilderOptions {
  validateTokens?: boolean;
  strictMode?: boolean;
  maxLength?: number;
  includeMetadata?: boolean;
}

export type PromptStyle =
  | 'photorealistic'
  | 'cartoon'
  | 'anime'
  | 'digital-art'
  | 'sketch'
  | 'illustration'
  | 'ghibli'
  | '3d-render'
  | 'pixel-art'
  | 'watercolor';

export type PromptQuality =
  | 'low'
  | 'medium'
  | 'high'
  | 'ultra'
  | 'maximum';

export type PromptAspectRatio =
  | '1:1'
  | '4:3'
  | '3:4'
  | '16:9'
  | '9:16'
  | '21:9'
  | '9:21';