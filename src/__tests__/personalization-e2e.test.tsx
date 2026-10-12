/**
 * End-to-End Personalization Features Test
 * Tests that personalization components work correctly across all generators
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from './test-utils.test';
import { describe, it, expect, vi } from 'vitest';
import { mockTokenReplacement, mockValidation, mockTokens } from './test-utils.test';

// Mock the API calls
vi.mock('../utils/api', () => ({
  generateImageWithDalle: vi.fn().mockResolvedValue('mock-image-url'),
  generateImageWithGemini: vi.fn().mockResolvedValue('mock-image-url'),
  generateCartoonImage: vi.fn().mockResolvedValue('mock-cartoon-url'),
  generateGhibliStyleImage: vi.fn().mockResolvedValue('mock-ghibli-url'),
  generateMemeWithReference: vi.fn().mockResolvedValue('mock-meme-url'),
}));

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        }))
      }))
    }))
  }
}));

// Mock the email personalization hook
vi.mock('../hooks/useEmailPersonalization', () => ({
  useEmailPersonalization: () => ({
    isActive: false,
    toggle: vi.fn(),
    selectedProvider: 'gmail',
    template: 'centered',
    subject: 'Test Subject',
    linkText: 'View Offer',
    linkUrl: 'https://example.com',
    bgColor: '#f9fafb',
    textColor: '#111827',
    accentColor: '#4f46e5',
    width: 600,
    imageHeight: 400,
    personalizationTokens: [],
    recommendedTokens: [],
    tokenValidation: {
      validTokens: [],
      invalidTokens: [],
      providerName: 'Gmail',
      supportedTokens: []
    }
  })
}));

// Test data is imported from test-utils.test.tsx

describe('Personalization E2E Tests', () => {
  describe('PersonalizationPanel Component', () => {
    it('renders all personalization modes', async () => {
      const PersonalizationPanel = (await import('../components/PersonalizationPanel')).default;

      render(
        <PersonalizationPanel
          tokens={mockTokens}
          onTokensChange={vi.fn()}
          mode="basic"
          onModeChange={vi.fn()}
          showPreview={true}
        />
      );

      // Header + the three personalization mode switchers
      expect(screen.getByText('Personalization Studio')).toBeInTheDocument();
      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('Action Figure')).toBeInTheDocument();
      expect(screen.getByText('Advanced')).toBeInTheDocument();
      // Basic-mode token fields
      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Last Name')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
    });

    it('switches between personalization modes', async () => {
      const PersonalizationPanel = (await import('../components/PersonalizationPanel')).default;

      // Drive the panel's mode so we can exercise an actual mode switch.
      const ModeSwitcher: React.FC = () => {
        const [mode, setMode] = React.useState<'basic' | 'action-figure' | 'advanced'>('basic');
        return (
          <PersonalizationPanel
            tokens={mockTokens}
            onTokensChange={vi.fn()}
            mode={mode}
            onModeChange={setMode}
            showPreview={false}
          />
        );
      };

      render(<ModeSwitcher />);

      // Basic mode shows the base token fields
      expect(screen.getByText('First Name')).toBeInTheDocument();

      // Switch to action-figure mode
      fireEvent.click(screen.getByText('Action Figure'));

      // Action-figure specific content now renders
      expect(screen.getByText('Character Identity')).toBeInTheDocument();
    });

    it('displays token usage instructions', async () => {
      const UniversalPersonalizationPanel = (await import('../components/UniversalPersonalizationPanel')).default;

      render(
        <UniversalPersonalizationPanel
          initialContent="Test content"
          initialContentType="prompt-ai"
          onContentGenerated={vi.fn()}
        />
      );

      // Check token usage instructions (matches the Universal panel's editor hint)
      expect(
        screen.getByText(/insert personalization tokens like \[FIRSTNAME\] or \[EMAIL\]/i)
      ).toBeInTheDocument();
    });
  });

  describe('Token Replacement Functionality', () => {
    it('replaces tokens in text correctly', () => {
      // Test the replaceTokens utility function
      const template = 'Hello [FIRSTNAME] [LASTNAME] from [COMPANY]!';
      const result = mockTokenReplacement.replaceTokens(template, mockTokens);

      expect(result).toBe('Hello John Doe from Acme Corp!');
    });

    it('handles missing tokens gracefully', () => {
      const template = 'Hello [FIRSTNAME] [MISSING_TOKEN]!';
      const result = mockTokenReplacement.replaceTokens(template, mockTokens);

      expect(result).toBe('Hello John [MISSING_TOKEN]!');
    });

    it('handles empty token values', () => {
      const tokensWithEmpty = { ...mockTokens, FIRSTNAME: '' };
      const template = 'Hello [FIRSTNAME]!';
      const result = mockTokenReplacement.replaceTokens(template, tokensWithEmpty);

      expect(result).toBe('Hello !');
    });
  });

  describe('Generator Integration', () => {
    it('UnifiedImageDashboard renders without errors', async () => {
      const UnifiedImageDashboard = (await import('../components/UnifiedImageDashboard')).default;

      render(<UnifiedImageDashboard />);

      // Should render without crashing (dashboard header is always present)
      expect(screen.getByText('AI Image Studio')).toBeInTheDocument();
    });

    it('MemeGenerator includes personalization panel', async () => {
      const MemeGenerator = (await import('../components/MemeGenerator')).default;

      render(<MemeGenerator tokens={mockTokens} onMemeGenerated={vi.fn()} />);

      // The personalization toggle lives inside the AI-enhancement panel,
      // so enable that first, after which the toggle renders.
      fireEvent.click(screen.getByLabelText('Use AI Image Enhancement'));

      // Should have personalization toggle
      expect(screen.getByText('Show Personalization')).toBeInTheDocument();
    });

    it('CartoonImageGenerator includes personalization panel', async () => {
      const CartoonImageGenerator = (await import('../components/CartoonImageGenerator')).default;

      render(<CartoonImageGenerator tokens={mockTokens} onImageGenerated={vi.fn()} />);

      // Should have personalization toggle
      expect(screen.getByText('Show Personalization')).toBeInTheDocument();
    });

    it('GhibliImageGenerator includes personalization panel', async () => {
      const GhibliImageGenerator = (await import('../components/GhibliImageGenerator')).default;

      render(<GhibliImageGenerator tokens={mockTokens} onImageGenerated={vi.fn()} />);

      // Should have personalization toggle
      expect(screen.getByText('Show Personalization')).toBeInTheDocument();
    });
  });

  describe('Token Validation', () => {
    it('validates required tokens', () => {
      const result = mockValidation.validateTokens(mockTokens, ['FIRSTNAME', 'EMAIL']);

      expect(result.isValid).toBe(true);
      expect(result.missingTokens).toEqual([]);
    });

    it('identifies missing required tokens', () => {
      const incompleteTokens = { FIRSTNAME: 'John' }; // Missing EMAIL
      const result = mockValidation.validateTokens(incompleteTokens, ['FIRSTNAME', 'EMAIL']);

      expect(result.isValid).toBe(false);
      expect(result.missingTokens).toContain('EMAIL');
    });
  });

  describe('Performance', () => {
    it('token replacement is fast', () => {
      let largeTemplate = 'Hello [FIRSTNAME] [LASTNAME]! Welcome to [COMPANY] in [CITY], [COUNTRY]. Your email is [EMAIL] and your title is [TITLE].'.repeat(10);
      const largeTokens: Record<string, string> = { ...mockTokens };

      // Add more tokens for performance test
      for (let i = 0; i < 50; i++) {
        largeTokens[`TOKEN_${i}`] = `Value ${i}`;
        largeTemplate += ` [TOKEN_${i}]`;
      }

      const startTime = performance.now();
      const result = mockTokenReplacement.replaceTokens(largeTemplate, largeTokens);
      const endTime = performance.now();

      // Should complete in less than 50ms for reasonable performance
      expect(endTime - startTime).toBeLessThan(50);
      expect(result.length).toBeGreaterThan(500);
    });
  });
});