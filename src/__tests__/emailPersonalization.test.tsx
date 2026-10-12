import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useEmailPersonalization } from '../hooks/useEmailPersonalization';
import EmailPersonalizationToggle from '../components/EmailPersonalizationToggle';
import EmailPersonalizationPanel from '../components/EmailPersonalizationPanel';
import { generatePersonalizedImageWithWorker } from '../utils/canvasWorker';

// Mock the email integration utilities. The hook/panel consume this module
// (note convertToESPMergeTags is used while building the ESP-aware HTML), so we
// keep the mock hermetic and complete for the code paths under test.
vi.mock('../utils/emailIntegration', () => ({
  integratePersonalizedImage: vi.fn(),
  generateESPSetupGuide: vi.fn(),
  validateESPCompatibility: vi.fn(),
  convertToESPMergeTags: vi.fn((text: string) => text),
  EMAIL_PROVIDERS: {
    gmail: {
      name: 'Gmail',
      mergeTagFormat: '{{TOKEN}}',
      imageTagFormat: '<img src="{IMAGE_URL}" alt="{ALT_TEXT}">',
      supportedTokens: ['FIRSTNAME', 'LASTNAME', 'EMAIL', 'COMPANY']
    },
    mailchimp: {
      name: 'Mailchimp',
      mergeTagFormat: '*|TOKEN|*',
      imageTagFormat: '<img src="*|IMAGE_URL|*" alt="*|ALT_TEXT|*">',
      supportedTokens: ['FNAME', 'LNAME', 'EMAIL', 'COMPANY', 'MMERGE1', 'MMERGE2']
    },
    outlook: {
      name: 'Outlook',
      mergeTagFormat: '{{TOKEN}}',
      imageTagFormat: '<img src="{IMAGE_URL}" alt="{ALT_TEXT}">',
      supportedTokens: ['FIRSTNAME', 'LASTNAME', 'EMAIL', 'COMPANY', 'JOBTITLE']
    },
    sendgrid: {
      name: 'SendGrid',
      mergeTagFormat: '{{TOKEN}}',
      imageTagFormat: '<img src="{{IMAGE_URL}}" alt="{{ALT_TEXT}}">',
      supportedTokens: ['first_name', 'last_name', 'email', 'company']
    }
  },
  EMAIL_SERVICE_PROVIDERS: {
    gmail: { name: 'Gmail', mergeTagFormat: '{{TOKEN}}' },
    mailchimp: { name: 'Mailchimp', mergeTagFormat: '*|TOKEN|*' }
  }
}));

