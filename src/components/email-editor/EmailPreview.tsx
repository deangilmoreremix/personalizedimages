import React from 'react';
import { Mail, Code, Copy, CheckSquare, Download } from 'lucide-react';

interface EmailPreviewProps {
  showEmailPreview: boolean;
  showHtmlCode: boolean;
  previewSize: 'desktop' | 'mobile';
  emailTemplate: string;
  tokens: Record<string, string>;
  image: string | null;
  emailSubject: string;
  linkText: string;
  linkUrl: string;
  emailBgColor: string;
  emailTextColor: string;
  emailAccentColor: string;
  emailWidth: number;
  generatedHtml: string;
  copiedToClipboard: boolean;
  onTogglePreview: () => void;
  onPreviewSizeChange: (size: 'desktop' | 'mobile') => void;
  onCopyHtml: () => void;
  onDownloadHtml: () => void;
}

const EmailPreview: React.FC<EmailPreviewProps> = ({
  showEmailPreview,
  showHtmlCode,
  previewSize,
  emailTemplate,
  tokens,
  image,
  emailSubject,
  linkText,
  linkUrl,
  emailBgColor,
  emailTextColor,
  emailAccentColor,
  emailWidth,
  generatedHtml,
  copiedToClipboard,
  onTogglePreview,
  onPreviewSizeChange,
  onCopyHtml,
  onDownloadHtml
}) => {
  return (
    <>
      {/* Preview Size Toggle */}
      {(showEmailPreview || showHtmlCode) && (
        <div className="mb-4 flex justify-end">
          <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
            <button
              className={`px-3 py-1 text-xs ${
                previewSize === 'desktop' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-700'
              }`}
              onClick={() => onPreviewSizeChange('desktop')}
            >
              Desktop
            </button>
            <button
              className={`px-3 py-1 text-xs ${
                previewSize === 'mobile' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-700'
              }`}
              onClick={() => onPreviewSizeChange('mobile')}
            >
              Mobile
            </button>
          </div>
        </div>
      )}

      {/* Email Preview */}
      {showEmailPreview && (
        <div
          className="mt-4 border border-gray-200 rounded-lg overflow-hidden"
          style={{
            maxWidth: previewSize === 'mobile' ? '375px' : '100%',
            margin: previewSize === 'mobile' ? '0 auto' : undefined
          }}
        >
          <div className="bg-gray-100 border-b border-gray-200 p-2 flex justify-between items-center">
            <div className="text-sm font-medium">Email Preview</div>
            <div className="text-xs text-gray-500">
              {previewSize === 'mobile' ? 'Mobile View (375px)' : 'Desktop View'}
            </div>
          </div>

          <div className="p-2" style={{ backgroundColor: emailBgColor }}>
            <div
              className="mx-auto p-4"
              style={{ maxWidth: `${emailWidth}px` }}
            >
              {emailTemplate === 'centered' && (
                <div className="text-center">
                  <h2 className="text-xl font-bold" style={{ color: emailTextColor }}>
                    Special Offer For {tokens['FIRSTNAME'] || 'You'}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We have a personalized offer just for you!
                  </p>

                  <div className="mb-4">
                    {image && (
                      <img
                        src={image}
                        alt="Personalized offer"
                        className="max-w-full rounded"
                      />
                    )}
                  </div>

                  <button
                    className="px-4 py-2 rounded"
                    style={{ backgroundColor: emailAccentColor, color: 'white' }}
                  >
                    {linkText}
                  </button>
                </div>
              )}

              {emailTemplate === 'leftAligned' && (
                <div>
                  <h2 className="text-xl font-bold" style={{ color: emailTextColor }}>
                    Hey {tokens['FIRSTNAME'] || 'there'}!
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Check out this special offer we've created just for you.
                  </p>

                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="md:w-1/2">
                      {image && (
                        <img
                          src={image}
                          alt="Personalized offer"
                          className="max-w-full rounded"
                        />
                      )}
                    </div>
                    <div className="md:w-1/2">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: emailTextColor }}>
                        Limited Time Offer
                      </h3>
                      <p className="text-gray-600 mb-4">
                        This exclusive offer is only available for a limited time. Take advantage before it expires!
                      </p>
                      <button
                        className="px-4 py-2 rounded"
                        style={{ backgroundColor: emailAccentColor, color: 'white' }}
                      >
                        {linkText}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {emailTemplate === 'announcement' && (
                <div className="text-center">
                  <div
                    className="p-4 rounded-lg mb-4"
                    style={{ backgroundColor: `${emailAccentColor}10` }}
                  >
                    <h2
                      className="text-xl font-bold"
                      style={{ color: emailAccentColor }}
                    >
                      Important Announcement
                    </h2>
                    <p style={{ color: emailAccentColor }}>
                      For {tokens['FIRSTNAME'] || 'our valued customer'}
                    </p>
                  </div>

                  <div className="mb-4">
                    {image && (
                      <img
                        src={image}
                        alt="Personalized announcement"
                        className="max-w-full rounded"
                      />
                    )}
                  </div>

                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-gray-700 mb-3">
                      Please review this important information
                    </p>
                    <button
                      className="px-4 py-2 rounded font-semibold"
                      style={{ backgroundColor: emailAccentColor, color: 'white' }}
                    >
                      {linkText}
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-gray-200 text-center text-gray-500 text-xs">
                <p>© 2025 Your Company. All rights reserved.</p>
                <p>You received this email because you signed up for our newsletter.</p>
                <p>
                  <a href="#" style={{ color: emailAccentColor }}>
                    Unsubscribe
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated HTML Code */}
      {showHtmlCode && (
        <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 border-b border-gray-200 p-2 flex justify-between items-center">
            <div className="text-sm font-medium flex items-center">
              <Code className="w-4 h-4 mr-1" />
              Generated HTML
            </div>
            <div className="flex gap-2">
              <button
                className={`text-xs px-2 py-1 rounded flex items-center ${
                  copiedToClipboard ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={onCopyHtml}
              >
                {copiedToClipboard ? (
                  <>
                    <CheckSquare className="w-3 h-3 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy HTML
                  </>
                )}
              </button>

              <button
                className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded flex items-center"
                onClick={onDownloadHtml}
              >
                <Download className="w-3 h-3 mr-1" />
                Download HTML
              </button>
            </div>
          </div>

          <div className="overflow-auto max-h-[300px] p-2 bg-gray-900 text-gray-100">
            <pre className="text-xs whitespace-pre-wrap"><code>{generatedHtml}</code></pre>
          </div>
        </div>
      )}
    </>
  );
};

export default EmailPreview;