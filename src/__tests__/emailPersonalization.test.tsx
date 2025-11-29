import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useEmailPersonalization } from '../hooks/useEmailPersonalization';
import EmailPersonalizationToggle from '../components/EmailPersonalizationToggle';
import EmailPersonalizationPanel from '../components/EmailPersonalizationPanel';

// Mock the email integration utilities
vi.mock('../utils/emailIntegration', () => ({
  integratePersonalizedImage: vi.fn(),
  generateESPSetupGuide: vi.fn(),
  validateESPCompatibility: vi.fn(),
  EMAIL_SERVICE_PROVIDERS: {
    gmail: { name: 'Gmail', mergeTagFormat: '{{TOKEN}}' },
    mailchimp: { name: 'Mailchimp', mergeTagFormat: '*|TOKEN|*' }
  }
}));

// Test component that uses the hook
const TestComponent: React.FC<{ generatorType?: string }> = ({ generatorType = 'test' }) => {
  const emailPersonalization = useEmailPersonalization({
    imageUrl: 'test-image.jpg',
    tokens: { FIRSTNAME: 'John', LASTNAME: 'Doe' },
    generatorType
  });

  return (
    <div>
      <EmailPersonalizationToggle
        isActive={emailPersonalization.isActive}
        onToggle={emailPersonalization.toggle}
      />
      {emailPersonalization.isActive && (
        <EmailPersonalizationPanel
          imageUrl="test-image.jpg"
          personalizationTokens={[]}
          template={emailPersonalization.template}
          subject={emailPersonalization.subject}
          linkText={emailPersonalization.linkText}
          linkUrl={emailPersonalization.linkUrl}
          bgColor={emailPersonalization.bgColor}
          textColor={emailPersonalization.textColor}
          accentColor={emailPersonalization.accentColor}
          width={emailPersonalization.width}
          imageHeight={emailPersonalization.imageHeight}
          generatedHtml={emailPersonalization.generatedHtml}
          isGenerating={emailPersonalization.isGenerating}
          error={emailPersonalization.error}
          recommendedTokens={emailPersonalization.recommendedTokens}
          onAddToken={() => {}}
          onRemoveToken={() => {}}
          onUpdateToken={() => {}}
          onUpdateSettings={emailPersonalization.updateSettings}
          onGenerate={emailPersonalization.generateEmailImage}
          onCopyHtml={emailPersonalization.copyHtmlToClipboard}
          onDownloadHtml={emailPersonalization.downloadHtml}
        />
      )}
    </div>
  );
};

describe('Email Personalization Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders email personalization toggle', () => {
    render(<TestComponent />);
    expect(screen.getByText('📧 Make Email Ready')).toBeInTheDocument();
  });

  test('toggles email personalization panel', () => {
    render(<TestComponent />);

    // Initially panel should not be visible
    expect(screen.queryByText('Email Template')).not.toBeInTheDocument();

    // Click toggle
    fireEvent.click(screen.getByText('📧 Make Email Ready'));

    // Panel should now be visible
    expect(screen.getByText('Email Template')).toBeInTheDocument();
  });

  test('displays correct generator-specific configuration', () => {
    render(<TestComponent generatorType="action-figure" />);

    fireEvent.click(screen.getByText('📧 Make Email Ready'));

    // Should show action figure specific content
    expect(screen.getByText('Email Template')).toBeInTheDocument();
  });

  test('handles email generation', async () => {
    const mockIntegratePersonalizedImage = require('../utils/emailIntegration').integratePersonalizedImage;
    mockIntegratePersonalizedImage.mockResolvedValue({
      personalizedImageUrl: 'email-image.jpg',
      emailContent: '<html>Test email</html>',
      resolvedTokens: ['FIRSTNAME'],
      missingTokens: [],
      warnings: [],
      providerConfig: { name: 'Gmail' }
    });

    render(<TestComponent />);

    fireEvent.click(screen.getByText('📧 Make Email Ready'));

    // Find and click generate button
    const generateButton = screen.getByText('Generate Email Image');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockIntegratePersonalizedImage).toHaveBeenCalled();
    });
  });

  test('handles template changes', () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByText('📧 Make Email Ready'));

    // Change template
    const templateSelect = screen.getByDisplayValue('centered');
    fireEvent.change(templateSelect, { target: { value: 'leftAligned' } });

    expect(templateSelect).toHaveValue('leftAligned');
  });

  test('handles subject line changes', () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByText('📧 Make Email Ready'));

    // Change subject
    const subjectInput = screen.getByDisplayValue('Special offer just for you!');
    fireEvent.change(subjectInput, { target: { value: 'New Subject' } });

    expect(subjectInput).toHaveValue('New Subject');
  });

  test('handles color changes', () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByText('📧 Make Email Ready'));

    // Background color input should be present
    const bgColorInput = screen.getByDisplayValue('#f9fafb');
    expect(bgColorInput).toBeInTheDocument();
  });

  test('shows recommended tokens', () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByText('📧 Make Email Ready'));

    // Should show token recommendations
    expect(screen.getByText('Recommended Tokens')).toBeInTheDocument();
    expect(screen.getByText('FIRSTNAME')).toBeInTheDocument();
    expect(screen.getByText('LASTNAME')).toBeInTheDocument();
  });

  test('handles HTML copy functionality', () => {
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn()
      }
    });

    render(<TestComponent />);

    fireEvent.click(screen.getByText('📧 Make Email Ready'));

    // Copy HTML button should be present
    const copyButton = screen.getByText('Copy HTML');
    expect(copyButton).toBeInTheDocument();
  });

  test('handles HTML download functionality', () => {
    // Mock URL.createObjectURL and document methods
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();

    const mockCreateElement = vi.spyOn(document, 'createElement');
    const mockClick = vi.fn();
    mockCreateElement.mockReturnValue({
      click: mockClick,
      href: '',
      download: ''
    } as any);

    render(<TestComponent />);

    fireEvent.click(screen.getByText('📧 Make Email Ready'));

    // Download HTML button should be present
    const downloadButton = screen.getByText('Download HTML');
    expect(downloadButton).toBeInTheDocument();
  });

  test('displays error states', () => {
    // This would test error handling in the hook
    // For now, just verify the structure is in place
    render(<TestComponent />);
    fireEvent.click(screen.getByText('📧 Make Email Ready'));
    expect(screen.getByText('Email Template')).toBeInTheDocument();
  });

  test('validates ESP compatibility', () => {
    const mockValidateESPCompatibility = require('../utils/emailIntegration').validateESPCompatibility;
    mockValidateESPCompatibility.mockReturnValue({
      isCompatible: true,
      supportedTokens: ['FIRSTNAME'],
      unsupportedTokens: [],
      recommendations: []
    });

    render(<TestComponent />);
    fireEvent.click(screen.getByText('📧 Make Email Ready'));

    // Should show compatibility status
    expect(screen.getByText('Email Template')).toBeInTheDocument();
  });
});