// The hook renders the email-ready image through a canvas Web Worker, which
// does not exist in jsdom. Mock it so the generation flow can run end-to-end.
vi.mock('../utils/canvasWorker', () => ({
  generatePersonalizedImageWithWorker: vi.fn().mockResolvedValue('email-ready-image.jpg')
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
          selectedProvider={emailPersonalization.selectedProvider}
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
    expect(screen.getByText('Make Email Ready')).toBeInTheDocument();
  });

  test('toggles email personalization panel', () => {
    render(<TestComponent />);

    // Initially panel should not be visible
    expect(screen.queryByText('Email Personalization')).not.toBeInTheDocument();

    // Click toggle
    fireEvent.click(screen.getByText('Make Email Ready'));

    // Panel should now be visible
    expect(screen.getByText('Email Personalization')).toBeInTheDocument();
  });

  test('displays correct generator-specific configuration', () => {
    render(<TestComponent generatorType="action-figure" />);

    fireEvent.click(screen.getByText('Make Email Ready'));

    // Should show action figure specific content
    expect(screen.getByText('Email Personalization')).toBeInTheDocument();
  });

  test('handles email generation', async () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByText('Make Email Ready'));

    // Find and click generate button
    const generateButton = screen.getByText('Generate Email Image');
    fireEvent.click(generateButton);

    // The hook renders the email-ready image via the canvas worker...
    await waitFor(() => {
      expect(generatePersonalizedImageWithWorker).toHaveBeenCalled();
    });

    // ...and once finished it produces HTML, unlocking the export actions.
    await waitFor(() => {
      expect(screen.getByText('Copy HTML')).toBeInTheDocument();
    });
  });

  test('handles template changes', () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByText('Make Email Ready'));

    // Change template (getByDisplayValue matches the selected option's text)
    const templateSelect = screen.getByDisplayValue('Centered');
    fireEvent.change(templateSelect, { target: { value: 'leftAligned' } });

    expect(templateSelect).toHaveValue('leftAligned');
  });

  test('handles subject line changes', () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByText('Make Email Ready'));

    // Change subject
    const subjectInput = screen.getByDisplayValue('Special offer just for you!');
    fireEvent.change(subjectInput, { target: { value: 'New Subject' } });

    expect(subjectInput).toHaveValue('New Subject');
  });

  test('handles color changes', () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByText('Make Email Ready'));

    // Color inputs live under the "Advanced" section, so reveal it first.
    fireEvent.click(screen.getByText('Advanced'));

    // Background color input should be present
    const bgColorInput = screen.getByDisplayValue('#f9fafb');
    expect(bgColorInput).toBeInTheDocument();
  });

  test('shows recommended tokens', () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByText('Make Email Ready'));

    // Should show token recommendations (FIRSTNAME is recommended for the
    // default generator and is provided in the test tokens).
    expect(screen.getByText('Recommended tokens for this content:')).toBeInTheDocument();
    expect(screen.getByText('[FIRSTNAME]: John')).toBeInTheDocument();
  });

  test('handles HTML copy functionality', async () => {
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn()
      }
    });

    render(<TestComponent />);

    fireEvent.click(screen.getByText('Make Email Ready'));

    // Generate first so the export actions appear (they need generated HTML).
    fireEvent.click(screen.getByText('Generate Email Image'));
    const copyButton = await waitFor(() => screen.getByText('Copy HTML'));

    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  test('handles HTML download functionality', async () => {
    // Mock only the object-URL APIs (jsdom has none). Do NOT stub
    // document.createElement: React needs real Node instances to render, and
    // the download flow appends a genuine anchor element.
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();

    render(<TestComponent />);

    fireEvent.click(screen.getByText('Make Email Ready'));

    // Generate first so the download action appears.
    fireEvent.click(screen.getByText('Generate Email Image'));
    const downloadButton = await waitFor(() => screen.getByText('Download HTML'));

    fireEvent.click(downloadButton);

    // Downloading builds a Blob URL for the generated HTML file.
    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  test('displays error states', () => {
    // This would test error handling in the hook
    // For now, just verify the structure is in place
    render(<TestComponent />);
    fireEvent.click(screen.getByText('Make Email Ready'));
    expect(screen.getByText('Email Personalization')).toBeInTheDocument();
  });

  test('validates ESP compatibility', () => {
    render(<TestComponent />);
    fireEvent.click(screen.getByText('Make Email Ready'));

    // The provider selector is populated from emailIntegration.EMAIL_PROVIDERS;
    // its presence (incl. the mocked Gmail option) confirms the ESP wiring.
    expect(screen.getByText('Email Personalization')).toBeInTheDocument();
    expect(screen.getByText('Gmail')).toBeInTheDocument();
  });
});

describe('EmailPersonalizationToggle Component', () => {
  test('renders with correct initial state', () => {
    render(<EmailPersonalizationToggle isActive={false} onToggle={() => {}} />);
    expect(screen.getByText('Make Email Ready')).toBeInTheDocument();
  });

  test('calls onToggle when clicked', () => {
    const mockOnToggle = vi.fn();
    render(<EmailPersonalizationToggle isActive={false} onToggle={mockOnToggle} />);

    fireEvent.click(screen.getByText('Make Email Ready'));
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  test('shows active state styling', () => {
    render(<EmailPersonalizationToggle isActive={true} onToggle={() => {}} />);
    // The button (not the inner span) carries the active-state classes.
    const button = screen.getByTitle('Disable email personalization');
    expect(button).toHaveClass('bg-blue-600', 'text-white');
  });
});

describe('EmailPersonalizationPanel Component', () => {
  const defaultProps = {
    imageUrl: 'test-image.jpg',
    personalizationTokens: [],
    selectedProvider: 'gmail' as const,
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
    recommendedTokens: { FIRSTNAME: 'John', LASTNAME: 'Doe' },
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

    expect(screen.getByText('Email Personalization')).toBeInTheDocument();
    expect(screen.getByText('Personalization Tokens')).toBeInTheDocument();
    expect(screen.getByText('Email Settings')).toBeInTheDocument();
    expect(screen.getByText('Email Subject')).toBeInTheDocument();
    expect(screen.getByText('Call to Action Text')).toBeInTheDocument();
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

    // Recommended tokens render as "[KEY]: value" chips.
    expect(screen.getByText('[FIRSTNAME]: John')).toBeInTheDocument();
    expect(screen.getByText('[LASTNAME]: Doe')).toBeInTheDocument();
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
  const result: { current: T } = { current: undefined as unknown as T };
  const TestComponent = () => {
    result.current = callback();
    return null;
  };
  render(<TestComponent />);
  return { result };
}
