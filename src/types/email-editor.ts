/**
 * Comprehensive TypeScript types for the Email Image Editor
 */

export interface PersonalizationToken {
  id: string;
  type: 'text' | 'image';
  value: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  opacity?: number;
  fontFamily?: string;
  placeholder?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  type: 'centered' | 'leftAligned' | 'announcement' | 'custom';
  preview: string;
}

export interface EmailSettings {
  template: string;
  subject: string;
  linkText: string;
  linkUrl: string;
  width: number;
  height: number;
  bgColor: string;
  textColor: string;
  accentColor: string;
  responsive: boolean;
}

export interface ColorPickerState {
  type: 'bg' | 'text' | 'accent' | 'token' | null;
  tokenId?: string;
}

export interface DragState {
  isDragging: boolean;
  activeToken: string | null;
  startPos: { x: number; y: number };
}

export interface EmailImageEditorProps {
  tokens: Record<string, string>;
  onImageGenerated?: (imageUrl: string) => void;
}

export interface EmailImageEditorState {
  image: string | null;
  personalizationTokens: PersonalizationToken[];
  activeToken: string | null;
  isDragging: boolean;
  showColorPicker: boolean;
  emailTemplate: string;
  showHtmlCode: boolean;
  generatedHtml: string;
  showAdvancedOptions: boolean;
  emailWidth: number;
  isResponsive: boolean;
  previewSize: 'desktop' | 'mobile';
  imageHeight: number;
  emailBgColor: string;
  emailTextColor: string;
  emailAccentColor: string;
  emailSubject: string;
  linkUrl: string;
  linkText: string;
  showEmailPreview: boolean;
  copiedToClipboard: boolean;
  error: string | null;
}

export interface CanvasWorkerMessage {
  type: 'generatePersonalizedImage';
  imageUrl: string;
  tokens: Record<string, string>;
  personalizationTokens: PersonalizationToken[];
}

export interface CanvasWorkerResponse {
  type: 'success' | 'error';
  imageUrl?: string;
  error?: string;
}

export type EmailTemplateType = 'centered' | 'leftAligned' | 'announcement';

export interface TemplateConfig {
  type: EmailTemplateType;
  title: string;
  description: string;
  preview: string;
}

export interface FontOption {
  name: string;
  value: string;
  category: 'web-safe' | 'google-fonts';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}