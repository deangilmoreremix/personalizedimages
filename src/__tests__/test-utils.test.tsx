import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ThemeProvider } from '../components/ui/ThemeProvider';

// Custom render function that includes all necessary providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <DndProvider backend={HTML5Backend}>
        {children}
      </DndProvider>
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock implementations for missing utilities
export const mockTokenReplacement = {
  replaceTokens: (template: string, tokens: Record<string, string>) => {
    let result = template;
    Object.entries(tokens).forEach(([key, value]) => {
      const regex = new RegExp(`\\[${key}\\]`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  }
};

export const mockValidation = {
  validateTokens: (tokens: Record<string, string>, required: string[]) => {
    const missing = required.filter(key => !tokens[key] || tokens[key].trim() === '');
    return {
      isValid: missing.length === 0,
      missingTokens: missing,
      validTokens: required.filter(key => tokens[key] && tokens[key].trim() !== '')
    };
  }
};

// Mock tokens for testing
export const mockTokens = {
  FIRSTNAME: 'John',
  LASTNAME: 'Doe',
  COMPANY: 'Acme Corp',
  EMAIL: 'john@acme.com',
  POSITION: 'Developer',
  PHONE: '555-0123'
};