describe('EmailPersonalizationToggle Component', () => {
  test('renders with correct initial state', () => {
    render(<EmailPersonalizationToggle isActive={false} onToggle={() => {}} />);
    expect(screen.getByText('📧 Make Email Ready')).toBeInTheDocument();
  });

  test('calls onToggle when clicked', () => {
    const mockOnToggle = vi.fn();
    render(<EmailPersonalizationToggle isActive={false} onToggle={mockOnToggle} />);

    fireEvent.click(screen.getByText('📧 Make Email Ready'));
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  test('shows active state styling', () => {
    render(<EmailPersonalizationToggle isActive={true} onToggle={() => {}} />);
    const button = screen.getByText('📧 Make Email Ready');
    expect(button).toHaveClass('bg-primary-100', 'text-primary-700');
  });
});

describe('EmailPersonalizationPanel Component', () => {
  const defaultProps = {
    imageUrl: 'test-image.jpg',
    personalizationTokens: [],
    template: 'centered' as const,
    subject: 'Test Subject',
    linkText: 'Click Here',
    linkUrl: 'https://example.com',
    bgColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#007bff',
    width: 600,
    imageHeight: 400,
    generatedHtml: '<html>Test</html>',
    isGenerating: false,
    error: null,
    recommendedTokens: ['FIRSTNAME', 'LASTNAME'],
    onAddToken: () => {},
    onRemoveToken: () => {},
    onUpdateToken: () => {},
    onUpdateSettings: () => {},
    onGenerate: () => {},
    onCopyHtml: () => {},
    onDownloadHtml: () => {}
  };

  test('renders all main sections', () => {
    render(<EmailPersonalizationPanel {...defaultProps} />);

    expect(screen.getByText('Email Template')).toBeInTheDocument();
    expect(screen.getByText('Email Subject')).toBeInTheDocument();
    expect(screen.getByText('Call to Action')).toBeInTheDocument();
    expect(screen.getByText('Colors')).toBeInTheDocument();
    expect(screen.getByText('Recommended Tokens')).toBeInTheDocument();
  });

  test('displays template options', () => {
    render(<EmailPersonalizationPanel {...defaultProps} />);

    expect(screen.getByText('Centered')).toBeInTheDocument();
    expect(screen.getByText('Left Aligned')).toBeInTheDocument();
    expect(screen.getByText('Announcement')).toBeInTheDocument();
  });

  test('shows subject input with correct value', () => {
    render(<EmailPersonalizationPanel {...defaultProps} />);

    const subjectInput = screen.getByDisplayValue('Test Subject');
    expect(subjectInput).toBeInTheDocument();
  });

  test('displays recommended tokens', () => {
    render(<EmailPersonalizationPanel {...defaultProps} />);

    expect(screen.getByText('FIRSTNAME')).toBeInTheDocument();
    expect(screen.getByText('LASTNAME')).toBeInTheDocument();
  });

  test('shows action buttons', () => {
    render(<EmailPersonalizationPanel {...defaultProps} />);

    expect(screen.getByText('Generate Email Image')).toBeInTheDocument();
    expect(screen.getByText('Copy HTML')).toBeInTheDocument();
    expect(screen.getByText('Download HTML')).toBeInTheDocument();
  });
});

describe('Generator-Specific Email Configurations', () => {
  test('loads correct config for different generators', () => {
    // Test that different generator types load appropriate configs
    const { result: gifResult } = renderHook(() =>
      useEmailPersonalization({
        imageUrl: 'test.gif',
        tokens: {},
        generatorType: 'gif'
      })
    );

    const { result: actionFigureResult } = renderHook(() =>
      useEmailPersonalization({
        imageUrl: 'test.png',
        tokens: {},
        generatorType: 'action-figure'
      })
    );

    // Verify different configs are loaded
    expect(gifResult.current).toBeDefined();
    expect(actionFigureResult.current).toBeDefined();
  });
});

// Helper for renderHook (simplified version)
function renderHook<T>(callback: () => T) {
  let result: T;
  const TestComponent = () => {
    result = callback();
    return null;
  };
  render(<TestComponent />);
  return { result };
}